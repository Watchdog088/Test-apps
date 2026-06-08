/**
 * meetings-firestore-service.js
 * Real-time Firestore backend for LynkApp Meeting Rooms
 *
 * Firestore schema:
 *   meetings/{roomId}              — room metadata
 *   meetings/{roomId}/participants/{uid}  — live presence
 *   meetings/{roomId}/waitingRoom/{uid}   — knock-to-enter queue
 *   meetings/{roomId}/chat/{msgId}        — in-call chat
 *   userMeetings/{uid}             — meeting history (doc w/ array)
 */

import { db } from '../firebase/config';
import {
  doc, collection, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, onSnapshot, serverTimestamp,
  query, orderBy, limit, arrayUnion, Timestamp
} from 'firebase/firestore';

// ── Helpers ────────────────────────────────────────────────────────────────
export function generateRoomCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 9; i++) {
    if (i === 3 || i === 6) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // e.g. "abc-def-123"
}

function roomRef(roomId)         { return doc(db, 'meetings', roomId); }
function participantsCol(roomId) { return collection(db, 'meetings', roomId, 'participants'); }
function participantRef(roomId, uid) { return doc(db, 'meetings', roomId, 'participants', uid); }
function waitingCol(roomId)      { return collection(db, 'meetings', roomId, 'waitingRoom'); }
function waitingRef(roomId, uid) { return doc(db, 'meetings', roomId, 'waitingRoom', uid); }
function chatCol(roomId)         { return collection(db, 'meetings', roomId, 'chat'); }

// ── Create a new meeting ───────────────────────────────────────────────────
export async function createMeeting({ hostId, hostName, hostAvatar, title, type = 'friends', settings = {} }) {
  const roomId = generateRoomCode();
  const data = {
    roomId,
    title: title || `${hostName}'s Meeting`,
    type,                   // 'friends' | 'team'
    hostId,
    hostName,
    hostAvatar: hostAvatar || '',
    status: 'active',       // 'waiting' | 'active' | 'ended'
    settings: {
      requireApproval: false,
      maxParticipants: type === 'team' ? 50 : 12,
      muteOnJoin: false,
      allowChat: true,
      allowScreenShare: true,
      allowHandRaise: true,
      ...settings,
    },
    createdAt: serverTimestamp(),
    startedAt: serverTimestamp(),
    endedAt: null,
    participantCount: 0,
  };
  await setDoc(roomRef(roomId), data);
  return { roomId, ...data };
}

// ── Schedule a future meeting ──────────────────────────────────────────────
export async function scheduleMeeting({ hostId, hostName, hostAvatar, title, scheduledAt, type = 'team', settings = {} }) {
  const roomId = generateRoomCode();
  const data = {
    roomId,
    title: title || 'Scheduled Meeting',
    type,
    hostId,
    hostName,
    hostAvatar: hostAvatar || '',
    status: 'scheduled',
    settings: {
      requireApproval: false,
      maxParticipants: 50,
      muteOnJoin: true,
      allowChat: true,
      allowScreenShare: true,
      allowHandRaise: true,
      ...settings,
    },
    createdAt: serverTimestamp(),
    scheduledAt: Timestamp.fromDate(new Date(scheduledAt)),
    startedAt: null,
    endedAt: null,
    participantCount: 0,
  };
  await setDoc(roomRef(roomId), data);
  return { roomId, ...data };
}

// ── Get room data ──────────────────────────────────────────────────────────
export async function getMeeting(roomId) {
  const snap = await getDoc(roomRef(roomId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ── Join room (add to participants) ───────────────────────────────────────
export async function joinRoom(roomId, { uid, displayName, photoURL }) {
  const pData = {
    uid,
    name: displayName || 'Guest',
    avatar: photoURL || '',
    joinedAt: serverTimestamp(),
    micOn: true,
    camOn: true,
    handRaised: false,
    isSpeaking: false,
    isHost: false,
    isPinned: false,
    screenSharing: false,
    role: 'participant',
  };
  await setDoc(participantRef(roomId, uid), pData);
  // Update count
  try {
    const snap = await getDoc(roomRef(roomId));
    if (snap.exists()) {
      await updateDoc(roomRef(roomId), {
        participantCount: (snap.data().participantCount || 0) + 1,
        status: 'active',
      });
    }
  } catch {}
  return pData;
}

// ── Leave room ─────────────────────────────────────────────────────────────
export async function leaveRoom(roomId, uid) {
  try {
    await deleteDoc(participantRef(roomId, uid));
    const snap = await getDoc(roomRef(roomId));
    if (snap.exists()) {
      const count = Math.max(0, (snap.data().participantCount || 1) - 1);
      await updateDoc(roomRef(roomId), { participantCount: count });
    }
  } catch {}
}

// ── End room (host only) ───────────────────────────────────────────────────
export async function endRoom(roomId) {
  await updateDoc(roomRef(roomId), {
    status: 'ended',
    endedAt: serverTimestamp(),
  });
}

// ── Update own participant state ───────────────────────────────────────────
export async function updateParticipantState(roomId, uid, updates) {
  try {
    await updateDoc(participantRef(roomId, uid), updates);
  } catch {}
}

// ── Waiting room: request to join ─────────────────────────────────────────
export async function requestToJoin(roomId, { uid, displayName, photoURL }) {
  await setDoc(waitingRef(roomId, uid), {
    uid,
    name: displayName || 'Guest',
    avatar: photoURL || '',
    requestedAt: serverTimestamp(),
    status: 'pending',   // 'pending' | 'approved' | 'denied'
  });
}

// ── Host: approve or deny a waiting participant ───────────────────────────
export async function resolveWaitingParticipant(roomId, uid, approved) {
  await updateDoc(waitingRef(roomId, uid), {
    status: approved ? 'approved' : 'denied',
    resolvedAt: serverTimestamp(),
  });
}

// ── Waiting room: check own status (poll) ─────────────────────────────────
export async function getWaitingStatus(roomId, uid) {
  const snap = await getDoc(waitingRef(roomId, uid));
  if (!snap.exists()) return null;
  return snap.data().status;
}

// ── Send a chat message ────────────────────────────────────────────────────
export async function sendChatMessage(roomId, { uid, name, avatar, text }) {
  await addDoc(chatCol(roomId), {
    uid,
    name,
    avatar: avatar || '',
    text,
    sentAt: serverTimestamp(),
  });
}

// ── Real-time listeners ────────────────────────────────────────────────────
export function listenParticipants(roomId, callback) {
  return onSnapshot(participantsCol(roomId), (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

export function listenWaitingRoom(roomId, callback) {
  return onSnapshot(waitingCol(roomId), (snap) => {
    const list = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(w => w.status === 'pending');
    callback(list);
  });
}

export function listenChat(roomId, callback) {
  const q = query(chatCol(roomId), orderBy('sentAt', 'asc'), limit(200));
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}

export function listenRoom(roomId, callback) {
  return onSnapshot(roomRef(roomId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

// ── User meeting history ───────────────────────────────────────────────────
export async function saveMeetingToHistory(uid, meeting) {
  try {
    await setDoc(doc(db, 'userMeetings', uid), {
      meetings: arrayUnion({
        roomId: meeting.roomId,
        title: meeting.title,
        type: meeting.type,
        joinedAt: new Date().toISOString(),
        hostName: meeting.hostName,
      })
    }, { merge: true });
  } catch {}
}

export async function getMeetingHistory(uid) {
  try {
    const snap = await getDoc(doc(db, 'userMeetings', uid));
    if (!snap.exists()) return [];
    return (snap.data().meetings || []).reverse().slice(0, 20);
  } catch { return []; }
}

// ── Get upcoming scheduled meetings for a user ────────────────────────────
export async function getUpcomingMeetings(uid) {
  // Simple approach: return from user's history that are scheduled
  // A production app would use a proper query with index
  try {
    const history = await getMeetingHistory(uid);
    const upcoming = [];
    for (const h of history.slice(0, 10)) {
      const m = await getMeeting(h.roomId);
      if (m && m.status === 'scheduled') upcoming.push(m);
    }
    return upcoming;
  } catch { return []; }
}
