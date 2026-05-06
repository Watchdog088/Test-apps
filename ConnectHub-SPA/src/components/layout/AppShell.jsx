// src/components/layout/AppShell.jsx
// Stable container: TopNav + scrollable page content + BottomNav
// Uses React Router's <Outlet /> — never remounts on page change

import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import Toast from '../common/Toast';
import useAppStore from '@store/useAppStore';

export default function AppShell() {
  const toast = useAppStore((s) => s.toast);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <TopNav />
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Outlet />
      </main>
      <BottomNav />
      {toast && <Toast message={toast} />}
    </div>
  );
}
