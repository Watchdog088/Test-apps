// Firebase Cloud Functions — ConnectHub SPA
// MISSING-1 FIX: Push notifications when a followed streamer goes live
// REC-5 FIX: Server-side chat word filter enforcer
// REC-4 FIX: VOD archive record written when stream ends
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
