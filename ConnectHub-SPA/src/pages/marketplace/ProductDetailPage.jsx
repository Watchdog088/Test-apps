// src/pages/marketplace/ProductDetailPage.jsx
// Full product detail dashboard with photos, seller, reviews, buy/cart

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';
import VerifiedBadge from '../../components/common/VerifiedBadge';

const DEMO_PRODUCT = {
  id: 'p1', title: 'Vintage Leather Camera Bag — Canon/Nikon Compatible',
  price: 89.99, originalPrice: 149.99, discount: 40,
  seller: 'Jordan Maxwell', sellerUid: 'seller-001', sellerRating: 4.9, sellerSales: 847,
  sellerEmoji: '🌸', verified: true, condition: 'Like New',
  category: 'Photography', location: 'Brooklyn, NY', shipping: 'Free shipping',
  rating: 4.8, reviewCount: 124,
  images: [
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
    'https://images.unsplash.com/photo-1452780212461-b8d0d8588de0?w=600',
  ],
  description: 'Genuine leather vintage camera bag with adjustable strap. Fits most DSLR cameras with 1-2 lenses. Multiple compartments. Interior dimensions: 11" x 8" x 5". Only used twice — in excellent condition. Comes with original dust bag.',
  tags: ['Camera', 'Photography', 'Vintage', 'Leather', 'DSLR'],
};

const REVIEWS = [
  { id: 1, author: 'Alex C.', emoji: '🔥', rating: 5, text: 'Exactly as described! Beautiful bag, very fast shipping. Highly recommend!', time: '3d ago' },
  { id: 2, author: 'Riley J.', emoji: '💪', rating: 5, text: 'Perfect for my mirrorless camera. Looks even better in person.', time: '1w ago' },
  { id: 3, author: 'Morgan T.', emoji: '🎨', rating: 4, text: 'Great quality leather. Shipping was fast. Only minor scuff I didn\'t notice in photos.', time: '2w ago' },
];

function Stars({ rating, size = 14 }) {
  return <span style={{ fontSize: size }}>{'⭐'.repeat(Math.round(rating))}</span>;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(false);

  function addToCart() {
    showToast(`🛒 Added to cart! (x${qty})`, 'success');
  }

  function buyNow() {
    showToast('💳 Proceeding to checkout…', 'info');
    navigate('/marketplace/checkout');
  }

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>Product Details</span>
        <button onClick={() => { setSaved(s => !s); showToast(saved ? 'Removed from wishlist' : '❤️ Saved to wishlist', 'success'); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>
          {saved ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Image Gallery */}
      <div style={{ position: 'relative', height: 280, background: '#111', overflow: 'hidden' }}>
        <img src={DEMO_PRODUCT.images[imgIdx]} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', borderRadius: 10, padding: '4px 10px', fontSize: 12, color: 'white', fontWeight: 700 }}>
          -{DEMO_PRODUCT.discount}%
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {DEMO_PRODUCT.images.map((_, i) => (
            <button key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 20 : 8, height: 8, borderRadius: 4, background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }} />
          ))}
        </div>
      </div>

      {/* Thumbnail row */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', overflowX: 'auto' }}>
        {DEMO_PRODUCT.images.map((img, i) => (
          <div key={i} onClick={() => setImgIdx(i)} style={{ width: 60, height: 60, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === imgIdx ? '#6366f1' : 'transparent'}`, flexShrink: 0, cursor: 'pointer' }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      {/* Product Info */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>{DEMO_PRODUCT.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9' }}>${DEMO_PRODUCT.price}</span>
          <span style={{ fontSize: 16, color: '#64748b', textDecoration: 'line-through' }}>${DEMO_PRODUCT.originalPrice}</span>
          <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: 8, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>Save ${(DEMO_PRODUCT.originalPrice - DEMO_PRODUCT.price).toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {[['📦', DEMO_PRODUCT.shipping], ['🏷️', DEMO_PRODUCT.condition], ['📍', DEMO_PRODUCT.location]].map(([icon, text], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '5px 10px', fontSize: 12, color: '#94a3b8' }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <Stars rating={DEMO_PRODUCT.rating} /><span style={{ fontSize: 13, color: '#94a3b8' }}>{DEMO_PRODUCT.rating} ({DEMO_PRODUCT.reviewCount} reviews)</span>
        </div>

        {/* Seller Card */}
        <div onClick={() => navigate(`/marketplace/seller/${DEMO_PRODUCT.sellerUid}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{DEMO_PRODUCT.sellerEmoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', display: 'flex', gap: 6, alignItems: 'center' }}>
              {DEMO_PRODUCT.seller}
              {DEMO_PRODUCT.verified && <VerifiedBadge variant="marketplace" size="sm" style={{ marginLeft: 4 }} />}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>⭐ {DEMO_PRODUCT.sellerRating} · {DEMO_PRODUCT.sellerSales} sales</div>
          </div>
          <button onClick={e => { e.stopPropagation(); navigate(`/messages/${DEMO_PRODUCT.sellerUid}`); }} style={{ padding: '7px 14px', borderRadius: 14, background: 'rgba(99,102,241,0.2)', border: 'none', color: '#818cf8', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Message</button>
        </div>

        {/* Description */}
        <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>Description</div>
        <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 16 }}>{DEMO_PRODUCT.description}</div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {DEMO_PRODUCT.tags.map(tag => (
            <span key={tag} onClick={() => navigate(`/hashtag/${tag}`)} style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', borderRadius: 10, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>#{tag}</span>
          ))}
        </div>

        {/* Reviews */}
        <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 700, marginBottom: 12 }}>⭐ Reviews ({DEMO_PRODUCT.reviewCount})</div>
        {REVIEWS.map(r => (
          <div key={r.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 12, marginBottom: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{r.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{r.author}</div>
                <div style={{ fontSize: 11 }}><Stars rating={r.rating} size={10} /></div>
              </div>
              <span style={{ fontSize: 11, color: '#475569' }}>{r.time}</span>
            </div>
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{r.text}</div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom CTAs */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,24,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '8px 12px' }}>
          <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' }}>−</button>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', minWidth: 20, textAlign: 'center' }}>{qty}</span>
          <button onClick={() => setQty(q => q + 1)} style={{ background: 'none', border: 'none', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' }}>+</button>
        </div>
        <button onClick={addToCart} style={{ flex: 1, padding: '12px', borderRadius: 14, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>🛒 Cart</button>
        <button onClick={buyNow} style={{ flex: 2, padding: '12px', borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>⚡ Buy Now</button>
      </div>
    </div>
  );
}
