import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { redemptionAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';

/* ── Design tokens ─────────────────────────────────────────────── */
const C = {
  primary: '#022448',
  primaryContainer: '#1e3a5f',
  brandGold: '#D4A017',
  secondary: '#795900',
  secondaryContainer: '#ffc641',
  secondaryFixed: '#ffdfa0',
  surface: '#f9f9f8',
  surfaceLow: '#f4f4f3',
  surfaceContainer: '#eeeeed',
  surfaceHigh: '#e8e8e7',
  surfaceHighest: '#e2e2e2',
  surfaceLowest: '#ffffff',
  onSurface: '#1a1c1c',
  onSurfaceVariant: '#43474e',
  outline: '#74777f',
  outlineVariant: '#c4c6cf',
  onPrimary: '#ffffff',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  success: '#386a20',
  successBg: '#c4f0c4',
  warning: '#795900',
  warningBg: '#ffdfa0',
};

/* ── Shared styles ── */
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
  header: { marginBottom: 32 },
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
    lineHeight: 1.5,
  },
  uniformCard: {
    background: C.surfaceLowest,
    border: `1px solid ${C.outlineVariant}`,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
  },
};

const TABS = [
  { label: 'All', status: undefined },
  { label: 'Active', status: 'active' },
  { label: 'Cancelled', status: 'cancelled' },
];

/* ── Material Symbols helper ── */
const ms = (size = 20, fill = 0) => ({
  fontFamily: "'Material Symbols Outlined'",
  fontSize: size,
  fontVariationSettings: `"FILL" ${fill}, "wght" 400, "GRAD" 0, "opsz" 24`,
  lineHeight: 1,
  display: 'inline-block',
  verticalAlign: 'middle',
});

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

/* ════════════════════════════════════════════════════════ */
const MyRedemptions = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    redemptionAPI.getMy({ status: TABS[tab].status, limit: 50 })
      .then((res) => setRedemptions(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async (id) => {
    try {
      await redemptionAPI.cancel(id);
      toast.success('Redemption cancelled, points refunded');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const handleViewPDF = (id) => {
    navigate(`/my-redemptions/${id}/pdf`);
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return { bg: C.successBg, color: C.success, label: 'Active', icon: 'check_circle' };
      case 'cancelled':
      case 'expired':
        return { bg: C.errorContainer, color: C.error, label: status.charAt(0).toUpperCase() + status.slice(1), icon: 'event_busy' };
      default:
        return { bg: C.surfaceHighest, color: C.onSurfaceVariant, label: status, icon: 'info' };
    }
  };

  const totalCount = redemptions.length || 0;
  const pointsSpent = redemptions
    .filter((r) => r.status === 'active')
    .reduce((acc, r) => acc + (r.pointsUsed || 0), 0);
  const activeCount = redemptions.filter(r => r.status === 'active').length;

  const animTotal = useCountUp(totalCount, 800);
  const animPoints = useCountUp(pointsSpent, 1200);
  const animActive = useCountUp(activeCount, 600);

  return (
    <div>

      {/* Breadcrumb */}
      <nav style={styles.breadcrumb}>
        <button onClick={() => navigate('/dashboard')} style={styles.breadcrumbLink}>
          <span style={ms(16, 0)}>home</span>
          Home
        </button>
        <span style={{ color: C.outlineVariant }}>/</span>
        <span style={{ color: C.onSurface, fontWeight: 600 }}>My Redemptions</span>
      </nav>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Redemptions</h1>
        <p style={styles.subtitle}>Manage and view all your claimed rewards in one place.</p>
      </div>

      {/* Stats Bar — 3 columns */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }} className="pp-stats-grid">
        <div className="pp-stat-card" style={styles.uniformCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.primary}08`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...ms(20, 1), color: C.primary }}>receipt_long</span>
            </div>
            <p className="pp-stat-label">Total Redeemed</p>
          </div>
          <p className="pp-stat-value">{animTotal} <span style={{ fontSize: 14, fontWeight: 500, color: C.onSurfaceVariant }}>vouchers</span></p>
        </div>
        <div className="pp-stat-card" style={styles.uniformCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.brandGold}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...ms(20, 1), color: C.brandGold }}>payments</span>
            </div>
            <p className="pp-stat-label">Points Spent</p>
          </div>
          <p className="pp-stat-value">{animPoints} <span style={{ fontSize: 14, fontWeight: 500, color: C.onSurfaceVariant }}>pts</span></p>
        </div>
        <div className="pp-stat-card" style={styles.uniformCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.success}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...ms(20, 1), color: C.success }}>local_activity</span>
            </div>
            <p className="pp-stat-label">Active Now</p>
          </div>
          <p className="pp-stat-value" style={{ color: C.success }}>{animActive} <span style={{ fontSize: 14, fontWeight: 500, color: C.onSurfaceVariant }}>vouchers</span></p>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${C.outlineVariant}`, marginBottom: 24 }}>
        {TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: tab === i ? `2px solid ${C.primary}` : '2px solid transparent',
              color: tab === i ? C.primary : C.onSurfaceVariant,
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 260, background: C.surfaceContainer, borderRadius: 12, ...styles.uniformCard }} className="pp-skeleton-pulse" />
          ))}
        </div>
      ) : redemptions.length === 0 ? (
        <div
          onClick={() => navigate('/vouchers')}
          className="pp-empty-state"
          style={{
            ...styles.uniformCard,
            background: `${C.surfaceLow}80`,
            border: `2px dashed ${C.outlineVariant}`,
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.surfaceHighest, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span style={ms(32, 0)}>add_shopping_cart</span>
          </div>
          <h3 style={{ fontFamily: "'Poppins', sans-serif", color: C.primary, fontSize: 18, margin: '0 0 4px' }}>Redeem New Voucher</h3>
          <p style={{ color: C.onSurfaceVariant, fontSize: 14, margin: 0 }}>Browse the marketplace for more rewards.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }} className="pp-red-grid">
          {redemptions.map((r) => {
            const statusInfo = getStatusStyle(r.status);
            const isUsed = r.status === 'used';
            const isCancelled = r.status === 'cancelled' || r.status === 'expired';

            return (
              <div
                key={r._id}
                className="pp-ticket-card"
                style={{
                  ...styles.uniformCard,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  opacity: isUsed || isCancelled ? 0.7 : 1,
                  filter: isUsed ? 'grayscale(0.6)' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                {/* Top colored strip */}
                <div style={{
                  height: 4,
                  background: r.status === 'active'
                    ? `linear-gradient(90deg, ${C.success}, ${C.successBg})`
                    : `linear-gradient(90deg, ${C.outlineVariant}, ${C.surfaceHighest})`,
                }} />

                {/* Header row */}
                <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 12,
                      background: isCancelled ? C.surfaceHighest : `${C.primary}06`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      border: isCancelled ? `1px dashed ${C.outlineVariant}` : 'none',
                    }}>
                      {r.qrCodeData ? (
                        <img src={r.qrCodeData} alt="QR" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                      ) : (
                        <span style={{ ...ms(24, 1), color: isCancelled ? C.outline : C.primary }}>confirmation_number</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{
                        fontFamily: "'Poppins', sans-serif", color: isCancelled ? C.outline : C.primary,
                        fontSize: 17, fontWeight: 600, margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {r.voucher?.title || 'Unknown Voucher'}
                      </h3>
                      <p style={{ fontSize: 12, color: C.onSurfaceVariant, margin: '4px 0 0' }}>
                        {r.voucher?.merchant || 'Unknown Merchant'} · {formatDate(r.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    background: statusInfo.bg, color: statusInfo.color,
                    padding: '4px 10px', borderRadius: 999, fontSize: 11,
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                  }}>
                    <span style={ms(12, 1)}>{statusInfo.icon}</span>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Code section */}
                <div style={{ padding: '20px 24px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: C.surfaceLow, borderRadius: 10, padding: '14px 16px',
                    border: `1px dashed ${isCancelled ? C.outlineVariant : C.primary}30`,
                    position: 'relative',
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      color: isCancelled ? C.outline : C.primary, fontWeight: 700,
                      letterSpacing: '0.12em', fontSize: 15,
                      textDecoration: isCancelled ? 'line-through' : 'none',
                    }}>
                      {r.redemptionCode}
                    </span>
                    <button
                      onClick={() => handleCopyCode(r.redemptionCode, r._id)}
                      className="pp-copy-btn"
                      style={{
                        background: copiedId === r._id ? `${C.success}12` : C.surfaceLowest,
                        border: `1px solid ${copiedId === r._id ? C.success : C.outlineVariant}`,
                        borderRadius: 8, cursor: 'pointer', padding: '6px 12px',
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: copiedId === r._id ? C.success : C.onSurfaceVariant,
                        fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={ms(16)}>{copiedId === r._id ? 'check' : 'content_copy'}</span>
                      {copiedId === r._id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Bottom actions */}
                <div style={{
                  background: C.surfaceLow,
                  padding: '14px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: `1px solid ${C.outlineVariant}50`,
                }}>
                  <span style={{ fontSize: 14, color: C.onSurfaceVariant }}>
                    <span style={{ fontWeight: 700, color: C.primary, fontFamily: "'Poppins', sans-serif", fontSize: 16 }}>
                      {r.pointsUsed?.toLocaleString() || 0}
                    </span>{' '}
                    points redeemed
                  </span>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleViewPDF(r._id)}
                      className="pp-action-btn pp-action-btn--pdf"
                    >
                      <span style={ms(16)}>picture_as_pdf</span>
                      PDF
                    </button>
                    {r.status === 'active' && (
                      <button
                        onClick={() => handleCancel(r._id)}
                        className="pp-action-btn pp-action-btn--cancel"
                      >
                        <span style={ms(16)}>close</span>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Decorative Side Cutouts */}
                <div style={{
                  position: 'absolute', top: '50%', left: '-8px', transform: 'translateY(-50%)',
                  width: 16, height: 16, background: C.surface, borderRadius: '50%',
                  borderRight: `1px solid ${C.outlineVariant}`,
                }} />
                <div style={{
                  position: 'absolute', top: '50%', right: '-8px', transform: 'translateY(-50%)',
                  width: 16, height: 16, background: C.surface, borderRadius: '50%',
                  borderLeft: `1px solid ${C.outlineVariant}`,
                }} />
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .pp-stat-card { padding: 24px; }
        .pp-stat-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: ${C.onSurfaceVariant};
          margin: 0;
          font-weight: 600;
        }
        .pp-stat-value {
          font-family: 'Poppins', sans-serif;
          font-size: 26px;
          font-weight: 600;
          color: ${C.primary};
          margin: 0;
          line-height: 1.2;
        }

        .pp-skeleton-pulse {
          animation: pp-pulse 1.5s infinite ease-in-out;
        }
        @keyframes pp-pulse {
          0% { opacity: 0.5; }
          50% { opacity: 0.75; }
          100% { opacity: 0.5; }
        }

        .pp-empty-state:hover {
          background: ${C.surfaceContainer} !important;
        }

        .pp-ticket-card:hover {
          transform: translateY(-4px);
          box-shadow: 0px 12px 32px rgba(30, 58, 95, 0.1) !important;
        }

        .pp-copy-btn:hover {
          border-color: ${C.primary} !important;
          color: ${C.primary} !important;
          background: ${C.surfaceLowest} !important;
        }

        /* Restyled Action Buttons - Soft Pill Shapes */
        .pp-action-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          border: none;
          border-radius: 999px;
          padding: 8px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pp-action-btn--pdf {
          background: ${C.primary}10;
          color: ${C.primary};
        }
        .pp-action-btn--pdf:hover {
          background: ${C.primary}20;
        }
        .pp-action-btn--cancel {
          background: ${C.errorContainer};
          color: ${C.error};
        }
        .pp-action-btn--cancel:hover {
          background: #ffb3b3;
        }

        @media (max-width: 1024px) {
          .pp-stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .pp-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .pp-stat-card { padding: 18px !important; }
          .pp-stat-value { font-size: 22px !important; }
          .pp-red-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyRedemptions;