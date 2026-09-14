/**
 * cloud-triggers.js — Firebase Cloud Functions (background triggers)
 *
 * Exports:
 *  onNewMatch            Firestore trigger: creates match notification + sends push
 *  onNewMessage          Firestore trigger: sends push to conversation recipient
 *  onUserReportSubmit    Firestore trigger: alerts admin, queues moderation review
 *  expireStories         Pub/Sub scheduled function: deletes stories older than 24h
 *  weeklyCreatorPayouts  Pub/Sub scheduled function: processes creator payouts
 *
 * Deploy together with functions/index.js:
 *   firebase deploy --only functions
 */

const functions  = require('firebase-functions');
const admin      = require('firebase-admin');

// Admin SDK is initialised once in index.js — do NOT call initializeApp() here.

const db        = () => admin.firestore();
const messaging = () => admin.messaging();

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Send a single FCM push to a user.
 * Looks up the user's FCM token from Firestore users/{userId}.
 */
async function sendPushToUser(userId, title, body, data = {}) {
  try {
    const snap = await db().collection('users').doc(userId).get();
    if (!snap.exists) return;
    const { fcmToken } = snap.data() || {};
    if (!fcmToken) return;

    await messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: 'high' },
      apns:    { payload: { aps: { sound: 'default' } } },
    });
  } catch (err) {
    console.error('[sendPushToUser]', userId, err.message);
  }
}

// ── onNewMatch ─────────────────────────────────────────────────────
// Triggered when a document is created in: matches/{matchId}
// Expected shape: { userId1, userId2, createdAt }
exports.onNewMatch = functions.firestore
  .document('matches/{matchId}')
  .onCreate(async (snap, context) => {
    const match = snap.data();
    if (!match) return;

    const { userId1, userId2 } = match;

    // Get both user display names
    const [u1Snap, u2Snap] = await Promise.all([
      db().collection('users').doc(userId1).get(),
      db().collection('users').doc(userId2).get(),
    ]);

    const u1Name = u1Snap.data()?.displayName || 'Someone';
    const u2Name = u2Snap.data()?.displayName || 'Someone';

    // Write notification docs for each user
    const batch = db().batch();

    const notif1 = db().collection('notifications').doc();
    batch.set(notif1, {
      userId:    userId1,
      type:      'match',
      title:     '💕 New Match!',
      body:      `You matched with ${u2Name}! Say hello.`,
      data:      { matchId: context.params.matchId, matchedUserId: userId2 },
      isRead:    false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const notif2 = db().collection('notifications').doc();
    batch.set(notif2, {
      userId:    userId2,
      type:      'match',
      title:     '💕 New Match!',
      body:      `You matched with ${u1Name}! Say hello.`,
      data:      { matchId: context.params.matchId, matchedUserId: userId1 },
      isRead:    false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    // Send push notifications (best-effort, non-fatal)
    await Promise.all([
      sendPushToUser(userId1, '💕 New Match!', `You matched with ${u2Name}!`, { type: 'match', matchId: context.params.matchId }),
      sendPushToUser(userId2, '💕 New Match!', `You matched with ${u1Name}!`, { type: 'match', matchId: context.params.matchId }),
    ]);

    console.log(`[onNewMatch] Match ${context.params.matchId} processed: ${userId1} ↔ ${userId2}`);
  });

// ── onNewMessage ───────────────────────────────────────────────────
// Triggered when a message is created in:
//   conversations/{conversationId}/messages/{messageId}
// Expected shape: { senderId, recipientId, text, type }
exports.onNewMessage = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const msg = snap.data();
    if (!msg) return;

    const { senderId, recipientId, text } = msg;
    if (!recipientId || !senderId) return;

    // Don't notify the sender (self-message edge case)
    if (senderId === recipientId) return;

    // Get sender name
    const senderSnap = await db().collection('users').doc(senderId).get();
    const senderName = senderSnap.data()?.displayName || 'Someone';

    // Truncate long messages for the notification preview
    const preview = (text || '📎 Attachment').slice(0, 80);

    // Write notification doc
    await db().collection('notifications').add({
      userId:    recipientId,
      type:      'message',
      title:     `💬 ${senderName}`,
      body:      preview,
      data:      { conversationId: context.params.conversationId, senderId },
      isRead:    false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update conversation unread count for recipient
    await db()
      .collection('conversations')
      .doc(context.params.conversationId)
      .update({
        [`unread.${recipientId}`]: admin.firestore.FieldValue.increment(1),
        lastMessage:  preview,
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      })
      .catch(() => {});

    // Push notification
    await sendPushToUser(recipientId, `💬 ${senderName}`, preview, {
      type:           'message',
      conversationId: context.params.conversationId,
      senderId,
    });
  });

// ── onUserReportSubmit ─────────────────────────────────────────────
// Triggered when a document is created in: reports/{reportId}
// Expected shape: { reporterId, reportedUserId, reason, contentType, contentId }
exports.onUserReportSubmit = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    const report = snap.data();
    if (!report) return;

    const { reporterId, reportedUserId, reason, contentType } = report;

    // 1. Update report with server timestamp & initial status
    await snap.ref.update({
      status:    'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Notify all admin users
    const adminSnap = await db()
      .collection('users')
      .where('role', '==', 'admin')
      .limit(5)
      .get();

    const batch = db().batch();
    adminSnap.forEach((adminDoc) => {
      const notifRef = db().collection('notifications').doc();
      batch.set(notifRef, {
        userId:    adminDoc.id,
        type:      'admin_report',
        title:     '🚨 New User Report',
        body:      `Report #${context.params.reportId.slice(0, 8)}: ${contentType} reported for "${reason}"`,
        data:      { reportId: context.params.reportId, reportedUserId, reporterId },
        isRead:    false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    // 3. If the reported user has 5+ pending reports, auto-flag their account
    const pendingReports = await db()
      .collection('reports')
      .where('reportedUserId', '==', reportedUserId)
      .where('status', '==', 'pending')
      .get();

    if (pendingReports.size >= 5) {
      await db().collection('users').doc(reportedUserId).update({
        isFlagged:   true,
        flaggedAt:   admin.firestore.FieldValue.serverTimestamp(),
        flagReason:  'auto-flagged: 5+ pending reports',
      }).catch(() => {});
      console.log(`[onUserReportSubmit] Auto-flagged user ${reportedUserId} (${pendingReports.size} reports)`);
    }

    console.log(`[onUserReportSubmit] Report ${context.params.reportId} processed`);
  });

// ── expireStories ──────────────────────────────────────────────────
// Scheduled: runs every hour. Marks stories older than 24h as expired
// and optionally moves them to the archive sub-collection.
exports.expireStories = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async (_context) => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago

    const expired = await db()
      .collection('stories')
      .where('expiresAt', '<=', cutoff)
      .where('isExpired', '==', false)
      .limit(200)
      .get();

    if (expired.empty) {
      console.log('[expireStories] No stories to expire');
      return;
    }

    const batch = db().batch();
    expired.forEach((doc) => {
      batch.update(doc.ref, {
        isExpired:  true,
        expiredAt:  admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(`[expireStories] Expired ${expired.size} stories`);
  });

// ── weeklyCreatorPayouts ───────────────────────────────────────────
// Scheduled: every Sunday at midnight UTC.
// Aggregates creator earnings from the past week and initiates Stripe payouts.
exports.weeklyCreatorPayouts = functions.pubsub
  .schedule('0 0 * * 0')
  .timeZone('UTC')
  .onRun(async (_context) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find creators with unpaid earnings
    const creatorsSnap = await db()
      .collection('creatorEarnings')
      .where('status', '==', 'pending')
      .where('periodEnd', '<=', admin.firestore.Timestamp.fromDate(oneWeekAgo))
      .limit(100)
      .get();

    if (creatorsSnap.empty) {
      console.log('[weeklyCreatorPayouts] No pending payouts');
      return;
    }

    let processed = 0;
    for (const doc of creatorsSnap.docs) {
      const earnings = doc.data();
      const { creatorId, amount, stripeAccountId } = earnings;

      if (!stripeAccountId || amount < 1) {
        // Skip — no connected Stripe account or below minimum payout ($1)
        await doc.ref.update({ status: 'skipped', skippedAt: admin.firestore.FieldValue.serverTimestamp() });
        continue;
      }

      try {
        // Trigger payout via the backend HTTP API (avoids embedding Stripe keys in Functions)
        const backendUrl = process.env.BACKEND_URL || 'https://api.lynkapp.com';
        const response   = await fetch(`${backendUrl}/api/v1/wallet/payout`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${process.env.FUNCTIONS_SERVICE_KEY || ''}`,
          },
          body: JSON.stringify({ creatorId, amount, stripeAccountId, earningsDocId: doc.id }),
        });

        if (response.ok) {
          await doc.ref.update({ status: 'processing', initiatedAt: admin.firestore.FieldValue.serverTimestamp() });
          processed++;
        } else {
          console.error(`[weeklyCreatorPayouts] Payout failed for ${creatorId}:`, response.status);
          await doc.ref.update({ status: 'failed', failedAt: admin.firestore.FieldValue.serverTimestamp() });
        }
      } catch (err) {
        console.error(`[weeklyCreatorPayouts] Error for ${creatorId}:`, err.message);
      }
    }

    console.log(`[weeklyCreatorPayouts] Processed ${processed}/${creatorsSnap.size} payouts`);
  });
