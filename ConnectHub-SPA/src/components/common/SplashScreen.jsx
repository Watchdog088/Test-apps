import React from 'react';
export default function SplashScreen() {
  return (
    <div style={{
      position:'fixed',inset:0,display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',gap:'16px',
      background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      zIndex:9999,
    }}>
      <div style={{
        width:'64px',height:'64px',borderRadius:'16px',
        background:'linear-gradient(135deg,#6366f1,#ec4899)',
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:'28px', boxShadow:'0 0 40px rgba(99,102,241,0.5)',
      }}>⚡</div>
      <span style={{
        fontSize:'24px',fontWeight:800,
        background:'linear-gradient(135deg,#6366f1,#ec4899)',
        WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
      }}>ConnectHub</span>
      <div style={{
        width:'40px',height:'40px',borderRadius:'50%',
        border:'3px solid rgba(255,255,255,0.1)',borderTopColor:'#6366f1',
        animation:'spin 0.8s linear infinite',marginTop:'16px',
      }}/>
    </div>
  );
}
