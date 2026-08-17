/**
 * admin-monitoring-service.js — Sprint 4: Real-time admin monitoring service
 * Aggregates live streaming stats for the admin dashboard.
 * NEW file — nothing imports it until AdminStreamsMonitorPage and AdminDashboardPage wire it up.
 */

import { db } from '@/firebase/config';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  getCountFromServer,
} from 'firebase/firestore';

// ── Subscribe to all active streams ───────────────────────────────
export function subscribeToActiveStreams(callback) {
  const q = query(
    collection(db, 'streams'),
    where('status', '==', 'active'),
    orderBy('viewerCount', 'desc'),
    limit(50),
  );

  return onSnapshot(q, snap => {
    const streams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalViewers = streams.reduce((sum, s) => sum + (s.viewerCount || 0), 0);
    callback({ streams, totalViewers, activeCount: streams.length });
  }, err => {
    console.warn('[admin-monitoring] subscribeToActiveStreams error:', err.code);
    callback({ streams: [], totalViewers: 0, activeCount: 0 });
  });
}

// ── Get stream count summary ───────────────────────────────────────
export async function getStreamSummary() {
  try {
    const [activeSnap, todaySnap] = await Promise.all([
      getCountFromServer(query(collection(db, 'streams'), where('status', '==', 'active'))),
      getCountFromServer(query(
        collection(db, 'streams'),
        where('startedAt', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      )),
    ]);
    return {
      activeStreams: activeSnap.data().count,
      streamsLast24h: todaySnap.data().count,
    };
  } catch {
    return { activeStreams: 0, streamsLast24h: 0 };
  }
}

// ── Subscribe to streams that were force-ended by admin ───────────
export function subscribeToAdminActions(callback) {
  const q = query(
    collection(db, 'streams'),
    where('adminForceEnded', '==', true),
    orderBy('adminEndedAt', 'desc'),
    limit(20),
  );

  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, () => callback([]));
}

// ── Subscribe to pending payout requests ──────────────────────────
export function subscribeToPendingPayouts(callback) {
  const q = query(
    collection(db, 'payouts'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
    limit(50),
  );

  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, () => callback([]));
}

export default {
  subscribeToActiveStreams,
  getStreamSummary,
  subscribeToAdminActions,
  subscribeToPendingPayouts,
};
