// src/services/friends-firestore-service.js
// Section 9 — Friends: Firestore integration layer
// Handles friend requests, online presence, birthday reminders, remove friend

import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp, updateDoc,
  orderBy, limit, writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';

// ─── Collections ─────────────────────────────────────────────────────────────
const FRIENDS_COL      = 'friends';
const REQUESTS_COL     = 'friendRequests';
const PRESENCE_COL     = 'presence';
const USERS_COL        = 'users';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => auth.currentUser?.uid;
const pairId = (a, b) => [a, b].sort().join('_');

// ─── Send a Friend Request ────────────────────────────────────────────────────
export async function sendFriendRequest(toUid) {
  const fromUid = uid();
  if (!fromUid) throw new Error('Not authenticated');
  const reqId = `${fromUid}_${toUid}`;
  await setDoc(doc(db, REQUESTS_COL, reqId), {
    fromUid,
    toUid,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

// ─── Accept a Friend Request ──────────────────────────────────────────────────
export async function acceptFriendRequest(fromUid) {
  const toUid = uid();
  if (!toUid) throw new Error('Not authenticated');
  const reqId = `${fromUid}_${toUid}`;
  const batch = writeBatch(db);

  // Update request status
  batch.update(doc(db, REQUESTS_COL, reqId), {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  });

  // Add bidirectional friendship docs
  const friendId = pairId(fromUid, toUid);
  batch.set(doc(db, FRIENDS_COL, friendId), {
    users: [fromUid, toUid],
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

// ─── Decline a Friend Request ─────────────────────────────────────────────────
export async function declineFriendRequest(fromUid) {
  const toUid = uid();
  if (!toUid) throw new Error('Not authenticated');
  const reqId = `${fromUid}_${toUid}`;
  await updateDoc(doc(db, REQUESTS_COL, reqId), {
    status: 'declined',
    declinedAt: serverTimestamp(),
  });
}

// ─── Remove / Unfriend ────────────────────────────────────────────────────────
export async function removeFriend(otherUid) {
  const me = uid();
  if (!me) throw new Error('Not authenticated');
  const friendId = pairId(me, otherUid);
  await deleteDoc(doc(db, FRIENDS_COL, friendId));
}

// ─── Cancel sent request ──────────────────────────────────────────────────────
export async function cancelFriendRequest(toUid) {
  const fromUid = uid();
  if (!fromUid) throw new Error('Not authenticated');
  const reqId = `${fromUid}_${toUid}`;
  await deleteDoc(doc(db, REQUESTS_COL, reqId));
}

// ─── Get Friends List (real-time listener) ────────────────────────────────────
export function subscribeFriends(callback) {
  const me = uid();
  if (!me) return () => {};
  const q = query(collection(db, FRIENDS_COL), where('users', 'array-contains', me));
  return onSnapshot(q, async (snap) => {
    const friends = await Promise.all(
      snap.docs.map(async (d) => {
        const otherUid = d.data().users.find((u) => u !== me);
        try {
          const userDoc = await getDoc(doc(db, USERS_COL, otherUid));
          const presence = await getDoc(doc(db, PRESENCE_COL, otherUid));
          return {
            id: otherUid,
            ...userDoc.data(),
            online: presence.exists() ? presence.data()?.online ?? false : false,
            lastSeen: presence.exists() ? presence.data()?.lastSeen ?? null : null,
            friendSince: d.data().createdAt,
          };
        } catch {
          return { id: otherUid, name: 'Unknown User', online: false };
        }
      })
    );
    callback(friends);
  });
}

// ─── Get Incoming Requests (real-time) ───────────────────────────────────────
export function subscribeIncomingRequests(callback) {
  const me = uid();
  if (!me) return () => {};
  const q = query(
    collection(db, REQUESTS_COL),
    where('toUid', '==', me),
    where('status', '==', 'pending')
  );
  return onSnapshot(q, async (snap) => {
    const requests = await Promise.all(
      snap.docs.map(async (d) => {
        try {
          const userDoc = await getDoc(doc(db, USERS_COL, d.data().fromUid));
          return { id: d.id, ...d.data(), ...userDoc.data() };
        } catch {
          return { id: d.id, ...d.data(), name: 'Unknown User' };
        }
      })
    );
    callback(requests);
  });
}

// ─── Get Sent Requests (real-time) ───────────────────────────────────────────
export function subscribeSentRequests(callback) {
  const me = uid();
  if (!me) return () => {};
  const q = query(
    collection(db, REQUESTS_COL),
    where('fromUid', '==', me),
    where('status', '==', 'pending')
  );
  return onSnapshot(q, async (snap) => {
    const requests = await Promise.all(
      snap.docs.map(async (d) => {
        try {
          const userDoc = await getDoc(doc(db, USERS_COL, d.data().toUid));
          return { id: d.id, ...d.data(), ...userDoc.data() };
        } catch {
          return { id: d.id, ...d.data(), name: 'Unknown User' };
        }
      })
    );
    callback(requests);
  });
}

// ─── Get Friend Suggestions ───────────────────────────────────────────────────
export async function getFriendSuggestions(limitCount = 10) {
  try {
    const q = query(
      collection(db, USERS_COL),
      orderBy('createdAt', 'desc'),
      limit(limitCount + 5)
    );
    const snap = await getDocs(q);
    const me = uid();
    return snap.docs
      .filter((d) => d.id !== me)
      .slice(0, limitCount)
      .map((d) => ({ id: d.id, ...d.data(), reason: 'People you may know' }));
  } catch {
    return [];
  }
}

// ─── Birthday Reminders (users with birthday this week) ──────────────────────
export async function getBirthdayReminders() {
  const me = uid();
  if (!me) return [];
  try {
    const friendsQ = query(collection(db, FRIENDS_COL), where('users', 'array-contains', me));
    const friendsSnap = await getDocs(friendsQ);
    const otherUids = friendsSnap.docs.map((d) => d.data().users.find((u) => u !== me));

    const today = new Date();
    const month = today.getMonth() + 1;
    const dayStart = today.getDate();
    const dayEnd = dayStart + 7;

    const reminders = [];
    for (const oUid of otherUids) {
      const userDoc = await getDoc(doc(db, USERS_COL, oUid));
      if (!userDoc.exists()) continue;
      const u = userDoc.data();
      if (!u.birthday) continue;
      // birthday stored as "MM-DD"
      const [bMonth, bDay] = (u.birthday || '').split('-').map(Number);
      if (bMonth === month && bDay >= dayStart && bDay <= dayEnd) {
        const daysUntil = bDay - dayStart;
        reminders.push({ id: oUid, ...u, daysUntil, birthday: u.birthday });
      }
    }
    return reminders;
  } catch {
    return [];
  }
}

// ─── Set Online Presence ──────────────────────────────────────────────────────
export async function setOnlinePresence(online = true) {
  const me = uid();
  if (!me) return;
  try {
    await setDoc(
      doc(db, PRESENCE_COL, me),
      { online, lastSeen: serverTimestamp(), uid: me },
      { merge: true }
    );
  } catch {
    // Silently fail — presence is non-critical
  }
}

// ─── Subscribe Online Presence for a specific uid ────────────────────────────
export function subscribePresence(targetUid, callback) {
  return onSnapshot(doc(db, PRESENCE_COL, targetUid), (snap) => {
    callback(snap.exists() ? snap.data() : { online: false });
  });
}

// ─── Search Users by display name ────────────────────────────────────────────
export async function searchUsers(queryStr) {
  if (!queryStr || queryStr.length < 2) return [];
  try {
    const q = query(
      collection(db, USERS_COL),
      where('displayNameLower', '>=', queryStr.toLowerCase()),
      where('displayNameLower', '<=', queryStr.toLowerCase() + '\uf8ff'),
      limit(15)
    );
    const snap = await getDocs(q);
    const me = uid();
    return snap.docs.filter((d) => d.id !== me).map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}
