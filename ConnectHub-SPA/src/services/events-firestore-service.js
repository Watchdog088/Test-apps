// src/services/events-firestore-service.js
// ✅ SECTION 11 FIX — Firestore persistence for Events (creation, RSVP, queries)
// Created: May 2026

import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, arrayUnion, arrayRemove,
  onSnapshot, increment, setDoc, writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const EVENTS_COL = 'events';
const RSVPS_COL  = 'eventRsvps';   // sub-collection per event

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return auth.currentUser?.uid || null;
}

function mapEvent(snap) {
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ═══════════════════════════════════════════════════════════════
//  1. CREATE EVENT (FIX: was never writing to Firestore)
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new event in Firestore.
 * @param {Object} form  - { title, type, date, time, location, desc, price, maxAttendees, lat, lng, category, tags }
 * @returns {string}     - new event document ID
 */
export async function createEvent(form) {
  const userId = uid();
  if (!userId) throw new Error('Must be signed in to create an event');

  const user = auth.currentUser;
  const docRef = await addDoc(collection(db, EVENTS_COL), {
    title:        form.title      || 'Untitled Event',
    type:         form.type       || 'In-Person',   // In-Person | Virtual | Hybrid
    category:     form.category   || '',
    date:         form.date       || '',
    time:         form.time       || '',
    location:     form.location   || '',
    lat:          form.lat        || null,
    lng:          form.lng        || null,
    description:  form.desc       || '',
    price:        form.price      || 'Free',
    maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : 50,
    coverUrl:     form.coverUrl   || '',
    tags:         form.tags       || [],
    // Organizer
    organizerId:  userId,
    organizerName: user?.displayName || 'Anonymous',
    organizerPhoto: user?.photoURL   || '',
    // Stats (updated via RSVP writes)
    goingCount:   0,
    maybeCount:   0,
    notGoingCount: 0,
    interestedCount: 0,
    // Metadata
    status:       'upcoming',   // upcoming | past | cancelled
    createdAt:    serverTimestamp(),
    updatedAt:    serverTimestamp(),
  });

  return docRef.id;
}

// ═══════════════════════════════════════════════════════════════
//  2. READ EVENTS
// ═══════════════════════════════════════════════════════════════

/** Get a single event by ID */
export async function getEvent(eventId) {
  const snap = await getDoc(doc(db, EVENTS_COL, eventId));
  return mapEvent(snap);
}

/** Get all upcoming events (ordered by date) */
export async function getUpcomingEvents(limitCount = 20) {
  const q = query(
    collection(db, EVENTS_COL),
    where('status', '==', 'upcoming'),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Get events the current user created */
export async function getMyCreatedEvents() {
  const userId = uid();
  if (!userId) return [];
  const q = query(
    collection(db, EVENTS_COL),
    where('organizerId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Get events the current user RSVPed "going" or "maybe" to */
export async function getMyAttendingEvents() {
  const userId = uid();
  if (!userId) return [];
  // Query all RSVP docs where userId matches
  const rsvpQuery = query(
    collection(db, 'allEventRsvps'),
    where('userId', '==', userId),
    where('status', 'in', ['going', 'maybe']),
    orderBy('updatedAt', 'desc'),
  );
  const rsvpSnap = await getDocs(rsvpQuery);
  if (rsvpSnap.empty) return [];

  const eventIds = rsvpSnap.docs.map(d => d.data().eventId);
  // Fetch each event (batch of promises — works for small sets)
  const eventPromises = eventIds.map(id => getDoc(doc(db, EVENTS_COL, id)));
  const eventSnaps = await Promise.all(eventPromises);
  return eventSnaps.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() }));
}

// ═══════════════════════════════════════════════════════════════
//  3. RSVP — PERSIST STATE (FIX: was only in-memory useState)
// ═══════════════════════════════════════════════════════════════

/**
 * Set or clear the current user's RSVP for an event.
 * Also updates denormalized counts on the event doc.
 *
 * @param {string} eventId
 * @param {'going'|'maybe'|'notgoing'|null} newStatus  – null = remove RSVP
 */
export async function setRsvp(eventId, newStatus) {
  const userId = uid();
  if (!userId) throw new Error('Must be signed in to RSVP');

  const rsvpDocRef   = doc(db, EVENTS_COL, eventId, RSVPS_COL, userId);
  const eventDocRef  = doc(db, EVENTS_COL, eventId);

  // Also keep a flat collection for querying "all events I'm going to"
  const flatRsvpRef  = doc(db, 'allEventRsvps', `${eventId}_${userId}`);

  // Get old RSVP to decrement count
  const oldSnap = await getDoc(rsvpDocRef);
  const oldStatus = oldSnap.exists() ? oldSnap.data().status : null;

  const batch = writeBatch(db);

  // Decrement old status count
  if (oldStatus) {
    const decrementField = `${oldStatus}Count`;
    batch.update(eventDocRef, { [decrementField]: increment(-1) });
  }

  if (!newStatus || newStatus === oldStatus) {
    // Toggle off — remove RSVP
    batch.delete(rsvpDocRef);
    batch.delete(flatRsvpRef);
  } else {
    // Set new RSVP
    const rsvpData = {
      userId,
      eventId,
      status: newStatus,
      userName: auth.currentUser?.displayName || 'Anonymous',
      userPhoto: auth.currentUser?.photoURL   || '',
      updatedAt: serverTimestamp(),
    };
    batch.set(rsvpDocRef, rsvpData);
    batch.set(flatRsvpRef, rsvpData);

    // Increment new status count
    const incrementField = `${newStatus}Count`;
    batch.update(eventDocRef, { [incrementField]: increment(1) });
  }

  await batch.commit();
  return newStatus === oldStatus ? null : newStatus;
}

/**
 * Get the current user's RSVP status for a specific event.
 * @returns {'going'|'maybe'|'notgoing'|null}
 */
export async function getMyRsvp(eventId) {
  const userId = uid();
  if (!userId) return null;
  const snap = await getDoc(doc(db, EVENTS_COL, eventId, RSVPS_COL, userId));
  return snap.exists() ? snap.data().status : null;
}

/**
 * Get all attendees for an event, grouped by status.
 * @returns { going: [], maybe: [], notgoing: [] }
 */
export async function getEventAttendees(eventId) {
  const snap = await getDocs(collection(db, EVENTS_COL, eventId, RSVPS_COL));
  const result = { going: [], maybe: [], notgoing: [] };
  snap.docs.forEach(d => {
    const data = d.data();
    if (result[data.status]) result[data.status].push(data);
  });
  return result;
}

// Real-time RSVP listener
export function listenToMyRsvp(eventId, callback) {
  const userId = uid();
  if (!userId) { callback(null); return () => {}; }
  const ref = doc(db, EVENTS_COL, eventId, RSVPS_COL, userId);
  return onSnapshot(ref, snap => {
    callback(snap.exists() ? snap.data().status : null);
  });
}

// ═══════════════════════════════════════════════════════════════
//  4. UPDATE / DELETE
// ═══════════════════════════════════════════════════════════════

export async function updateEvent(eventId, changes) {
  const ref = doc(db, EVENTS_COL, eventId);
  await updateDoc(ref, { ...changes, updatedAt: serverTimestamp() });
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, EVENTS_COL, eventId));
}

// ═══════════════════════════════════════════════════════════════
//  5. CALENDAR EXPORT — iCal RFC 5545 (FIX: was missing)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate an iCal (.ics) string for an event and trigger download.
 * Supports: Apple Calendar, Google Calendar, Outlook
 */
export function exportToCalendar(event) {
  const {
    title = 'Event', date = '', time = '', location = '',
    description = '', id = 'ev1',
  } = event;

  // Build start/end datetimes (assume 2hr duration if no end time given)
  const dateStr   = date.replace(/-/g, '');
  const timeStart = time.replace(':', '') + '00';
  const timeEnd   = (() => {
    const [h, m] = (time || '00:00').split(':').map(Number);
    const endH   = (h + 2) % 24;
    return `${String(endH).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
  })();

  const dtStart  = dateStr && timeStart ? `${dateStr}T${timeStart}` : dateStr || '20260101T000000';
  const dtEnd    = dateStr && timeEnd   ? `${dateStr}T${timeEnd}`   : dateStr || '20260101T020000';
  const uid_cal  = `${id}@lynkapp.com`;
  const now      = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LynkApp//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid_cal}`,
    `DTSTAMP:${now}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n').slice(0, 500)}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${title.replace(/\s+/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Build a Google Calendar URL to add event.
 */
export function getGoogleCalendarUrl(event) {
  const { title = 'Event', date = '', time = '', location = '', description = '' } = event;
  const dateStr   = (date || '').replace(/-/g, '');
  const timeStart = (time || '0000').replace(':', '') + '00';
  const timeEndH  = (() => {
    const [h, m] = (time || '00:00').split(':').map(Number);
    return `${String((h + 2) % 24).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
  })();

  const start = dateStr ? `${dateStr}T${timeStart}` : '20260101T000000';
  const end   = dateStr ? `${dateStr}T${timeEndH}`  : '20260101T020000';

  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     title,
    dates:    `${start}/${end}`,
    details:  description,
    location: location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── Default export ────────────────────────────────────────────────────────
const EventsFirestoreService = {
  createEvent,
  getEvent,
  getUpcomingEvents,
  getMyCreatedEvents,
  getMyAttendingEvents,
  setRsvp,
  getMyRsvp,
  getEventAttendees,
  listenToMyRsvp,
  updateEvent,
  deleteEvent,
  exportToCalendar,
  getGoogleCalendarUrl,
};

export default EventsFirestoreService;
