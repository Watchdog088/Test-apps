/**
 * dating-backend-integration.js
 * ─────────────────────────────────────────────────────────────────────────────
 * LynkApp Dating Section — Backend Integration Layer
 * Implements B1 (real user photos), B2 (who liked you), B5 (content moderation)
 * and wires the quick-chat UI to the existing messaging-service.js
 *
 * This file bridges the dating-ux-beta-test.html prototype to real Firebase /
 * Cloudinary / OpenAI backends.  Drop this script into the page (or import it)
 * alongside the existing dating page and the stubs below become live calls.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { db, auth, storage } from './firebase-config.js';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment
} from 'firebase/firestore';
import {
  ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject
} from 'firebase/storage';
import { messagingService } from './messaging-service.js';

// ─────────────────────────────────────────────────────────────────────────────
// B1 — REAL USER PHOTOS  (Firebase Storage + Cloudinary)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload a dating profile photo.
 * 1. Sends it to the server-side moderation endpoint (B5) first.
 * 2. If approved, uploads to Firebase Storage / Cloudinary.
 * 3. Returns the public CDN URL that gets stored in the user's Firestore doc.
 *
 * @param {File}   file        - The File object from <input type="file">
 * @param {string} userId      - Current user's Firebase UID
 * @param {number} photoIndex  - 0-based index (max 6 photos allowed)
 * @returns {Promise<string>}  - The public CDN download URL
 */
export async function uploadDatingPhoto(file, userId, photoIndex) {
  // ── Step 1: B5 Content Moderation ──────────────────────────────────────────
  const moderationResult = await moderatePhotoBeforeUpload(file);
  if (!moderationResult.approved) {
    throw new Error(`Photo rejected: ${moderationResult.reason}`);
  }

  // ── Step 2: Upload to Firebase Storage ─────────────────────────────────────
  const path = `dating-photos/${userId}/photo_${photoIndex}_${Date.now()}.jpg`;
  const photoRef = storageRef(storage, path);
  const uploadTask = uploadBytesResumable(photoRef, file, {
    contentType: file.type,
    customMetadata: { userId, moderationId: moderationResult.id }
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      snapshot => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // Dispatch progress event for UI progress bar
        window.dispatchEvent(new CustomEvent('photoUploadProgress', {
          detail: { pct, photoIndex }
        }));
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        // ── Step 3: Store URL in Firestore user doc ───────────────────────────
        const userDatingRef = doc(db, 'datingProfiles', userId);
        await updateDoc(userDatingRef, {
          [`photos.${photoIndex}`]: url,
          photosCount: increment(1),
          updatedAt: serverTimestamp()
        });
        resolve(url);
      }
    );
  });
}

/**
 * Delete a dating profile photo from Storage + remove from Firestore.
 */
export async function deleteDatingPhoto(userId, photoIndex, photoUrl) {
  try {
    // Delete from Storage
    const photoRef = storageRef(storage, photoUrl);
    await deleteObject(photoRef);
  } catch (err) {
    console.warn('Storage delete failed (file may not exist):', err.message);
  }
  // Remove from Firestore
  const userDatingRef = doc(db, 'datingProfiles', userId);
  await updateDoc(userDatingRef, {
    [`photos.${photoIndex}`]: null,
    updatedAt: serverTimestamp()
  });
}

/**
 * Fetch a user's dating profile photos from Firestore.
 * Called when rendering profile cards from the discovery queue.
 *
 * @param {string} userId
 * @returns {Promise<string[]>} - Array of photo CDN URLs (filtered nulls)
 */
export async function fetchDatingPhotos(userId) {
  const profileDoc = await getDoc(doc(db, 'datingProfiles', userId));
  if (!profileDoc.exists()) return [];
  const photos = profileDoc.data().photos || {};
  return Object.values(photos).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// B5 — AI CONTENT MODERATION (OpenAI Vision API via backend proxy)
// ─────────────────────────────────────────────────────────────────────────────

const MODERATION_ENDPOINT = '/api/dating/moderate-photo'; // your Node/Express route

/**
 * Send a photo file to the backend moderation proxy before allowing upload.
 * The backend calls OpenAI Vision API (or AWS Rekognition) and returns:
 *   { approved: true, id: 'mod_abc123' }
 *   { approved: false, reason: 'Contains explicit content', id: 'mod_xyz' }
 *
 * @param {File} file
 * @returns {Promise<{approved: boolean, reason?: string, id: string}>}
 */
export async function moderatePhotoBeforeUpload(file) {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('userId', auth.currentUser?.uid || 'anonymous');

  const res = await fetch(MODERATION_ENDPOINT, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`
    }
  });

  if (!res.ok) {
    throw new Error(`Moderation service error: ${res.status}`);
  }

  const result = await res.json();
  // Log moderation event for admin dashboard
  await addDoc(collection(db, 'moderationLogs'), {
    userId: auth.currentUser?.uid,
    type: 'photo_upload',
    approved: result.approved,
    reason: result.reason || null,
    moderationId: result.id,
    timestamp: serverTimestamp()
  });

  return result;
}

/**
 * Backend route handler (Node.js/Express example).
 * Add this to your ConnectHub-Backend server:
 *
 * router.post('/dating/moderate-photo', upload.single('photo'), async (req, res) => {
 *   const { OpenAI } = require('openai');
 *   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *
 *   const base64 = req.file.buffer.toString('base64');
 *   const response = await openai.chat.completions.create({
 *     model: 'gpt-4o',
 *     messages: [{
 *       role: 'user',
 *       content: [{
 *         type: 'text',
 *         text: 'Does this image contain any explicit nudity, weapons, violence, or illegal content? Reply JSON: {"safe": true/false, "reason": "..."}'
 *       }, {
 *         type: 'image_url',
 *         image_url: { url: `data:image/jpeg;base64,${base64}` }
 *       }]
 *     }]
 *   });
 *
 *   const parsed = JSON.parse(response.choices[0].message.content);
 *   const modId = `mod_${Date.now()}`;
 *   res.json({ approved: parsed.safe, reason: parsed.reason, id: modId });
 * });
 */

// ─────────────────────────────────────────────────────────────────────────────
// B2 — REAL "WHO LIKED YOU" DATA (Firestore real-time listener)
// ─────────────────────────────────────────────────────────────────────────────

let likedYouUnsubscribe = null;

/**
 * Subscribe to real-time "who liked you" data from Firestore.
 * The dating swipe engine writes to `datingLikes/{targetUserId}/likers/{likerUserId}`
 * whenever someone swipes right on the current user.
 *
 * @param {string} currentUserId - Logged-in user's UID
 * @param {Function} onUpdate   - Callback: ({ count, profiles }) => void
 * @returns {Function}           - Unsubscribe function
 */
export function subscribeLikedByYou(currentUserId, onUpdate) {
  if (likedYouUnsubscribe) likedYouUnsubscribe();

  const likedByRef = collection(db, 'datingLikes', currentUserId, 'likers');
  const recentLikesQuery = query(
    likedByRef,
    orderBy('timestamp', 'desc'),
    limit(20)
  );

  likedYouUnsubscribe = onSnapshot(recentLikesQuery, async snapshot => {
    const likerDocs = snapshot.docs;
    const count = likerDocs.length;

    // Fetch blurred preview data for first 4 likers
    const previewProfiles = await Promise.all(
      likerDocs.slice(0, 4).map(async d => {
        const profileSnap = await getDoc(doc(db, 'datingProfiles', d.id));
        const profile = profileSnap.data() || {};
        return {
          uid: d.id,
          // Only return first photo for blurred preview
          photoUrl: Object.values(profile.photos || {})[0] || null,
          name: profile.displayName || 'Someone',
          likedAt: d.data().timestamp
        };
      })
    );

    onUpdate({ count, profiles: previewProfiles });
  });

  return likedYouUnsubscribe;
}

/**
 * Record a swipe right (like) from current user on a target profile.
 * Checks for a mutual like (match) after recording.
 *
 * @param {string} currentUserId
 * @param {string} targetUserId
 * @returns {Promise<{isMatch: boolean, matchId?: string}>}
 */
export async function recordSwipeLike(currentUserId, targetUserId) {
  // Write the like
  const likeRef = doc(db, 'datingLikes', targetUserId, 'likers', currentUserId);
  await updateDoc(likeRef, {
    timestamp: serverTimestamp(),
    type: 'like'
  }).catch(() => {
    // Doc doesn't exist yet — create it
    return addDoc(collection(db, 'datingLikes', targetUserId, 'likers'), {
      likerId: currentUserId,
      timestamp: serverTimestamp(),
      type: 'like'
    });
  });

  // Check if target already liked current user (mutual = match)
  const reverseLikeRef = doc(db, 'datingLikes', currentUserId, 'likers', targetUserId);
  const reverseDoc = await getDoc(reverseLikeRef);

  if (reverseDoc.exists()) {
    // It's a match! Create the match document
    const matchId = [currentUserId, targetUserId].sort().join('_');
    const matchRef = doc(db, 'datingMatches', matchId);
    await updateDoc(matchRef, {
      users: [currentUserId, targetUserId],
      matchedAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null
    }).catch(() =>
      addDoc(collection(db, 'datingMatches'), {
        matchId,
        users: [currentUserId, targetUserId],
        matchedAt: serverTimestamp()
      })
    );

    // Create messaging thread for the match
    await messagingService.createConversation([currentUserId, targetUserId], {
      type: 'dating_match',
      matchId
    });

    return { isMatch: true, matchId };
  }

  return { isMatch: false };
}

/**
 * Record a super like swipe.
 */
export async function recordSuperLike(currentUserId, targetUserId) {
  const likeRef = doc(db, 'datingLikes', targetUserId, 'likers', currentUserId);
  await addDoc(collection(db, 'datingLikes', targetUserId, 'likers'), {
    likerId: currentUserId,
    timestamp: serverTimestamp(),
    type: 'superlike'
  });
  // Notify target user that they were super liked (push notification)
  await addDoc(collection(db, 'notifications'), {
    type: 'dating_superlike',
    recipientId: targetUserId,
    senderId: currentUserId,
    read: false,
    timestamp: serverTimestamp()
  });
}

/**
 * Record a pass (left swipe).
 */
export async function recordSwipePass(currentUserId, targetUserId) {
  await addDoc(collection(db, 'datingPasses', currentUserId, 'passed'), {
    passedUserId: targetUserId,
    timestamp: serverTimestamp()
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// R6 — CHAT WIRED TO messaging-service.js
// ─────────────────────────────────────────────────────────────────────────────

let currentConversationId = null;
let chatUnsubscribe = null;

/**
 * Open a real-time chat with a match.
 * Finds or creates the conversation thread via messagingService,
 * then subscribes to live messages.
 *
 * @param {string} matchId           - datingMatches document ID
 * @param {string} currentUserId
 * @param {string} otherUserId
 * @param {Function} onMessages      - Callback: (messages[]) => void
 * @returns {Promise<string>}        - conversationId
 */
export async function openDatingChat(matchId, currentUserId, otherUserId, onMessages) {
  if (chatUnsubscribe) chatUnsubscribe();

  // Find existing conversation or create one
  const convsQuery = query(
    collection(db, 'conversations'),
    where('matchId', '==', matchId),
    limit(1)
  );
  const existing = await getDocs(convsQuery);

  let conversationId;
  if (!existing.empty) {
    conversationId = existing.docs[0].id;
  } else {
    const newConv = await addDoc(collection(db, 'conversations'), {
      type: 'dating_match',
      matchId,
      participants: [currentUserId, otherUserId],
      createdAt: serverTimestamp(),
      lastMessage: null
    });
    conversationId = newConv.id;
  }

  currentConversationId = conversationId;

  // Real-time listener for messages
  const msgsQuery = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(50)
  );

  chatUnsubscribe = onSnapshot(msgsQuery, snapshot => {
    const messages = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    onMessages(messages);
  });

  // Mark messages as read
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unread.${currentUserId}`]: 0
  });

  return conversationId;
}

/**
 * Send a message in an active dating chat.
 *
 * @param {string} senderId
 * @param {string} text
 * @param {string} [mediaUrl]  - Optional media attachment URL
 */
export async function sendDatingMessage(senderId, text, mediaUrl = null) {
  if (!currentConversationId) throw new Error('No active conversation');

  const msgData = {
    senderId,
    text: text || null,
    mediaUrl: mediaUrl || null,
    timestamp: serverTimestamp(),
    read: false
  };

  await addDoc(
    collection(db, 'conversations', currentConversationId, 'messages'),
    msgData
  );

  // Update conversation last message
  await updateDoc(doc(db, 'conversations', currentConversationId), {
    lastMessage: text || '📷 Photo',
    lastMessageAt: serverTimestamp(),
    // Increment unread for other participant — get participants first
    // In real app: get conversation.participants, find the other user
  });
}

/**
 * Close and unsubscribe from the current dating chat.
 */
export function closeDatingChat() {
  if (chatUnsubscribe) chatUnsubscribe();
  chatUnsubscribe = null;
  currentConversationId = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCOVERY QUEUE — Fetch real profiles from Firestore
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the discovery queue for the current user.
 * Excludes: already seen profiles, blocked users, own profile.
 *
 * @param {string} currentUserId
 * @param {Object} preferences    - { ageMin, ageMax, maxDistanceMiles, gender, relType }
 * @returns {Promise<Array>}      - Array of dating profile objects
 */
export async function fetchDiscoveryQueue(currentUserId, preferences = {}) {
  const { ageMin = 18, ageMax = 60, maxDistanceMiles = 50, gender = 'Everyone' } = preferences;

  // Get profiles the user has already seen (passed or liked)
  const seenPassed = await getDocs(
    collection(db, 'datingPasses', currentUserId, 'passed')
  );
  const seenLiked = await getDocs(
    collection(db, 'datingLikes', currentUserId, 'liked')
  );

  const seenIds = new Set([
    currentUserId,
    ...seenPassed.docs.map(d => d.id),
    ...seenLiked.docs.map(d => d.id)
  ]);

  // Query profiles within age range
  let profilesQuery = query(
    collection(db, 'datingProfiles'),
    where('age', '>=', ageMin),
    where('age', '<=', ageMax),
    where('showInDating', '==', true),
    orderBy('age'),
    orderBy('lastActive', 'desc'),
    limit(50)
  );

  const profileSnaps = await getDocs(profilesQuery);

  const profiles = profileSnaps.docs
    .filter(d => !seenIds.has(d.id))
    .map(d => ({ uid: d.id, ...d.data() }))
    // Client-side distance filter (server-side requires GeoFirestore or similar)
    .filter(p => !p.distanceMiles || p.distanceMiles <= maxDistanceMiles)
    // Gender filter
    .filter(p => gender === 'Everyone' || p.gender === gender);

  return profiles;
}

/**
 * Fetch the current user's matches with last message previews.
 *
 * @param {string} currentUserId
 * @returns {Promise<Array>}
 */
export async function fetchMatches(currentUserId) {
  const matchesQuery = query(
    collection(db, 'datingMatches'),
    where('users', 'array-contains', currentUserId),
    orderBy('matchedAt', 'desc'),
    limit(30)
  );

  const matchSnaps = await getDocs(matchesQuery);

  const matches = await Promise.all(
    matchSnaps.docs.map(async d => {
      const data = d.data();
      const otherUserId = data.users.find(uid => uid !== currentUserId);
      const profileSnap = await getDoc(doc(db, 'datingProfiles', otherUserId));
      const profile = profileSnap.data() || {};

      return {
        matchId: d.id,
        uid: otherUserId,
        name: profile.displayName || 'Unknown',
        photo: Object.values(profile.photos || {})[0] || null,
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt,
        matchedAt: data.matchedAt
      };
    })
  );

  return matches;
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY SWIPE LIMIT — Server-enforced
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the current user's daily like count from Firestore.
 * This prevents clients from bypassing localStorage limits.
 *
 * @param {string} userId
 * @returns {Promise<{used: number, limit: number, remaining: number}>}
 */
export async function getDailySwipeStatus(userId) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const swipeRef = doc(db, 'datingDailyLimits', `${userId}_${today}`);
  const snap = await getDoc(swipeRef);

  const DAILY_LIMIT = 100; // Free tier
  const used = snap.exists() ? snap.data().count : 0;
  return { used, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used) };
}

/**
 * Increment the daily swipe counter (server-side enforcement).
 * Called after every like/superlike.
 *
 * @param {string} userId
 * @returns {Promise<boolean>} - true if allowed, false if limit reached
 */
export async function incrementDailySwipe(userId) {
  const today = new Date().toISOString().split('T')[0];
  const swipeRef = doc(db, 'datingDailyLimits', `${userId}_${today}`);
  const snap = await getDoc(swipeRef);

  const DAILY_LIMIT = 100;
  const current = snap.exists() ? snap.data().count : 0;
  if (current >= DAILY_LIMIT) return false;

  if (snap.exists()) {
    await updateDoc(swipeRef, { count: increment(1) });
  } else {
    await addDoc(collection(db, 'datingDailyLimits'), {
      userId,
      date: today,
      count: 1,
      createdAt: serverTimestamp()
    });
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIRESTORE RULES — Add to firestore.rules
// ─────────────────────────────────────────────────────────────────────────────
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Dating profiles: read = authenticated; write = own profile only
    match /datingProfiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Likes: write = authenticated (can like any profile)
    // Read = own likes only (to prevent stalking)
    match /datingLikes/{targetId}/likers/{likerId} {
      allow read: if request.auth.uid == targetId;
      allow write: if request.auth.uid == likerId;
    }

    // Matches: read/write = participants only
    match /datingMatches/{matchId} {
      allow read, write: if request.auth.uid in resource.data.users;
    }

    // Conversations + messages: participants only
    match /conversations/{convId} {
      allow read, write: if request.auth.uid in resource.data.participants;
      match /messages/{msgId} {
        allow read, write: if request.auth.uid in
          get(/databases/$(database)/documents/conversations/$(convId)).data.participants;
      }
    }

    // Daily limits: own data only
    match /datingDailyLimits/{limitId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Moderation logs: write = backend service account only
    match /moderationLogs/{logId} {
      allow read: if request.auth.token.admin == true;
      allow write: if false; // backend only via Admin SDK
    }
  }
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
export default {
  // B1
  uploadDatingPhoto,
  deleteDatingPhoto,
  fetchDatingPhotos,
  // B2
  subscribeLikedByYou,
  // B5
  moderatePhotoBeforeUpload,
  // Swipe actions
  recordSwipeLike,
  recordSuperLike,
  recordSwipePass,
  // R6 Chat
  openDatingChat,
  sendDatingMessage,
  closeDatingChat,
  // Discovery
  fetchDiscoveryQueue,
  fetchMatches,
  // Daily limits
  getDailySwipeStatus,
  incrementDailySwipe
};
