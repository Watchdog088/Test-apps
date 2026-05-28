// src/pages/legal/TermsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const S = {
  page: { background: '#0a0a18', minHeight: '100vh', paddingBottom: 60, color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' },
  header: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 },
  back: { background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px', lineHeight: 1 },
  title: { fontWeight: 800, fontSize: 18, color: '#f1f5f9' },
  body: { padding: '20px 20px 40px', maxWidth: 680, margin: '0 auto' },
  hero: { textAlign: 'center', padding: '28px 0 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 28 },
  heroTitle: { fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg,#6366f1,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 },
  heroSub: { fontSize: 13, color: '#64748b' },
  section: { marginBottom: 28 },
  h2: { fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  p: { fontSize: 14, color: '#94a3b8', lineHeight: 1.75, marginBottom: 10 },
  ul: { paddingLeft: 20, marginBottom: 10 },
  li: { fontSize: 14, color: '#94a3b8', lineHeight: 1.75, marginBottom: 4 },
  highlight: { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 },
  highlightText: { fontSize: 13, color: '#a5b4fc', lineHeight: 1.7 },
  contactBox: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px', marginTop: 28 },
  contactTitle: { fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 },
  contactItem: { fontSize: 13, color: '#64748b', lineHeight: 1.8 },
  link: { color: '#818cf8', textDecoration: 'none' },
};

export default function TermsPage() {
  const navigate = useNavigate();
  const EFFECTIVE = 'May 28, 2026';

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <span style={S.title}>📋 Terms of Service</span>
      </div>

      <div style={S.body}>
        <div style={S.hero}>
          <div style={S.heroTitle}>LynkApp Terms of Service</div>
          <div style={S.heroSub}>Effective Date: {EFFECTIVE} · Last Updated: {EFFECTIVE}</div>
        </div>

        <div style={S.highlight}>
          <div style={S.highlightText}>
            <strong style={{ color: '#f1f5f9' }}>Please read these Terms carefully.</strong> By creating an account or using LynkApp, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use LynkApp.
          </div>
        </div>

        {/* Section 1 */}
        <div style={S.section}>
          <div style={S.h2}>1. Acceptance of Terms</div>
          <p style={S.p}>These Terms of Service ("Terms") govern your access to and use of LynkApp ("the App," "Service"), operated by LynkApp LLC ("LynkApp," "we," "us," or "our"). By accessing or using the Service, you confirm that you are at least 18 years old (or 13 years old with parental consent where applicable), that you have read and understood these Terms, and that you agree to be legally bound by them.</p>
          <p style={S.p}>These Terms constitute a legal agreement between you and LynkApp. We may update these Terms from time to time. We will notify you of material changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance.</p>
        </div>

        {/* Section 2 */}
        <div style={S.section}>
          <div style={S.h2}>2. Account Registration & Eligibility</div>
          <p style={S.p}>To use most features of LynkApp, you must create an account. When registering, you agree to:</p>
          <ul style={S.ul}>
            <li style={S.li}>Provide accurate, current, and complete information</li>
            <li style={S.li}>Maintain the security of your password and not share it</li>
            <li style={S.li}>Not create an account if you are under 13 years of age</li>
            <li style={S.li}>Not create more than one personal account unless specifically permitted</li>
            <li style={S.li}>Notify us immediately of any unauthorized use of your account</li>
          </ul>
          <p style={S.p}>You are responsible for all activity that occurs under your account. LynkApp reserves the right to suspend or terminate accounts that violate these Terms or for any other reason at our discretion.</p>
        </div>

        {/* Section 3 */}
        <div style={S.section}>
          <div style={S.h2}>3. User Content & Conduct</div>
          <p style={S.p}>LynkApp is a social platform. You may post, share, and interact with content ("User Content"). By submitting User Content, you grant LynkApp a non-exclusive, royalty-free, worldwide, sublicensable license to use, display, reproduce, and distribute your content within the Service and for promotional purposes.</p>
          <p style={S.p}>You are solely responsible for your User Content. You agree <strong>NOT</strong> to post, share, or transmit content that:</p>
          <ul style={S.ul}>
            <li style={S.li}>Is illegal, harmful, threatening, abusive, harassing, or hateful</li>
            <li style={S.li}>Contains nudity, sexual content involving minors (CSAM — zero tolerance, reported to law enforcement), or non-consensual intimate imagery</li>
            <li style={S.li}>Infringes on intellectual property, trademarks, or copyrights of others</li>
            <li style={S.li}>Contains malware, viruses, or other harmful code</li>
            <li style={S.li}>Constitutes spam, phishing, or deceptive content</li>
            <li style={S.li}>Impersonates another person or entity</li>
            <li style={S.li}>Violates any applicable local, national, or international law</li>
          </ul>
          <p style={S.p}>LynkApp uses automated moderation (including AI-based tools) and human review. We reserve the right to remove any content at our sole discretion and without prior notice.</p>
        </div>

        {/* Section 4 */}
        <div style={S.section}>
          <div style={S.h2}>4. Dating Features</div>
          <p style={S.p}>LynkApp includes optional dating features. By using dating features, you agree to:</p>
          <ul style={S.ul}>
            <li style={S.li}>Be at least 18 years of age</li>
            <li style={S.li}>Provide truthful information in your dating profile</li>
            <li style={S.li}>Treat other users with respect and not engage in harassment</li>
            <li style={S.li}>Not use the dating feature for commercial solicitation or escort services</li>
            <li style={S.li}>Report any suspicious activity, minors, or safety concerns through the Safety Center</li>
          </ul>
          <p style={S.p}>LynkApp is not responsible for the conduct of users you meet through the dating feature. Always exercise caution when meeting someone from the internet and follow the safety guidelines in our Safety Center.</p>
        </div>

        {/* Section 5 */}
        <div style={S.section}>
          <div style={S.h2}>5. Marketplace</div>
          <p style={S.p}>LynkApp provides a peer-to-peer marketplace for buying and selling physical and digital goods. As a seller, you agree to:</p>
          <ul style={S.ul}>
            <li style={S.li}>Only list items you legally own or have the right to sell</li>
            <li style={S.li}>Provide accurate descriptions, images, and pricing</li>
            <li style={S.li}>Complete sales and ship items as described</li>
            <li style={S.li}>Complete KYC (Know Your Customer) verification before withdrawing funds</li>
            <li style={S.li}>Not sell prohibited items (weapons, drugs, counterfeit goods, or other illegal items)</li>
          </ul>
          <p style={S.p}>LynkApp charges a platform fee on completed transactions. All payment processing is handled by Stripe. LynkApp is not responsible for disputes between buyers and sellers, but provides a dispute resolution process.</p>
        </div>

        {/* Section 6 */}
        <div style={S.section}>
          <div style={S.h2}>6. Live Streaming & Creator Content</div>
          <p style={S.p}>Users may broadcast live streams and create premium content. By using live streaming features, you agree that:</p>
          <ul style={S.ul}>
            <li style={S.li}>You will not stream illegal activity, nudity, or content that violates these Terms</li>
            <li style={S.li}>You are responsible for obtaining necessary rights to any music, video, or third-party content you stream</li>
            <li style={S.li}>Virtual gifts and tips are non-refundable once sent</li>
            <li style={S.li}>LynkApp takes a 30% platform fee on creator earnings; creators receive 70%</li>
            <li style={S.li}>Minimum payout threshold is $20; payouts are processed weekly via Stripe</li>
          </ul>
        </div>

        {/* Section 7 */}
        <div style={S.section}>
          <div style={S.h2}>7. Payments & Subscriptions</div>
          <p style={S.p}>LynkApp offers premium subscriptions and in-app purchases ("Premium Features"). By making a purchase:</p>
          <ul style={S.ul}>
            <li style={S.li}>You authorize us to charge your payment method for the applicable fees</li>
            <li style={S.li}>Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date</li>
            <li style={S.li}>Refunds are available within 7 days of purchase for digital subscriptions if the service has not been substantially used</li>
            <li style={S.li}>Virtual items (coins, gifts) are non-refundable once purchased and used</li>
          </ul>
          <p style={S.p}>All payments are processed by Stripe, Inc. LynkApp does not store your full credit card information.</p>
        </div>

        {/* Section 8 */}
        <div style={S.section}>
          <div style={S.h2}>8. Intellectual Property</div>
          <p style={S.p}>The LynkApp name, logo, design, and all software code are owned by LynkApp LLC and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our intellectual property without express written permission.</p>
          <p style={S.p}>You retain ownership of your User Content. By posting content, you grant LynkApp the license described in Section 3. You may delete your account and content at any time.</p>
        </div>

        {/* Section 9 */}
        <div style={S.section}>
          <div style={S.h2}>9. Privacy</div>
          <p style={S.p}>Your use of LynkApp is also governed by our <a href="/privacy" style={S.link}>Privacy Policy</a>, which is incorporated into these Terms by reference. The Privacy Policy explains how we collect, use, and share your personal information.</p>
        </div>

        {/* Section 10 */}
        <div style={S.section}>
          <div style={S.h2}>10. Disclaimers & Limitation of Liability</div>
          <p style={S.p}>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
          <p style={S.p}>TO THE MAXIMUM EXTENT PERMITTED BY LAW, LYNKAPP SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR DATA, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. LYNKAPP'S TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF $100 OR THE AMOUNT YOU PAID TO LYNKAPP IN THE PAST 12 MONTHS.</p>
        </div>

        {/* Section 11 */}
        <div style={S.section}>
          <div style={S.h2}>11. Indemnification</div>
          <p style={S.p}>You agree to indemnify, defend, and hold harmless LynkApp LLC, its officers, directors, employees, and agents from any claims, liabilities, damages, and expenses (including legal fees) arising out of your use of the Service, your User Content, or your violation of these Terms.</p>
        </div>

        {/* Section 12 */}
        <div style={S.section}>
          <div style={S.h2}>12. Termination</div>
          <p style={S.p}>You may delete your account at any time from Settings → Account → Delete Account. LynkApp may suspend or terminate your account immediately, without notice, for violation of these Terms or for any other reason at our discretion.</p>
          <p style={S.p}>Upon termination, your right to use the Service ceases immediately. Some provisions of these Terms (including liability limitations and indemnification) survive termination.</p>
        </div>

        {/* Section 13 */}
        <div style={S.section}>
          <div style={S.h2}>13. Governing Law & Dispute Resolution</div>
          <p style={S.p}>These Terms are governed by the laws of the District of Columbia, United States, without regard to conflict of law principles. Any disputes arising from these Terms or your use of LynkApp shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules, except that you may bring claims in small claims court if eligible.</p>
          <p style={S.p}>You waive the right to participate in a class action lawsuit or class-wide arbitration.</p>
        </div>

        {/* Section 14 */}
        <div style={S.section}>
          <div style={S.h2}>14. Miscellaneous</div>
          <p style={S.p}>These Terms constitute the entire agreement between you and LynkApp. If any provision is found unenforceable, the remaining provisions remain in full force. LynkApp's failure to enforce any right does not waive that right. You may not assign these Terms; LynkApp may assign them freely.</p>
        </div>

        <div style={S.contactBox}>
          <div style={S.contactTitle}>📬 Contact Us</div>
          <div style={S.contactItem}>Questions about these Terms? Contact us:</div>
          <div style={S.contactItem}>Email: <a href="mailto:legal@lynkapp.net" style={S.link}>legal@lynkapp.net</a></div>
          <div style={S.contactItem}>CEO: <a href="mailto:CEO@lynkapp.net" style={S.link}>CEO@lynkapp.net</a></div>
          <div style={S.contactItem}>Website: <a href="https://lynkapp.net" style={S.link}>https://lynkapp.net</a></div>
        </div>
      </div>
    </div>
  );
}
