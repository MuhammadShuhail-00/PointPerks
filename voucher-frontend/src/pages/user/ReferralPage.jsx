import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { referralAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import EmptyState from '../../components/common/EmptyState';

// PointPerks Theme Colors
const C = {
  primary: '#022448',
  primaryContainer: '#1e3a5f',
  secondary: '#795900',
  secondaryContainer: '#ffc641',
  secondaryFixed: '#ffdfa0',
  secondaryFixedDim: '#f6be39',
  tertiary: '#002252',
  tertiaryContainer: '#00377c',
  surface: '#f9f9f8',
  surfaceLow: '#f4f4f3',
  surfaceContainerLow: '#f4f4f3',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHigh: '#e8e8e7',
  surfaceContainerHighest: '#e2e2e2',
  surfaceVariant: '#e2e2e2',
  outline: '#74777f',
  outlineVariant: '#c4c6cf',
  onSurface: '#1a1c1c',
  onSurfaceVariant: '#43474e',
  white: '#ffffff',
  error: '#ba1a1a',
  successBg: '#dcfce7',
  successText: '#166534',
  whatsapp: '#25D366',
  twitter: '#1DA1F2',
};

/* ── Shared styles (no container padding — layout handles that) ── */
const styles = {
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    fontSize: 13,
    fontWeight: 500,
    color: C.onSurfaceVariant,
  },
  breadcrumbLink: {
    background: 'none',
    border: 'none',
    color: C.primary,
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  header: { marginBottom: 24 },
  title: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 28,
    fontWeight: 700,
    color: C.primary,
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    color: C.onSurfaceVariant,
    margin: '8px 0 0',
    lineHeight: 1.6,
  },
};

/* ── Animated counter hook ── */
function useCountUp(target, duration = 1000) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const numTarget = parseInt(String(target).replace(/,/g, ''), 10) || 0;
    if (numTarget === 0) { setDisplay(0); return; }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setDisplay(numTarget); return; }

    startRef.current = null;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * numTarget));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display.toLocaleString();
}

const ppStyles = `
  /* Hero grid */
  .pp-grid-hero { display: grid; grid-template-columns: 1fr; gap: 24px; margin-bottom: 24px; }
  @media (min-width: 1024px) { .pp-grid-hero { grid-template-columns: 8fr 4fr; } }

  .pp-card { background: ${C.surfaceContainerLowest}; border-radius: 12px; border: 1px solid ${C.surfaceVariant}; box-shadow: 0px 4px 20px rgba(30, 58, 95, 0.04); }
  .pp-card-pad { padding: 24px; }

  .pp-label { font-size: 14px; font-weight: 600; color: ${C.onSurfaceVariant}; margin-bottom: 12px; display: block; text-transform: uppercase; letter-spacing: 0.04em; }
  
  .pp-input-wrap { position: relative; flex: 1; }
  .pp-input { 
    width: 100%; 
    background: ${C.surfaceLow}; 
    border: 1.5px solid ${C.outlineVariant}; 
    border-radius: 12px; 
    padding: 14px 60px 14px 16px; 
    font-size: 15px; 
    color: ${C.primary}; 
    outline: none; 
    font-family: 'Inter', sans-serif; 
    box-sizing: border-box;
    transition: border-color 150ms ease, box-shadow 150ms ease;
    font-weight: 500;
  }
  .pp-input:focus { border-color: ${C.primary}; box-shadow: 0 0 0 3px rgba(2, 36, 72, 0.08); }
  
  .pp-copy-btn { 
    position: absolute; 
    right: 6px; 
    top: 50%; 
    transform: translateY(-50%); 
    padding: 8px 12px; 
    background: ${C.primary}; 
    color: ${C.white}; 
    border: none; 
    cursor: pointer; 
    border-radius: 8px; 
    transition: all 0.2s; 
    display: flex; 
    align-items: center; 
    gap: 4px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(2, 36, 72, 0.15);
  }
  .pp-copy-btn:hover { background: ${C.primaryContainer}; }
  .pp-copy-btn.copied { background: ${C.successText}; }

  .pp-share-label { font-size: 12px; font-weight: 600; color: ${C.outline}; text-transform: uppercase; letter-spacing: 0.05em; }
  
  .pp-share-grid { display: flex; gap: 12px; flex-wrap: wrap; }
  .pp-share-btn { 
    height: 44px; 
    padding: 0 20px;
    display: flex; 
    align-items: center; 
    justify-content: center; 
    gap: 8px;
    border-radius: 9999px; 
    color: ${C.white}; 
    cursor: pointer; 
    transition: transform 0.2s, box-shadow 0.2s; 
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }
  .pp-share-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
  .pp-share-btn:active { transform: translateY(0); }
  .pp-share-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

  .pp-illust-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 375px;
    margin: 0 auto;
  }
  @media (max-width: 1023px) {
    .pp-illust-wrap {
      height: auto;
      aspect-ratio: 1;
      max-width: 350px;
    }
  }

  .pp-illust-bg-1 { position: absolute; inset: 0; background: linear-gradient(to top right, ${C.primaryContainer}, ${C.tertiaryContainer}); border-radius: 24px; transform: rotate(3deg) scale(0.95); opacity: 0.2; }
  .pp-illust-bg-2 { position: absolute; inset: 0; background: linear-gradient(to bottom left, ${C.secondaryContainer}, ${C.secondaryFixedDim}); border-radius: 24px; transform: rotate(-3deg) scale(0.95); opacity: 0.2; }
  .pp-illust-card { position: relative; width: 100%; height: 100%; background: ${C.white}; border-radius: 24px; box-shadow: 0 10px 15px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; border: 1px solid ${C.surfaceVariant}; box-sizing: border-box; }

  .pp-voucher-mock {
    position: relative;
    width: 100%;
    height: 192px;
    background: linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: ${C.white};
    text-align: center;
    margin-bottom: 24px;
    box-sizing: border-box;
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    cursor: default;
    box-shadow: 0px 8px 24px rgba(2, 36, 72, 0.15);
  }
  .pp-voucher-divider { position: absolute; bottom: 40px; left: 16px; right: 16px; border-top: 1px dashed rgba(255,255,255,0.3); }

  .pp-stats-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 32px; }
  @media (min-width: 768px) { .pp-stats-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; } }
  .pp-stat-card { background: ${C.surfaceContainerLowest}; padding: 24px; border-radius: 12px; border: 1px solid ${C.surfaceVariant}; display: flex; flex-direction: column; box-shadow: 0px 4px 20px rgba(30, 58, 95, 0.04); }
  .pp-stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  .pp-stat-label { font-size: 13px; font-weight: 600; color: ${C.onSurfaceVariant}; text-transform: uppercase; letter-spacing: 0.05em; }
  .pp-stat-value { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 700; color: ${C.primary}; margin: 4px 0; line-height: 1.2; }
  .pp-stat-sub { font-size: 12px; font-weight: 500; color: ${C.outline}; margin-top: 4px; }

  .pp-table-wrap { background: ${C.surfaceContainerLowest}; border-radius: 12px; border: 1px solid ${C.surfaceVariant}; overflow: hidden; box-shadow: 0px 4px 20px rgba(30, 58, 95, 0.04); }
  .pp-table-head { padding: 20px 24px; border-bottom: 1px solid ${C.surfaceVariant}; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  .pp-table-title { font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 600; color: ${C.primary}; margin: 0; }
  
  /* Filter Dropdown Fix */
  .pp-filter-wrap { position: relative; display: inline-flex; align-items: center; }
  .pp-filter-select {
    appearance: none;
    -webkit-appearance: none;
    padding: 8px 36px 8px 36px;
    border-radius: 8px;
    border: 1.5px solid ${C.outlineVariant};
    background: ${C.surfaceContainerLowest};
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: ${C.primary};
    font-weight: 600;
    cursor: pointer;
    outline: none;
    transition: border-color 150ms ease, box-shadow 150ms ease;
  }
  .pp-filter-select:focus { border-color: ${C.primary}; box-shadow: 0 0 0 3px rgba(2, 36, 72, 0.08); }
  .pp-filter-icon { position: absolute; left: 10px; pointer-events: none; color: ${C.outline}; font-size: 18px; display: flex; }
  .pp-filter-chevron { position: absolute; right: 10px; pointer-events: none; color: ${C.onSurfaceVariant}; font-size: 18px; display: flex; }

  .pp-table-scroll { overflow-x: auto; }
  .pp-table { width: 100%; text-align: left; border-collapse: collapse; min-width: 600px; }
  .pp-th { padding: 14px 24px; font-size: 12px; font-weight: 600; color: ${C.outline}; text-transform: uppercase; letter-spacing: 0.04em; background: ${C.surfaceLow}; border-bottom: 1px solid ${C.surfaceVariant}; }
  .pp-td { padding: 16px 24px; font-size: 14px; color: ${C.onSurfaceVariant}; border-bottom: 1px solid ${C.surfaceVariant}; vertical-align: middle; }
  .pp-tr:last-child .pp-td { border-bottom: none; }
  .pp-tr { transition: background 0.15s; }
  .pp-tr:hover { background: ${C.surfaceLow}; }

  .pp-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
  .pp-dot { width: 6px; height: 6px; border-radius: 50%; }

  .pp-avatar { width: 36px; height: 36px; border-radius: 9999px; background: ${C.surfaceContainerHighest}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: ${C.primary}; overflow: hidden; flex-shrink: 0; border: 1.5px solid ${C.outlineVariant}; }

  .pp-material { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .pp-sk { background: ${C.surfaceContainerHighest}; position: relative; overflow: hidden; border-radius: 16px; }
  .pp-sk::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: pp-shimmer 1.5s infinite; }
  @keyframes pp-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .pp-share-grid { width: 100%; }
    .pp-share-btn { flex: 1; justify-content: center; }
    .pp-table-head { flex-direction: column; align-items: flex-start; gap: 12px; }
  }
`;

const ReferralPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const ms = (size = 24, fill = 0) => ({
    fontFamily: "'Material Symbols Outlined'",
    fontSize: size,
    fontVariationSettings: `"FILL" ${fill}, "wght" 400, "GRAD" 0, "opsz" 24`,
    lineHeight: 1,
    display: 'inline-block',
    verticalAlign: 'middle',
  });

  useEffect(() => {
    referralAPI.getMy()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const referralLink = data ? `${window.location.origin}/register?ref=${data.referralCode}` : '';
  
  // Share payloads with actual text
  const waText = `Join me on PointPerks and earn 100 bonus points! 🎁\n\nHere's my invite link: ${referralLink}`;
  const emailSubject = "Join me on PointPerks!";
  const emailBody = `Hey!\n\nSign up on PointPerks using my referral link and we'll both get bonus points.\n\nLink: ${referralLink}\n\nCheers!`;
  const tweetText = `Join me on PointPerks and earn free rewards! 🎁 ${referralLink}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Animated counters
  const animInvites = useCountUp(data?.referralCount || 0, 800);
  const animPoints = useCountUp(data?.totalEarned || 0, 1200);
  const animReward = useCountUp(data?.rewardPerReferral || 0, 600);

  if (loading) {
    return (
      <div>
        <style>{ppStyles}</style>
        <div className="pp-grid-hero">
          <div>
            <div className="pp-sk" style={{ height: '48px', width: '300px', marginBottom: '16px' }} />
            <div className="pp-sk" style={{ height: '24px', width: '100%', marginBottom: '8px' }} />
            <div className="pp-sk" style={{ height: '24px', width: '80%', marginBottom: '32px' }} />
            <div className="pp-sk" style={{ height: '120px', width: '100%' }} />
          </div>
          <div className="pp-sk" style={{ height: '400px', width: '100%', maxWidth: '400px', margin: '0 auto' }} />
        </div>
        <div className="pp-stats-grid">
          <div className="pp-sk" style={{ height: '140px' }} />
          <div className="pp-sk" style={{ height: '140px' }} />
          <div className="pp-sk" style={{ height: '140px' }} />
        </div>
        <div className="pp-sk" style={{ height: '400px', width: '100%' }} />
      </div>
    );
  }

  return (
    <div>
      <style>{ppStyles}</style>

      {/* BREADCRUMB */}
      <nav style={styles.breadcrumb}>
        <button onClick={() => navigate('/dashboard')} style={styles.breadcrumbLink}>
          <span style={ms(16, 0)}>home</span>
          Home
        </button>
        <span style={{ color: C.outlineVariant }}>/</span>
        <span style={{ color: C.onSurface, fontWeight: 600 }}>Referral Program</span>
      </nav>

      {/* Hero Section */}
      <section className="pp-grid-hero">
        {/* Left Column: Header + Link Card */}
        <div>
          <div style={styles.header}>
            <h1 style={styles.title}>Refer a friend and get {data?.rewardPerReferral || 500} pts</h1>
            <p style={styles.subtitle}>Spread the wealth! Invite your friends to join PointPerks. When they sign up and complete their first redemption, you both get {data?.rewardPerReferral || 500} premium points added to your wallets.</p>
          </div>

          {/* Referral Link Card */}
          <div className="pp-card pp-card-pad">
            <label className="pp-label">Your Unique Referral Link</label>

            <div className="pp-input-wrap">
              <input
                className="pp-input"
                readOnly
                type="text"
                value={referralLink}
              />
              <button 
                className={`pp-copy-btn ${copied ? 'copied' : ''}`} 
                onClick={copyLink} 
                title="Copy Link"
              >
                <span className="pp-material" style={{ fontSize: '18px', fontVariationSettings: copied ? "'FILL' 1" : "'FILL' 0" }}>
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span className="pp-share-label">Share via</span>
              <div className="pp-share-grid">
                <button className="pp-share-btn" style={{ background: C.whatsapp }} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank')}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  
                </button>
                <button className="pp-share-btn" style={{ background: C.primary }} onClick={() => window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_blank')}>
                  <span className="pp-material" style={{ fontSize: '18px', color: C.white }}>mail</span>
                  
                </button>
                <button className="pp-share-btn" style={{ background: C.twitter }} onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank')}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                  
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Illustration */}
        <div className="pp-illust-wrap">
          <div className="pp-illust-bg-1"></div>
          <div className="pp-illust-bg-2"></div>
          <div className="pp-illust-card">
            <div className="pp-voucher-mock">
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)' }} />
              <span className="pp-material" style={{ fontSize: '48px', color: C.secondaryFixedDim, fontVariationSettings: "'FILL' 1", marginBottom: '8px', position: 'relative', zIndex: 2 }}>card_giftcard</span>
              <h4 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: 600, margin: 0, position: 'relative', zIndex: 2 }}>{data?.rewardPerReferral || 500} PTS</h4>
              <p style={{ fontSize: '14px', color: '#8aa4cf', margin: '4px 0 0', position: 'relative', zIndex: 2 }}>Referral Reward Voucher</p>
              <div className="pp-voucher-divider"></div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: 600, color: C.primary, margin: '0 0 8px' }}>Invite. Redeem. Earn.</p>
              <p style={{ fontSize: '16px', color: C.onSurfaceVariant, margin: 0 }}>PointPerks Institutional Rewards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pp-stats-grid">
        <div className="pp-stat-card">
          <div className="pp-stat-icon" style={{ background: 'rgba(2, 36, 72, 0.1)', color: C.primary }}>
            <span className="pp-material">person_add</span>
          </div>
          <span className="pp-stat-label">Total Invites</span>
          <span className="pp-stat-value">{animInvites}</span>
          <span className="pp-stat-sub">Keep sharing!</span>
        </div>
        <div className="pp-stat-card">
          <div className="pp-stat-icon" style={{ background: 'rgba(121, 89, 0, 0.1)', color: C.secondary }}>
            <span className="pp-material" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          </div>
          <span className="pp-stat-label">Points Earned</span>
          <span className="pp-stat-value">{animPoints}</span>
          <span className="pp-stat-sub">From referrals</span>
        </div>
        <div className="pp-stat-card">
          <div className="pp-stat-icon" style={{ background: 'rgba(173, 200, 245, 0.3)', color: C.primary }}>
            <span className="pp-material">redeem</span>
          </div>
          <span className="pp-stat-label">Reward Per Referral</span>
          <span className="pp-stat-value">{animReward}</span>
          <span className="pp-stat-sub">Points per valid signup</span>
        </div>
      </section>

      {/* History Table */}
      <section className="pp-table-wrap">
        <div className="pp-table-head">
          <h3 className="pp-table-title">Referral History</h3>
        </div>

        {(!data?.referrals || data.referrals.length === 0) ? (
          <div style={{ padding: '48px 24px' }}>
            <EmptyState icon="people" title="No referrals yet" body="Share your code or link above to start earning points." />
          </div>
        ) : (
          <div className="pp-table-scroll">
            <table className="pp-table">
              <thead>
                <tr>
                  <th className="pp-th">Friend</th>
                  <th className="pp-th">Date Invited</th>
                  <th className="pp-th">Status</th>
                  <th className="pp-th" style={{ textAlign: 'right' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {data.referrals.map((r, i) => {
                  const isEarned = r.rewardPoints > 0;
                  const initials = r.referred?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';

                  return (
                    <tr key={r._id || i} className="pp-tr">
                      <td className="pp-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="pp-avatar">
                            {r.referred?.avatar ? (
                              <img src={r.referred.avatar} alt={r.referred?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: C.onSurface }}>{r.referred?.name || 'Unknown User'}</p>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.outline }}>{r.referred?.email || 'No email provided'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="pp-td">{formatDate(r.createdAt)}</td>
                      <td className="pp-td">
                        {isEarned ? (
                          <span className="pp-badge" style={{ background: C.successBg, color: C.successText }}>
                            <span className="pp-dot" style={{ background: C.successText }}></span>
                            Earned
                          </span>
                        ) : (
                          <span className="pp-badge" style={{ background: C.secondaryFixed, color: C.secondary }}>
                            <span className="pp-dot" style={{ background: C.secondary }}></span>
                            Joined
                          </span>
                        )}
                      </td>
                      <td className="pp-td" style={{ textAlign: 'right', fontWeight: 700, color: isEarned ? C.primary : C.outline, fontFamily: "'Poppins', sans-serif" }}>
                        {isEarned ? `+${r.rewardPoints.toLocaleString()} pts` : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ReferralPage;