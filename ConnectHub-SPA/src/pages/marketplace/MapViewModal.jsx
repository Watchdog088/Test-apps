// MapViewModal.jsx — M26: Map View with OpenStreetMap (no API key required)
import React, { useState } from 'react';

// DC-area bounding box for the demo
const OSM_EMBED =
  'https://www.openstreetmap.org/export/embed.html' +
  '?bbox=-77.15%2C38.85%2C-76.95%2C38.97&layer=mapnik';

// Simulated pin positions (percentage from top-left of iframe)
const PINS = [
  { x: '24%', y: '38%', idx: 0 },
  { x: '44%', y: '56%', idx: 1 },
  { x: '61%', y: '29%', idx: 2 },
  { x: '34%', y: '66%', idx: 3 },
  { x: '71%', y: '48%', idx: 4 },
  { x: '19%', y: '61%', idx: 5 },
];

export default function MapViewModal({ open, onClose, products, onSelectItem }) {
  const [selected, setSelected] = useState(null);

  if (!open) return null;

  const items = (products || []).slice(0, 6);

  const handleClose = () => { setSelected(null); onClose(); };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.93)', zIndex:300, display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', background:'#1e293b', borderBottom:'1px solid #334155', flexShrink:0 }}>
        <div>
          <span style={{ fontWeight:700, fontSize:'16px', color:'#f1f5f9' }}>🗺️ Nearby Listings</span>
          <span style={{ marginLeft:'10px', fontSize:'12px', color:'#64748b' }}>Washington, DC area</span>
        </div>
        <button style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }} onClick={handleClose}>✕</button>
      </div>

      {/* Map area */}
      <div style={{ flex:1, position:'relative', overflow:'hidden', minHeight:0 }}>
        {/* OpenStreetMap iframe — no API key needed */}
        <iframe
          title="Nearby marketplace listings"
          src={OSM_EMBED}
          style={{ width:'100%', height:'100%', border:'none', display:'block' }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />

        {/* Listings count badge */}
        <div style={{ position:'absolute', top:'12px', left:'12px', zIndex:10, pointerEvents:'none' }}>
          <div style={{ background:'rgba(10,10,24,0.88)', backdropFilter:'blur(8px)', borderRadius:'12px', padding:'8px 14px', border:'1px solid #334155' }}>
            <div style={{ color:'#a5b4fc', fontSize:'12px', fontWeight:700 }}>
              {'📍 ' + items.length + ' listings near you'}
            </div>
          </div>
        </div>

        {/* Listing pin markers */}
        {PINS.map((pin) => {
          const item = items[pin.idx];
          if (!item) return null;
          const isSelected = selected && selected.id === item.id;
          return (
            <div
              key={pin.idx}
              style={{
                position: 'absolute',
                left: pin.x,
                top: pin.y,
                transform: 'translate(-50%, -100%)',
                zIndex: isSelected ? 30 : 20,
                cursor: 'pointer',
              }}
              onClick={() => setSelected(isSelected ? null : item)}
            >
              {/* Teardrop pin */}
              <div style={{
                width: '36px', height: '36px',
                background: isSelected ? 'linear-gradient(135deg,#10b981,#6366f1)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isSelected ? '0 0 0 3px rgba(16,185,129,0.5), 0 6px 16px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.4)',
                transition: 'all 0.2s ease',
              }}>
                <span style={{ transform: 'rotate(45deg)', fontSize: '15px' }}>{item.emoji || '📦'}</span>
              </div>
              {/* Price bubble */}
              <div style={{
                position: 'absolute',
                bottom: '-22px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                background: '#0f172a',
                border: '1px solid ' + (isSelected ? '#10b981' : '#6366f1'),
                borderRadius: '6px',
                padding: '2px 7px',
                fontSize: '11px',
                color: '#10b981',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                transform: 'translateX(-50%)',
              }}>
                {'$' + item.price}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom panel */}
      {selected ? (
        <div style={{ background:'#1e293b', borderTop:'1px solid #334155', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'12px', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0, border:'1px solid #334155' }}>
            {selected.emoji || '📦'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:'14px', color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {selected.title}
            </div>
            <div style={{ display:'flex', gap:'10px', alignItems:'center', marginTop:'4px' }}>
              <span style={{ color:'#10b981', fontWeight:800, fontSize:'16px' }}>{'$' + selected.price}</span>
              <span style={{ color:'#64748b', fontSize:'11px' }}>{'📍 ' + (selected.distance || '< 2 mi away')}</span>
              <span style={{ color:'#64748b', fontSize:'11px' }}>{selected.seller}</span>
            </div>
          </div>
          <button
            onClick={() => { handleClose(); if (onSelectItem) onSelectItem(selected); }}
            style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:'10px', padding:'10px 16px', color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer', flexShrink:0 }}>
            View →
          </button>
        </div>
      ) : (
        <div style={{ background:'#1e293b', borderTop:'1px solid #334155', padding:'12px 16px', flexShrink:0 }}>
          {/* Horizontal scroll of nearby listings */}
          <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'10px', fontWeight:600 }}>TAP A PIN TO VIEW DETAILS</div>
          <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'4px' }}>
            {items.map((item) => (
              <div key={item.id} onClick={() => setSelected(item)}
                style={{ flexShrink:0, background:'#0f172a', borderRadius:'12px', padding:'10px 12px', border:'1px solid #1e293b', cursor:'pointer', minWidth:'120px', textAlign:'center' }}>
                <div style={{ fontSize:'22px', marginBottom:'4px' }}>{item.emoji || '📦'}</div>
                <div style={{ fontSize:'11px', color:'#94a3b8', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100px' }}>{item.title}</div>
                <div style={{ color:'#10b981', fontWeight:800, fontSize:'13px' }}>{'$' + item.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
