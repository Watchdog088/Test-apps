// src/pages/legal/PrivacyPage.jsx
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
  highlight: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 },
  highlightText: { fontSize: 13, color: '#6ee7b7', lineHeight: 1.7 },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' },
  td: { padding: '8px 12px', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'top' },
  contactBox: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px', marginTop: 28 },
  contactTitle: { fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 },
  contactItem: { fontSize: 13, color: '#64748b', lineHeight: 1.8 },
  link: { color: '#818cf8', textDecoration: 'none' },
  badge: { display: 'inline-block', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#a5b4fc', marginLeft: 8, verticalAlign: 'middle' },
};

export default function PrivacyPage() {
  const navigate = useNavigate();
  const EFFECTIVE = 'May 28, 2026';

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <span style={S.title}>🔒 Privacy Policy</span>
      </div>

      <div style={S.body}>
        <div style={S.hero}>
          <div style={S.heroTitle}>LynkApp Privacy Policy</div>
          <div style={S.heroSub}>Effective Date: {EFFECTIVE} · Last Updated: {EFFECTIVE}</div>
        </div>

        <div style={S.highlight}>
          <div style={S.highlightText}>
            <strong style={{ color: '#f1f5f9' }}>Your privacy matters to us.</strong> This Privacy Policy explains what data we collect, why we collect it, how we use it, and your rights. We do not sell your personal information to third parties.
          </div>
        </div>

        {/* Section 1 */}
        <div style={S.section}>
          <div style={S.h2}>1. Who We Are</div>
          <p style={S.p}>LynkApp is operated by <strong style={{ color: '#e2e8f0' }}>LynkApp LLC</strong>, a company based in the United States. We provide a social networking platform including messaging, dating, live streaming, a marketplace, and creator tools.</p>
          <p style={S.p}><strong style={{ color: '#e2e8f0' }}>Data Controller:</strong> LynkApp LLC<br />
          <strong style={{ color: '#e2e8f0' }}>Email:</strong> <a href="mailto:privacy@lynkapp.net" style={S.link}>privacy@lynkapp.net</a><br />
          <strong style={{ color: '#e2e8f0' }}>Website:</strong> <a href="https://lynkapp.net" style={S.link}>https://lynkapp.net</a></p>
        </div>

        {/* Section 2 */}
        <div style={S.section}>
          <div style={S.h2}>2. Information We Collect</div>
          <p style={S.p}>We collect information in the following ways:</p>

          <p style={S.p}><strong style={{ color: '#e2e8f0' }}>2.1 Information You Provide Directly</strong></p>
          <ul style={S.ul}>
            <li style={S.li}><strong>Account registration:</strong> Name, email address, password, date of birth, phone number</li>
            <li style={S.li}><strong>Profile information:</strong> Username, bio, profile photo, location (city/state), interests</li>
            <li style={S.li}><strong>Dating profile:</strong> Gender, sexual orientation, relationship goals, photos (if you enable dating features)</li>
            <li style={S.li}><strong>Messages & content:</strong> Text messages, images, videos, stories, posts, comments, and reactions you create</li>
            <li style={S.li}><strong>Marketplace:</strong> Shipping address, payment method (processed by Stripe — we never see your full card number), KYC documents for sellers</li>
            <li style={S.li}><strong>Support requests:</strong> Information you provide when contacting support</li>
          </ul>

          <p style={S.p}><strong style={{ color: '#e2e8f0' }}>2.2 Information We Collect Automatically</strong></p>
          <ul style={S.ul}>
            <li style={S.li}><strong>Device information:</strong> Device type, operating system, browser type, app version</li>
            <li style={S.li}><strong>Usage data:</strong> Pages viewed, features used, time spent, clicks and interactions</li>
            <li style={S.li}><strong>IP address:</strong> Used for security, fraud prevention, and general location inference (country/city level)</li>
            <li style={S.li}><strong>Cookies & similar technologies:</strong> Session cookies, persistent cookies, local storage (see Section 8)</li>
            <li style={S.li}><strong>Log data:</strong> Timestamps, error logs, crash reports</li>
          </ul>

          <p style={S.p}><strong style={{ color: '#e2e8f0' }}>2.3 Information from Third Parties</strong></p>
          <ul style={S.ul}>
            <li style={S.li}><strong>Social login:</strong> If you sign in with Google, Facebook, or Apple, we receive your name, email, and profile picture from that provider</li>
            <li style={S.li}><strong>Payment processors:</strong> Stripe provides us with transaction confirmation and payment status (not full card details)</li>
            <li style={S.li}><strong>Analytics:</strong> Firebase Analytics provides aggregated usage insights</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div style={S.section}>
          <div style={S.h2}>3. How We Use Your Information</div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Purpose</th>
                <th style={S.th}>Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Provide and operate the LynkApp service', 'Contract performance'],
                ['Create and manage your account', 'Contract performance'],
                ['Process payments and marketplace transactions', 'Contract performance'],
                ['Send transactional emails (receipts, password resets)', 'Contract performance'],
                ['Match users in the dating feature', 'Consent'],
                ['Show personalized content in your feed', 'Legitimate interest'],
                ['Deliver push notifications (with your permission)', 'Consent'],
                ['Detect and prevent fraud, abuse, and security threats', 'Legitimate interest'],
                ['Moderate content and enforce our Terms of Service', 'Legitimate interest / Legal obligation'],
                ['Improve features through analytics', 'Legitimate interest'],
                ['Comply with legal obligations (subpoenas, law enforcement)', 'Legal obligation'],
                ['Show relevant advertising (with your consent)', 'Consent'],
              ].map(([purpose, basis]) => (
                <tr key={purpose}>
                  <td style={S.td}>{purpose}</td>
                  <td style={S.td}>{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4 */}
        <div style={S.section}>
          <div style={S.h2}>4. How We Share Your Information</div>
          <p style={S.p}>We do <strong>not</strong> sell your personal information. We share data only as follows:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong>Other users:</strong> Your public profile, posts, and content you share are visible to other users per your privacy settings</li>
            <li style={S.li}><strong>Service providers:</strong> We use Firebase (Google), Stripe, Cloudinary, OneSignal, and Sentry who process data on our behalf under strict data processing agreements</li>
            <li style={S.li}><strong>Dating matches:</strong> When you match with someone, your dating profile is shared with that person</li>
            <li style={S.li}><strong>Marketplace buyers/sellers:</strong> Shipping address is shared between buyer and seller to complete the transaction</li>
            <li style={S.li}><strong>Law enforcement:</strong> We disclose data when required by law, court order, or to protect the safety of users</li>
            <li style={S.li}><strong>Business transfers:</strong> If LynkApp is acquired or merges with another company, your data may be transferred as part of that transaction</li>
          </ul>

          <p style={S.p}><strong style={{ color: '#e2e8f0' }}>Our key third-party processors:</strong></p>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Service</th>
                <th style={S.th}>Purpose</th>
                <th style={S.th}>Privacy Policy</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Firebase (Google)', 'Auth, database, hosting, analytics', 'policies.google.com/privacy'],
                ['Stripe', 'Payment processing', 'stripe.com/privacy'],
                ['Cloudinary', 'Media storage & delivery', 'cloudinary.com/privacy'],
                ['OneSignal', 'Push notifications', 'onesignal.com/privacy'],
                ['Sentry', 'Error monitoring', 'sentry.io/privacy'],
              ].map(([svc, purpose, pp]) => (
                <tr key={svc}>
                  <td style={S.td}>{svc}</td>
                  <td style={S.td}>{purpose}</td>
                  <td style={S.td}><a href={`https://${pp}`} target="_blank" rel="noopener noreferrer" style={S.link}>{pp}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 5 */}
        <div style={S.section}>
          <div style={S.h2}>5. Data Retention</div>
          <p style={S.p}>We retain your data for as long as your account is active or as needed to provide you services. Specific retention periods:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong>Account data:</strong> Until you delete your account + 30 days (to allow recovery)</li>
            <li style={S.li}><strong>Messages:</strong> 12 months after account deletion, then permanently deleted</li>
            <li style={S.li}><strong>Transaction records:</strong> 7 years (required by tax/financial regulations)</li>
            <li style={S.li}><strong>Security logs:</strong> 90 days</li>
            <li style={S.li}><strong>Deleted content:</strong> Removed from active servers within 30 days; may persist in backups for up to 90 days</li>
          </ul>
        </div>

        {/* Section 6 */}
        <div style={S.section}>
          <div style={S.h2}>6. Your Rights & Choices</div>
          <p style={S.p}>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li style={S.li}><strong>Correction:</strong> Request correction of inaccurate data (you can also edit most data directly in Settings)</li>
            <li style={S.li}><strong>Deletion:</strong> Request deletion of your account and associated data (Settings → Account → Delete Account)</li>
            <li style={S.li}><strong>Data portability:</strong> Request a machine-readable export of your data</li>
            <li style={S.li}><strong>Opt-out of marketing:</strong> Unsubscribe from marketing emails via the unsubscribe link or Settings → Notifications</li>
            <li style={S.li}><strong>Withdraw consent:</strong> You may withdraw consent for optional data processing (e.g., personalized ads) at any time in Settings → Privacy</li>
            <li style={S.li}><strong>Restrict processing:</strong> Request we limit how we use your data in certain circumstances</li>
          </ul>
          <p style={S.p}>To exercise these rights, contact us at <a href="mailto:privacy@lynkapp.net" style={S.link}>privacy@lynkapp.net</a>. We will respond within 30 days.</p>

          <p style={S.p}><strong style={{ color: '#e2e8f0' }}>California Residents (CCPA):</strong> You have the right to know what personal information we collect, the right to delete, and the right to opt-out of sale. We do not sell personal information. To submit a CCPA request, email <a href="mailto:privacy@lynkapp.net" style={S.link}>privacy@lynkapp.net</a> or use the "Do Not Sell My Info" option in Settings.</p>

          <p style={S.p}><strong style={{ color: '#e2e8f0' }}>EU/UK Residents (GDPR):</strong> You have additional rights including lodging a complaint with your local data protection authority.</p>
        </div>

        {/* Section 7 */}
        <div style={S.section}>
          <div style={S.h2}>7. Children's Privacy</div>
          <p style={S.p}>LynkApp is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that we have collected personal data from a child under 13 without parental consent, we will delete that data immediately. Users of dating features must be 18 or older.</p>
          <p style={S.p}>If you believe a child has provided us with personal information, please contact us immediately at <a href="mailto:safety@lynkapp.net" style={S.link}>safety@lynkapp.net</a>.</p>
        </div>

        {/* Section 8 */}
        <div style={S.section}>
          <div style={S.h2}>8. Cookies & Tracking Technologies</div>
          <p style={S.p}>We use cookies and similar technologies to operate and improve the Service:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong>Essential cookies:</strong> Required for login sessions and core functionality. Cannot be disabled.</li>
            <li style={S.li}><strong>Analytics cookies:</strong> Firebase Analytics to understand how users interact with the app. Can be disabled in Settings → Privacy.</li>
            <li style={S.li}><strong>Advertising cookies:</strong> Google AdSense and ad networks to show relevant ads. Requires your consent. Can be disabled.</li>
            <li style={S.li}><strong>Preference cookies:</strong> Remember your settings (theme, language, notification preferences).</li>
          </ul>
          <p style={S.p}>You can manage cookie preferences at any time in Settings → Privacy → Cookie Settings. Note that disabling some cookies may affect app functionality.</p>
        </div>

        {/* Section 9 */}
        <div style={S.section}>
          <div style={S.h2}>9. Data Security</div>
          <p style={S.p}>We implement industry-standard security measures to protect your data:</p>
          <ul style={S.ul}>
            <li style={S.li}>All data transmitted between your device and our servers is encrypted using TLS/HTTPS</li>
            <li style={S.li}>Passwords are hashed using bcrypt (never stored in plain text)</li>
            <li style={S.li}>Firebase Security Rules control who can read/write each piece of data</li>
            <li style={S.li}>Payment data is processed by Stripe (PCI DSS Level 1 compliant)</li>
            <li style={S.li}>Media files are stored on Cloudinary with access controls</li>
            <li style={S.li}>We conduct regular security reviews and use error monitoring (Sentry)</li>
          </ul>
          <p style={S.p}>No security system is 100% impenetrable. In the event of a data breach affecting your rights and freedoms, we will notify affected users and relevant authorities as required by law within 72 hours of discovery.</p>
        </div>

        {/* Section 10 */}
        <div style={S.section}>
          <div style={S.h2}>10. International Data Transfers</div>
          <p style={S.p}>LynkApp is based in the United States. If you are located outside the US, your data will be transferred to and processed in the United States and potentially other countries where our service providers operate (e.g., Google/Firebase data centers). We ensure appropriate safeguards are in place for these transfers (Standard Contractual Clauses, adequacy decisions, etc.).</p>
        </div>

        {/* Section 11 */}
        <div style={S.section}>
          <div style={S.h2}>11. Dating Feature Privacy</div>
          <p style={S.p}>The dating feature has additional privacy considerations:</p>
          <ul style={S.ul}>
            <li style={S.li}>Your dating profile is only visible to other users who have enabled dating mode</li>
            <li style={S.li}>Your exact location is never shown — only approximate distance (e.g., "within 5 miles")</li>
            <li style={S.li}>You can block, report, or unmatch any user at any time</li>
            <li style={S.li}>We use your preferences (age range, distance, gender) to show relevant profiles — this data is not shared with advertisers</li>
            <li style={S.li}>Sexual orientation and gender identity data is treated as sensitive and subject to heightened protection</li>
          </ul>
        </div>

        {/* Section 12 */}
        <div style={S.section}>
          <div style={S.h2}>12. Changes to This Policy</div>
          <p style={S.p}>We may update this Privacy Policy from time to time. We will notify you of material changes by email and/or prominent in-app notification at least 14 days before the change takes effect. Your continued use of LynkApp after the effective date constitutes acceptance of the updated policy.</p>
          <p style={S.p}>We keep previous versions of this policy archived and available upon request.</p>
        </div>

        <div style={S.contactBox}>
          <div style={S.contactTitle}>🔒 Privacy Contact</div>
          <div style={S.contactItem}>For privacy questions, data requests, or to report a privacy concern:</div>
          <div style={S.contactItem}>Email: <a href="mailto:privacy@lynkapp.net" style={S.link}>privacy@lynkapp.net</a></div>
          <div style={S.contactItem}>Safety: <a href="mailto:safety@lynkapp.net" style={S.link}>safety@lynkapp.net</a></div>
          <div style={S.contactItem}>CEO: <a href="mailto:CEO@lynkapp.net" style={S.link}>CEO@lynkapp.net</a></div>
          <div style={S.contactItem}>Response time: Within 30 days</div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: '#475569' }}>
            Also see our <a href="/terms" style={S.link}>Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}
