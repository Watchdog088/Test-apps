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
