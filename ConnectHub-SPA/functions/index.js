// functions/index.js — Firebase Cloud Functions
// UX-LIVE-09: "Friend is Live" push notification fan-out
// LIVE-BUG-10: Multi-platform RTMP relay trigger
//
// Deploy: firebase deploy --only functions
// Requires: firebase-admin, firebase-functions, axios
// Install:  cd functions && npm install firebase-admin firebase-functions axios

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const axios     = require('axios');

admin.initializeApp();
const db = admin.firestore();

// ════════════════════════════════════════════════════════════════════════════
// UX-LIVE-09 — Fan out "Friend is Live" push notification to all followers
// Triggers on: streams/{streamId} CREATE where status == 'live'
// ════════════════════════════════════════════════════════════════════════════
exports.notifyFollowersWhenLive = functions.firestore
  .document('streams/{streamId}')
  .onCreate(async (snap, context) => {
    const stream   = snap.data();
    const streamId = context.params.streamId;

    // Only fire for newly-started live streams
    if (stream.status !== 'live') return null;

    const streamerId = stream.userId;
    const streamerName = stream.userName || 'Someone';
    const streamTitle  = stream.title    || 'Live Stream';

    try {
      // 1️⃣ Fetch all followers of the streamer from Firestore
      //    Schema: users/{streamerId}/followers/{followerId} → { fcmToken, oneSignalId }
      const followersSnap = await db
        .collection('users')
        .doc(streamerId)
        .collection('followers')
        .get();

      if (followersSnap.empty) {
        console.log(`[notifyFollowersWhenLive] No followers for ${streamerId}`);
        return null;
      }

      const fcmTokens      = [];
      const oneSignalIds   = [];

      followersSnap.forEach(doc => {
        const follower = doc.data();
        if (follower.fcmToken)    fcmTokens.push(follower.fcmToken);
        if (follower.oneSignalId) oneSignalIds.push(follower.oneSignalId);
      });

      // 2️⃣ Send via Firebase Cloud Messaging (FCM)
      if (fcmTokens.length > 0) {
        const message = {
          notification: {
            title: `🔴 ${streamerName} is now LIVE!`,
            body:  streamTitle,
          },
          data: {
            streamId,
            type: 'friend_live',
            streamerName,
            streamTitle,
            deepLink: `https://lynkapp.com/live/watch/${streamId}`,
          },
          tokens: fcmTokens,
        };

        const fcmResponse = await admin.messaging().sendEachForMulticast(message);
        console.log(`[FCM] Sent ${fcmResponse.successCount} / ${fcmTokens.length} notifications`);
      }

      // 3️⃣ Send via OneSignal REST API (for web push / PWA users)
      const oneSignalAppId  = functions.config().onesignal?.app_id  || process.env.ONESIGNAL_APP_ID;
      const oneSignalApiKey = functions.config().onesignal?.api_key || process.env.ONESIGNAL_API_KEY;

      if (oneSignalIds.length > 0 && oneSignalAppId && oneSignalApiKey) {
        await axios.post(
          'https://onesignal.com/api/v1/notifications',
          {
            app_id:             oneSignalAppId,
            include_player_ids: oneSignalIds,
            headings:           { en: `🔴 ${streamerName} is now LIVE!` },
            contents:           { en: streamTitle },
            url:                `https://lynkapp.com/live/watch/${streamId}`,
            data:               { streamId, type: 'friend_live' },
            ios_badgeType:      'Increase',
            ios_badgeCount:     1,
          },
          {
            headers: {
              Authorization: `Basic ${oneSignalApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(`[OneSignal] Notified ${oneSignalIds.length} followers`);
      }

      // 4️⃣ Write an in-app notification to each follower's notifications collection
      const batch = db.batch();
      followersSnap.forEach(doc => {
        const notifRef = db
          .collection('users')
          .doc(doc.id)
          .collection('notifications')
          .doc();

        batch.set(notifRef, {
          type:        'friend_live',
          title:       `🔴 ${streamerName} is LIVE!`,
          body:        streamTitle,
          streamId,
          streamerId,
          streamerName,
          read:        false,
          createdAt:   admin.firestore.FieldValue.serverTimestamp(),
          deepLink:    `/live/watch/${streamId}`,
        });
      });
      await batch.commit();
      console.log(`[InApp] Wrote ${followersSnap.size} in-app notifications`);

      return null;
    } catch (err) {
      console.error('[notifyFollowersWhenLive] Error:', err);
      return null;
    }
  });

// ════════════════════════════════════════════════════════════════════════════
// LIVE-BUG-10 — Multi-platform RTMP relay
// Triggers when stream.rtmpPlatforms is set and stream goes live
// ════════════════════════════════════════════════════════════════════════════
exports.startRtmpRelay = functions.firestore
  .document('streams/{streamId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();

    // Only fire when status changes to 'live' and rtmpPlatforms is set
    if (before.status === after.status) return null;
    if (after.status !== 'live')        return null;

    const platforms = after.rtmpPlatforms || {};
    const streamId  = context.params.streamId;

    // Build list of active platform relay targets
    const targets = [];
    if (platforms.youtube?.enabled && platforms.youtube?.streamKey) {
      targets.push({
        name: 'YouTube',
        url:  `rtmp://a.rtmp.youtube.com/live2/${platforms.youtube.streamKey}`,
      });
    }
    if (platforms.twitch?.enabled && platforms.twitch?.streamKey) {
      targets.push({
        name: 'Twitch',
        url:  `rtmp://live.twitch.tv/live/${platforms.twitch.streamKey}`,
      });
    }
    if (platforms.facebook?.enabled && platforms.facebook?.streamKey) {
      targets.push({
        name: 'Facebook',
        url:  `rtmps://live-api-s.facebook.com:443/rtmp/${platforms.facebook.streamKey}`,
      });
    }

    if (targets.length === 0) return null;

    // Call the media server to start re-publishing
    // Replace MEDIA_SERVER_URL with your actual media server (e.g. Node Media Server, Nginx-RTMP)
    const mediaServerUrl = functions.config().media?.server_url || process.env.MEDIA_SERVER_URL;
    if (!mediaServerUrl) {
      console.warn('[startRtmpRelay] MEDIA_SERVER_URL not configured');
      return null;
    }

    try {
      await axios.post(`${mediaServerUrl}/relay/start`, {
        streamId,
        sourceRtmpUrl: `rtmp://localhost/live/${streamId}`,
        targets,
      });
      console.log(`[startRtmpRelay] Started relay for ${targets.map(t => t.name).join(', ')}`);

      // Update Firestore to record relay status
      await change.after.ref.update({
        rtmpRelayStatus: 'active',
        rtmpRelayTargets: targets.map(t => t.name),
      });
    } catch (err) {
      console.error('[startRtmpRelay] Error:', err.message);
      await change.after.ref.update({ rtmpRelayStatus: 'error', rtmpRelayError: err.message });
    }

    return null;
  });

// ════════════════════════════════════════════════════════════════════════════
// Stop RTMP relay when stream ends
// ════════════════════════════════════════════════════════════════════════════
exports.stopRtmpRelay = functions.firestore
  .document('streams/{streamId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();

    if (before.status !== 'live' || after.status !== 'ended') return null;

    const streamId       = context.params.streamId;
    const mediaServerUrl = functions.config().media?.server_url || process.env.MEDIA_SERVER_URL;
    if (!mediaServerUrl) return null;

    try {
      await axios.post(`${mediaServerUrl}/relay/stop`, { streamId });
      console.log(`[stopRtmpRelay] Stopped relay for ${streamId}`);

      // Record stream duration in Firestore for VOD metadata
      const startedAt = before.startedAt?.toDate?.() || new Date();
      const endedAt   = new Date();
      const durationSeconds = Math.floor((endedAt - startedAt) / 1000);

      await change.after.ref.update({
        endedAt:         admin.firestore.FieldValue.serverTimestamp(),
        durationSeconds,
        rtmpRelayStatus: 'stopped',
      });
    } catch (err) {
      console.error('[stopRtmpRelay] Error:', err.message);
    }

    return null;
  });

// ════════════════════════════════════════════════════════════════════════════
// Auto-update stream duration when ended (no media server)
// ════════════════════════════════════════════════════════════════════════════
exports.recordStreamDuration = functions.firestore
  .document('streams/{streamId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();

    if (before.status !== 'live' || after.status !== 'ended') return null;
    if (after.durationSeconds) return null; // Already recorded by stopRtmpRelay

    const startedAt = before.startedAt?.toDate?.() || new Date();
    const durationSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);

    await change.after.ref.update({
      endedAt:         admin.firestore.FieldValue.serverTimestamp(),
      durationSeconds,
    });

    console.log(`[recordStreamDuration] Stream ${context.params.streamId} lasted ${durationSeconds}s`);
    return null;
  });
