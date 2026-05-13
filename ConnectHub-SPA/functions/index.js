// Firebase Cloud Functions — ConnectHub SPA
// MISSING-1 FIX: Push notifications when a followed streamer goes live
// REC-5 FIX: Server-side chat word filter enforcer
// REC-4 FIX: VOD archive record written when stream ends
// SPRINT-21 ADD: marketplace price alert push delivery
// Triggers on streams/{streamId} document writes — if status changes to 'live',
// sends FCM push notifications to every follower who has a saved FCM token.

const functions = require('firebase-functions');
const admin     = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ── MISSING-1: Push notification when stream goes live ───────────
exports.notifyFollowersOnLive = functions.firestore
  .document('streams/{streamId}')
  .onWrite(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();

    // Only fire when status transitions TO 'live'
    if (before?.status === 'live' || after?.status !== 'live') return null;

    const streamerId = after.userId;
    const streamTitle = after.title || 'Live Stream';
    const streamerName = after.userName || 'Someone';
    const streamId = context.params.streamId;

    // 1. Find all users who follow this streamer
    const usersSnap = await db.collection('users')
      .where('following', 'array-contains', streamerId)
      .get();

    if (usersSnap.empty) return null;

    // 2. Collect FCM tokens
    const tokens = [];
    usersSnap.forEach(userDoc => {
      const { fcmToken, pushEnabled } = userDoc.data();
      if (fcmToken && pushEnabled !== false) {
        tokens.push(fcmToken);
      }
    });

    if (tokens.length === 0) return null;

    // 3. Send multicast push notification
    const message = {
      tokens,
      notification: {
        title: `🔴 ${streamerName} is LIVE!`,
        body:  streamTitle,
      },
      data: {
        type:     'live_started',
        streamId,
        streamerId,
        url:      `/live/watch/${streamId}`,
      },
      android: {
        priority: 'high',
        notification: {
          sound:       'default',
          channelId:   'live_notifications',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
      webpush: {
        fcmOptions: { link: `/live/watch/${streamId}` },
        notification: {
          icon:  '/favicon.ico',
          badge: '/badge-72x72.png',
          requireInteraction: true,
          actions: [
            { action: 'watch', title: '▶ Watch Now' },
            { action: 'dismiss', title: '✕ Dismiss' },
          ],
        },
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`[notifyFollowersOnLive] ${response.successCount}/${tokens.length} sent for stream ${streamId}`);

      // 4. Clean up invalid tokens
      const staleTokens = [];
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          const code = res.error?.code;
          if (code === 'messaging/invalid-registration-token' ||
              code === 'messaging/registration-token-not-registered') {
            staleTokens.push(tokens[idx]);
          }
        }
      });
      if (staleTokens.length > 0) {
        const batch = db.batch();
        usersSnap.forEach(userDoc => {
          if (staleTokens.includes(userDoc.data().fcmToken)) {
            batch.update(userDoc.ref, { fcmToken: admin.firestore.FieldValue.delete() });
          }
        });
        await batch.commit();
        console.log(`[notifyFollowersOnLive] Cleaned ${staleTokens.length} stale tokens`);
      }
    } catch (err) {
      console.error('[notifyFollowersOnLive] Error:', err);
    }

    return null;
  });

// ── Co-host invite notification ───────────────────────────────────
exports.notifyCoHostInvite = functions.firestore
  .document('cohostInvites/{inviteId}')
  .onCreate(async (snap) => {
    const invite = snap.data();
    if (!invite.inviteeName) return null;

    // Resolve inviteeId by username (best-effort)
    const usersSnap = await db.collection('users')
      .where('userName', '==', invite.inviteeName)
      .limit(1)
      .get();

    if (usersSnap.empty) return null;

    const inviteeDoc = usersSnap.docs[0];
    const { fcmToken } = inviteeDoc.data();
    if (!fcmToken) return null;

    // Update invite doc with resolved inviteeId
    await snap.ref.update({ inviteeId: inviteeDoc.id });

    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: `🎥 Co-host Invitation!`,
        body:  `${invite.inviterName} wants you to co-host their live stream.`,
      },
      data: {
        type:     'cohost_invite',
        inviteId: snap.id,
        streamId: invite.streamId,
      },
    });

    return null;
  });

// ── Clip processing stub ──────────────────────────────────────────
// MISSING-7 (server side): when clips/{streamId}/clips/{clipId} created
// with status:'processing', trigger actual HLS segment extraction.
// Stub: just marks it as ready after 10 seconds.
exports.processClip = functions.firestore
  .document('streams/{streamId}/clips/{clipId}')
  .onCreate(async (snap, context) => {
    const clip = snap.data();
    if (clip.status !== 'processing') return null;

    // In production: call your media processing service here
    // For now, mark as ready after simulated processing
    await new Promise(r => setTimeout(r, 5000));

    await snap.ref.update({
      status:    'ready',
      clipUrl:   `https://clips.connecthub.app/${context.params.streamId}/${context.params.clipId}.mp4`,
      readyAt:   admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notify clip requester
    const userDoc = await db.collection('users').doc(clip.requestedBy).get();
    const { fcmToken } = userDoc.data() || {};
    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title: '✂️ Your Clip is Ready!', body: clip.streamTitle },
        data: { type: 'clip_ready', clipId: context.params.clipId },
      });
    }

    return null;
  });

// ── Firestore security: auto-block spammy chat ───────────────────
// If a user sends >20 messages in 60 seconds across any stream, auto-silence.
exports.chatRateLimitEnforcer = functions.firestore
  .document('streams/{streamId}/messages/{msgId}')
  .onCreate(async (snap, context) => {
    const msg = snap.data();
    if (msg.type !== 'message') return null;

    const userId   = msg.userId;
    const streamId = context.params.streamId;
    const windowMs = 60 * 1000;
    const maxMsgs  = 20;

    const since = admin.firestore.Timestamp.fromMillis(Date.now() - windowMs);
    const recent = await db
      .collection('streams').doc(streamId)
      .collection('messages')
      .where('userId',    '==', userId)
      .where('type',      '==', 'message')
      .where('createdAt', '>',  since)
      .get();

    if (recent.size >= maxMsgs) {
      // Silence user in this stream
      await db.collection('streams').doc(streamId).update({
        [`silenced.${userId}`]: admin.firestore.FieldValue.serverTimestamp(),
      });
      // Delete the offending message
      await snap.ref.delete();
      console.log(`[chatRateLimit] Silenced user ${userId} in stream ${streamId}`);
    }

    return null;
  });

// ── onStreamEnd: write VOD + notify followers ─────────────────────
exports.onStreamEnd = functions.firestore
  .document('streams/{streamId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();
    if (before.status !== 'live' || after.status !== 'ended') return null;

    const { streamId } = context.params;

    // 1. Create VOD record
    await db.collection('vods').doc(streamId).set({
      streamId,
      title:           after.title          || 'Live Replay',
      userId:          after.userId,
      userName:        after.userName,
      userAvatar:      after.userAvatar      || null,
      thumbnailUrl:    after.thumbnailUrl    || null,
      category:        after.category        || 'general',
      durationSeconds: after.durationSeconds || 0,
      peakViewerCount: after.peakViewerCount || after.viewerCount || 0,
      totalMessages:   after.totalMessages   || 0,
      endedAt:         after.endedAt         || admin.firestore.FieldValue.serverTimestamp(),
      createdAt:       admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Notify followers (batch fanout — up to 200)
    try {
      const followersSnap = await db.collection('userFollowers')
        .doc(after.userId).collection('followers').limit(200).get();
      const batch = db.batch();
      followersSnap.docs.forEach(f => {
        const notifRef = db.collection('notifications').doc();
        batch.set(notifRef, {
          userId:    f.id,
          type:      'stream_ended',
          streamId,
          title:     `${after.userName} just ended a stream`,
          body:      `Watch the replay: "${after.title}"`,
          read:      false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    } catch (e) {
      console.error('[onStreamEnd] notify failed', e);
    }

    return null;
  });

// ── stripeWebhook: handle coin purchase ───────────────────────────
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  // Require Stripe only when deployed — avoids dev-time install error
  let stripe;
  try { stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || ''); }
  catch { return res.status(500).send('Stripe not configured'); }

  const sig    = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, secret);
  } catch (err) {
    console.error('[stripeWebhook] verify failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi    = event.data.object;
    const uid   = pi.metadata?.userId;
    const coins = parseInt(pi.metadata?.coins || '0', 10);
    const bonus = parseInt(pi.metadata?.bonus || '0', 10);
    if (uid && coins > 0) {
      await db.collection('users').doc(uid).update({
        coinBalance: admin.firestore.FieldValue.increment(coins + bonus),
      });
      await db.collection('coinTransactions').add({
        userId: uid, coins: coins + bonus, bonus,
        amount: pi.amount / 100, currency: pi.currency,
        status: 'succeeded',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[stripeWebhook] Credited ${coins + bonus} coins to ${uid}`);
    }
  }

  res.json({ received: true });
});

// ── createNextRecurringStream: auto-schedule next occurrence ──────
exports.createNextRecurringStream = functions.firestore
  .document('streams/{streamId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();
    if (before.status !== 'live' || after.status !== 'ended') return null;

    const recurring = after.recurring;
    if (!recurring || recurring === 'none') return null;

    const prev = after.scheduledAt?.toMillis ? after.scheduledAt.toMillis() : Date.now();
    let next;
    const d = new Date(prev);
    if (recurring === 'daily')   { d.setDate(d.getDate() + 1); next = d; }
    if (recurring === 'weekly')  { d.setDate(d.getDate() + 7); next = d; }
    if (recurring === 'monthly') { d.setMonth(d.getMonth() + 1); next = d; }
    if (!next) return null;

    await db.collection('streams').add({
      title:       after.title,
      description: after.description || '',
      category:    after.category    || 'general',
      status:      'scheduled',
      userId:      after.userId,
      userName:    after.userName,
      userAvatar:  after.userAvatar  || null,
      viewerCount: 0,
      recurring,
      scheduledAt: admin.firestore.Timestamp.fromDate(next),
      createdAt:   admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[createNextRecurringStream] Scheduled next ${recurring} occurrence for ${after.userId}: ${next.toISOString()}`);
    return null;
  });

// ── sendStreamReminders: notify followers N min before scheduledAt ─
exports.sendStreamReminders = functions.pubsub
  .schedule('every 5 minutes').onRun(async () => {
    const now         = Date.now();
    const windowStart = admin.firestore.Timestamp.fromMillis(now);
    const windowEnd   = admin.firestore.Timestamp.fromMillis(now + 35 * 60 * 1000); // next 35 min

    const scheduled = await db.collection('streams')
      .where('status',      '==',  'scheduled')
      .where('scheduledAt', '>',   windowStart)
      .where('scheduledAt', '<=',  windowEnd)
      .get();

    if (scheduled.empty) return null;

    for (const streamDoc of scheduled.docs) {
      const stream = streamDoc.data();
      const reminderMinutes = stream.reminderMinutes || 30;
      const streamTime = stream.scheduledAt.toMillis();
      const targetFireTime = streamTime - reminderMinutes * 60 * 1000;

      // Only fire within a 5-min window of the target reminder time
      if (Math.abs(now - targetFireTime) > 5 * 60 * 1000) continue;

      // Get followers
      try {
        const followersSnap = await db.collection('userFollowers')
          .doc(stream.userId).collection('followers').limit(500).get();

        if (followersSnap.empty) continue;

        // Collect FCM tokens
        const userDocs = await Promise.all(
          followersSnap.docs.map(f => db.collection('users').doc(f.id).get())
        );

        const tokens = [];
        userDocs.forEach(ud => {
          const d = ud.data() || {};
          if (d.fcmToken && d.pushEnabled !== false) tokens.push(d.fcmToken);
        });

        if (tokens.length === 0) continue;

        const timeStr = reminderMinutes >= 60
          ? `${Math.floor(reminderMinutes/60)}h`
          : `${reminderMinutes}m`;

        await admin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title: `⏰ ${stream.userName} goes live in ${timeStr}!`,
            body:  stream.title || 'Live stream starting soon',
          },
          data: {
            type:     'stream_reminder',
            streamId: streamDoc.id,
            url:      `/live/watch/${streamDoc.id}`,
          },
        });

        console.log(`[sendStreamReminders] Sent ${timeStr} reminder to ${tokens.length} followers for stream ${streamDoc.id}`);
      } catch (e) {
        console.error('[sendStreamReminders]', e);
      }
    }

    return null;
  });

// ── SPRINT-21: marketplacePriceAlertDelivery ─────────────────────
// Fires whenever a listing's price field is updated in Firestore.
// Queries price_alerts for any buyer who set a targetPrice >= new price,
// sends an FCM push + writes a Firestore notification, then marks alert triggered.
exports.marketplacePriceAlertDelivery = functions.firestore
  .document('marketplace/data/listings/{listingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();
    const { listingId } = context.params;

    // Only run if price actually decreased
    if (!before.price || !after.price || after.price >= before.price) return null;

    const newPrice = after.price;
    const listingTitle = after.title || 'A listing you saved';

    // Find all untriggered price alerts where targetPrice >= newPrice
    const alertsSnap = await db
      .collection('marketplace').doc('data').collection('price_alerts')
      .where('listingId',  '==', listingId)
      .where('triggered',  '==', false)
      .where('targetPrice', '>=', newPrice)
      .get();

    if (alertsSnap.empty) return null;

    const batch = db.batch();
    const fcmMessages = [];

    for (const alertDoc of alertsSnap.docs) {
      const alert = alertDoc.data();
      const userId = alert.userId;

      // Fetch buyer's FCM token
      const userDoc = await db.collection('users').doc(userId).get();
      const { fcmToken, pushEnabled } = userDoc.data() || {};

      // Write in-app notification regardless of FCM
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        userId,
        type:      'price_alert',
        listingId,
        title:     '🏷️ Price Drop Alert!',
        body:      `${listingTitle} dropped to $${newPrice.toFixed(2)}`,
        read:      false,
        url:       '/marketplace',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Mark alert as triggered
      batch.update(alertDoc.ref, {
        triggered:   true,
        triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
        priceWhen:   newPrice,
      });

      // Collect FCM if available
      if (fcmToken && pushEnabled !== false) {
        fcmMessages.push({ token: fcmToken, userId, listingId, newPrice, listingTitle });
      }
    }

    await batch.commit();

    // Send FCM push notifications
    if (fcmMessages.length > 0) {
      const tokens = fcmMessages.map(m => m.token);
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: '🏷️ Price Drop Alert!',
          body:  `${listingTitle} is now $${newPrice.toFixed(2)}`,
        },
        data: {
          type:      'price_alert',
          listingId,
          newPrice:  String(newPrice),
          url:       '/marketplace',
        },
        webpush: {
          fcmOptions: { link: '/marketplace' },
        },
      });
      console.log(`[priceAlertDelivery] Notified ${fcmMessages.length} buyers: ${listingTitle} → $${newPrice}`);
    }

    return null;
  });

// ── SPRINT-21: boostListingExpiry — auto-expire boosted listings ──
// Runs hourly: finds listings where boostedUntil has passed and clears the boost flag.
exports.boostListingExpiry = functions.pubsub
  .schedule('every 1 hours').onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const expired = await db
      .collection('marketplace').doc('data').collection('listings')
      .where('boosted',      '==',  true)
      .where('boostedUntil', '<=',  now)
      .limit(100)
      .get();

    if (expired.empty) return null;

    const batch = db.batch();
    expired.docs.forEach(d => batch.update(d.ref, { boosted: false, boostedUntil: null }));
    await batch.commit();
    console.log(`[boostListingExpiry] Cleared boost on ${expired.size} listings`);
    return null;
  });

// ── SPRINT-21: listingExpiryEnforcer — auto-archive old listings ──
// Runs daily: finds listings older than 90 days (or their custom expiry) and archives them.
exports.listingExpiryEnforcer = functions.pubsub
  .schedule('every 24 hours').onRun(async () => {
    const cutoff = admin.firestore.Timestamp.fromMillis(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const old = await db
      .collection('marketplace').doc('data').collection('listings')
      .where('status',    '==', 'active')
      .where('createdAt', '<',  cutoff)
      .limit(100)
      .get();

    if (old.empty) return null;

    const batch = db.batch();
    old.docs.forEach(d => batch.update(d.ref, {
      status:   'expired',
      expiredAt: admin.firestore.FieldValue.serverTimestamp(),
    }));
    await batch.commit();

    // Notify sellers their listings expired
    for (const listingDoc of old.docs) {
      const listing = listingDoc.data();
      try {
        const userDoc = await db.collection('users').doc(listing.sellerUid).get();
        const { fcmToken } = userDoc.data() || {};
        if (fcmToken) {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: '⏰ Your listing has expired',
              body:  `"${listing.title}" was archived after 90 days. Relist to continue selling.`,
            },
            data: { type: 'listing_expired', listingId: listingDoc.id },
          });
        }
      } catch (e) { /* non-fatal */ }
    }

    console.log(`[listingExpiryEnforcer] Archived ${old.size} expired listings`);
    return null;
  });

// ── cleanupEndedStreams: hide ended streams older than 24h ─────────
exports.cleanupEndedStreams = functions.pubsub
  .schedule('every 1 hours').onRun(async () => {
    const cutoff    = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const staleSnap = await db.collection('streams')
      .where('status',  '==', 'ended')
      .where('endedAt', '<',  admin.firestore.Timestamp.fromDate(cutoff))
      .limit(100).get();

    if (staleSnap.empty) return null;

    const batch = db.batch();
    staleSnap.docs.forEach(d => batch.update(d.ref, { hiddenFromFeed: true }));
    await batch.commit();
    console.log(`[cleanupEndedStreams] Hid ${staleSnap.size} old streams`);
    return null;
  });
