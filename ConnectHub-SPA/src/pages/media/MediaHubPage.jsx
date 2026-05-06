import React from 'react';
import { useNavigate } from 'react-router-dom';

// TODO: Build out full Media Hub page
export default function MediaHubPage() {
  const navigate = useNavigate();
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      padding:'60px 24px',gap:'16px',textAlign:'center',minHeight:'60vh'}}>
      <div style={{fontSize:'56px'}}>🎬</div>
      <h2 style={{fontSize:'22px',fontWeight:700}}>Media Hub</h2>
      <p style={{color:'#94a3b8',fontSize:'14px',maxWidth:'260px'}}>
        This section is under construction.<br/>Full implementation coming soon.
      </p>
      <button style={{
        marginTop:'8px',background:'linear-gradient(135deg,#6366f1,#ec4899)',
        color:'white',border:'none',borderRadius:'12px',padding:'10px 20px',
        fontWeight:600,fontSize:'14px',cursor:'pointer',
      }} onClick={()=>navigate(-1)}>← Go Back</button>
    </div>
  );
}
