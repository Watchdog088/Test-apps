/**
 * LynkApp / ConnectHub — Firebase Cloud Functions
 * Updated: September 14, 2026
 *
 * Sprint 3 additions:
 *  1. onNewMatch         — push notification to both users when a dating match is created
 *  2. onNewMessage       — push DM notification when receiver's app is closed
 *  3. onUserReportSubmit — alert admins + auto-flag content when a report is filed
 *  4. cleanExpiredStories (scheduled) — delete stories older than 24 hours every hour
 *  5. weeklyCreatorPayouts (scheduled) — trigger Stripe Connect payouts weekly
 *
 * Existing functions retained below the new ones.
 */

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const fetch     = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// Initialize once
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ─── Helper: send OneSignal push notification ──────────────────────────────────
// GAP 4 FIX (Sep 14 2026): Keys are now read from Firebase Functions config
// (set via: firebase functions:config:set onesignal.app_id="..." onesignal.api_key="...")
// Process-env fallback keeps local emulator working without running `firebase functions:config:get`.
async function sendOneSignalPush({ userIds, title, body, data = {} }) {
  // 1. Firebase Functions runtime config (production — recommended, keys not in source)
  let appId  = functions.config().onesignal && functions.config().onesignal.app_id;
  let apiKey = functions.config().onesignal && functions.config().onesignal.api_key;

  // 2. Fallback: process.env (local emulator / direct Node invocation)
  if (!appId)  appId  = process.env.ONESIGNAL_APP_ID;
  if (!apiKey) apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    console.warn('[OneSignal] Keys not set in Functions config or env — skipping push');
    console.warn('  Run: firebase functions:config:set onesignal.app_id="<ID>" onesignal.api_key="<KEY>"');
    return;
  }

  const payload = {
    app_id:            appId,
    include_external_user_ids: userIds,
    headings:          { en: title },
    contents:          { en: body },
    data,
    channel_for_external_user_ids: 'push',
  };

  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Basic ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    console.log('[OneSignal] Push sent:', JSON.stringify(json));
  } catch (err) {
    console.error('[OneSignal] Push error:', err.message);
  }
}

// ─── 1. onNewMatch — dating match push notification ───────────────────────────
// Triggered when a document is created in /matches/{matchId}
// The document must have: { user1Id, user2Id, createdAt }
exports.onNewMatch = functions.firestore
  .document('matches/{matchId}')
  .onCreate(async (snap, context) => {
    const match   = snap.data();
    const matchId = context.params.matchId;

    if (!match || !match.user1Id || !match.user2Id) {
      console.warn('[onNewMatch] Missing user IDs in match document:', matchId);
      return null;
    }

    const { user1Id, user2Id } = match;

    // Fetch both user display names for a personalised message
    const [u1Snap, u2Snap] = await Promise.all([
      db.collection('users').doc(user1Id).get(),
      db.collection('users').doc(user2Id).get(),
    ]);

    const u1Name = u1Snap.exists ? (u1Snap.data().displayName || 'Someone') : 'Someone';
    const u2Name = u2Snap.exists ? (u2Snap.data().displayName || 'Someone') : 'Someone';

    // Send push to both users simultaneously
    await Promise.all([
      sendOneSignalPush({
        userIds: [user1Id],
        title:   '💘 You have a new match!',
        body:    `You matched with ${u2Name}! Say hello 👋`,
        data:    { type: 'new_match', matchId, otherUserId: user2Id },
      }),
      sendOneSignalPush({
        userIds: [user2Id],
        title:   '💘 You have a new match!',
        body:    `You matched with ${u1Name}! Say hello 👋`,
        data:    { type: 'new_match', matchId, otherUserId: user1Id },
      }),
    ]);

    console.log(`[onNewMatch] Push sent to ${user1Id} and ${user2Id} for match ${matchId}`);
    return null;
  });

// ─── 2. onNewMessage — DM push when receiver's app is closed ─────────────────
// Triggered when a document is created in /conversations/{convId}/messages/{msgId}
// Document must have: { senderId, receiverId, text, conversationId }
exports.onNewMessage = functions.firestore
  .document('conversations/{convId}/messages/{msgId}')
  .onCreate(async (snap, context) => {
    const msg    = snap.data();
    const convId = context.params.convId;

    if (!msg || !msg.senderId || !msg.receiverId) {
      console.warn('[onNewMessage] Missing sender/receiver in message:', context.params.msgId);
      return null;
    }

    const { senderId, receiverId, text } = msg;

    // Fetch sender's name
    const senderSnap = await db.collection('users').doc(senderId).get();
    const senderName = senderSnap.exists ? (senderSnap.data().displayName || 'Someone') : 'Someone';

    // Only send push if receiver is NOT currently in the conversation
    // (check a presence document — set by the frontend when user opens a conversation)
    const presenceRef = db.collection('presence').doc(`${receiverId}_${convId}`);
    const presenceSnap = await presenceRef.get();
    const isInConv = presenceSnap.exists && presenceSnap.data().active === true;

    if (isInConv) {
      console.log(`[onNewMessage] Receiver ${receiverId} is active in conversation — skipping push`);
      return null;
    }

    await sendOneSignalPush({
      userIds: [receiverId],
      title:   `💬 ${senderName}`,
      body:    text ? (text.length > 80 ? text.slice(0, 80) + '…' : text) : 'Sent you a message',
      data:    { type: 'new_message', conversationId: convId, senderId },
    });

    console.log(`[onNewMessage] Push sent to ${receiverId} from ${senderId}`);
    return null;
  });

// ─── 3. onUserReportSubmit — admin alert + auto-flag ─────────────────────────
// Triggered when a report document is created in /reports/{reportId}
// Document must have: { reporterId, reportedUserId?, reportedPostId?, reason, category }
exports.onUserReportSubmit = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    const report   = snap.data();
    const reportId = context.params.reportId;

    if (!report) return null;

    const { reporterId, reportedUserId, reportedPostId, reason, category } = report;

    console.log(`[onUserReportSubmit] New report ${reportId}: category=${category}, reason=${reason}`);

    // 1. Mark the report as received + pending review
    await snap.ref.update({ status: 'pending', receivedAt: admin.firestore.FieldValue.serverTimestamp() });

    // 2. Auto-flag the reported user/content so admins can see it in the dashboard
    const flagData = {
      reportId,
      reporterId,
      reason,
      category,
      flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
      autoFlagged: true,
      status: 'pending_review',
    };

    const flagTasks = [];

    if (reportedUserId) {
      flagTasks.push(
        db.collection('flaggedUsers').doc(reportedUserId).set(flagData, { merge: true })
      );
    }

    if (reportedPostId) {
      flagTasks.push(
        db.collection('flaggedContent').doc(reportedPostId).set(flagData, { merge: true })
      );
    }

    await Promise.all(flagTasks);

    // 3. Send FCM push to all admin devices
    const adminsSnap = await db.collection('users').where('role', '==', 'admin').get();
    const adminIds   = adminsSnap.docs.map(d => d.id);

    if (adminIds.length > 0) {
      await sendOneSignalPush({
        userIds: adminIds,
        title:   '🚨 New Content Report',
        body:    `Report filed: ${category} — ${reason ? reason.slice(0, 60) : 'No reason given'}`,
        data:    { type: 'admin_report', reportId, reportedUserId, reportedPostId },
      });
    }

    console.log(`[onUserReportSubmit] Report ${reportId} processed. Admins notified: ${adminIds.length}`);
    return null;
  });

// ─── 4. cleanExpiredStories — scheduled every hour ────────────────────────────
// Stories expire 24 hours after creation. This function deletes them from Firestore.
exports.cleanExpiredStories = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const expired = await db.collection('stories')
      .where('createdAt', '<', cutoff)
      .where('expired', '!=', true) // avoid re-processing
      .limit(200) // process up to 200 at a time
      .get();

    if (expired.empty) {
      console.log('[cleanExpiredStories] No expired stories found.');
      return null;
    }

    const batch = db.batch();
    let count = 0;

    expired.docs.forEach(doc => {
      // Option A: Hard delete
      batch.delete(doc.ref);
      // Option B (softer): batch.update(doc.ref, { expired: true, expiredAt: admin.firestore.FieldValue.serverTimestamp() });
      count++;
    });

    await batch.commit();
    console.log(`[cleanExpiredStories] Deleted ${count} expired stories.`);
    return null;
  });

// ─── 5. weeklyCreatorPayouts — scheduled every Monday 6am UTC ────────────────
// Triggers the backend payout endpoint which calculates & initiates Stripe Connect payouts.
exports.weeklyCreatorPayouts = functions.pubsub
  .schedule('0 6 * * 1') // Every Monday at 06:00 UTC
  .timeZone('UTC')
  .onRun(async () => {
    const backendUrl = process.env.BACKEND_URL || 'https://api.lynkapp.com';
    const adminKey   = process.env.INTERNAL_API_KEY || '';

    try {
      const res = await fetch(`${backendUrl}/api/v1/monetization/trigger-payouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Key': adminKey,
        },
      });
      const json = await res.json();
      console.log('[weeklyCreatorPayouts] Payout trigger response:', JSON.stringify(json));
    } catch (err) {
      console.error('[weeklyCreatorPayouts] Failed to trigger payouts:', err.message);
    }

    return null;
  });

// ─── Keep any previously defined functions below this line ────────────────────
// (admin role setter, etc.)
try {
  const existingFunctions = require('./set-admin-role');
  if (existingFunctions) {
    Object.assign(exports, existingFunctions);
  }
} catch (_) {
  // set-admin-role.js doesn't export functions — that's fine
}
