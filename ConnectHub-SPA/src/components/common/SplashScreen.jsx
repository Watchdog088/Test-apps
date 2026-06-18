// SplashScreen.jsx — LynkApp animated splash shown during auth loading
import React from 'react';

export default function SplashScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0a18',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      {/* Logo */}
      <div style={{
        width: 88, height: 88,
        borderRadius: 24,
        background: 'linear-gradient(135deg, #6366f1, #ec4899)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 42, marginBottom: 20,
        boxShadow: '0 0 48px rgba(99,102,241,0.45), 0 0 80px rgba(236,72,153,0.2)'
      }}>
        🔗
      </div>

      {/* App name */}
      <h1 style={{
        color: '#f1f5f9', fontSize: 30, fontWeight: 800,
        margin: 0, letterSpacing: '-0.5px'
      }}>
        LynkApp
      </h1>
      <p style={{ color: '#64748b', fontSize: 13, marginTop: 6, marginBottom: 0 }}>
        Connecting your world
      </p>

      {/* Spinner */}
      <div style={{
        marginTop: 44, width: 36, height: 36,
        borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.08)',
        borderTopColor: '#6366f1',
        animation: 'lynk-spin 0.75s linear infinite'
      }} />

      <style>{`
        @keyframes lynk-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
