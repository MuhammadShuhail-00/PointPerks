import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import useAuth from '../../hooks/useAuth';
import { voucherAPI, redemptionAPI } from '../../services/api';
import VoucherCard from '../../components/voucher/VoucherCard';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [recentRedemptions, setRecentRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      voucherAPI.getAll({ featured: 'true', limit: 4 }),
      redemptionAPI.getMy({ limit: 3 }),
    ]).then(([vRes, rRes]) => {
      setFeatured(vRes.data.data || []);
      setRecentRedemptions(rRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="vx-page" style={{ maxWidth: 1180 }}>

      {/* Greeting */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Hey {firstName} 👋</h1>
        <p style={{ color: 'var(--ink-500)', marginTop: '0.3rem' }}>Here's what's happening with your account.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}
        className="vx-stat-grid">
        <StatCard icon="pi-star-fill" label="Points balance" value={user?.points?.toLocaleString() || 0} accent="var(--accent-amber)" />
        <StatCard icon="pi-check-circle" label="Vouchers redeemed" value={recentRedemptions.length > 0 ? recentRedemptions.length : 0} accent="var(--accent-emerald)" />
        <StatCard icon="pi-share-alt" label="Referral code" value={user?.referralCode || '—'} accent="var(--brand-600)" />
        <div className="vx-card" style={{
          padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500))', border: 'none',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Need points?</span>
          <Button label="Invite a friend" icon="pi pi-arrow-right" iconPos="right" text
            onClick={() => navigate('/referral')}
            style={{ color: '#fff', fontWeight: 600, padding: 0, justifyContent: 'flex-start' }} />
        </div>
      </div>

      {/* Featured vouchers */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Featured vouchers</h2>
        <Button label="View all" text onClick={() => navigate('/vouchers')} style={{ color: 'var(--brand-600)' }} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="280px" borderRadius="16px" />)}
        </div>
      ) : featured.length === 0 ? (
        <EmptyState icon="pi-ticket" title="No featured vouchers right now"
          body="Check back soon or browse the full catalog." actionLabel="Browse all vouchers"
          onAction={() => navigate('/vouchers')} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}
          className="vx-feat-grid">
          {featured.map((v) => <VoucherCard key={v._id} voucher={v} />)}
        </div>
      )}

      {/* Recent activity */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent redemptions</h2>
        <Button label="View all" text onClick={() => navigate('/my-redemptions')} style={{ color: 'var(--brand-600)' }} />
      </div>

      {recentRedemptions.length === 0 ? (
        <EmptyState icon="pi-inbox" title="No redemptions yet"
          body="Browse vouchers and redeem your first one to see it here." actionLabel="Browse vouchers"
          onAction={() => navigate('/vouchers')} />
      ) : (
        <div className="vx-card" style={{ overflow: 'hidden' }}>
          {recentRedemptions.map((r, i) => (
            <div key={r._id} onClick={() => navigate(`/my-redemptions`)} style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer',
              borderBottom: i < recentRedemptions.length - 1 ? '1px solid var(--surface-border)' : 'none',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: 'var(--surface-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className="pi pi-ticket" style={{ color: 'var(--brand-600)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.voucher?.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)' }}>{r.redemptionCode}</div>
              </div>
              <i className="pi pi-chevron-right" style={{ color: 'var(--ink-300)' }} />
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .vx-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .vx-feat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .vx-stat-grid { grid-template-columns: 1fr !important; }
          .vx-feat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
