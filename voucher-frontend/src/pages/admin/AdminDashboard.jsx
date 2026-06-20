import React, { useEffect, useState } from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import { analyticsAPI } from '../../services/api';
import { formatDate, categoryColors } from '../../utils/helpers';
import StatCard from '../../components/common/StatCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [topVouchers, setTopVouchers] = useState([]);
  const [lowData, setLowData] = useState({ leastRedeemed: [], expiringSoon: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard(),
      analyticsAPI.getTopVouchers(5),
      analyticsAPI.getLowVouchers(5),
    ]).then(([dRes, tRes, lRes]) => {
      setStats(dRes.data.stats);
      setTopVouchers(tRes.data.vouchers || []);
      setLowData(lRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="120px" borderRadius="16px" />)}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>System overview and key metrics.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}
        className="vx-stat-grid">
        <StatCard icon="pi-users" label="Total users" value={stats?.users.total}
          sub={`+${stats?.users.newThisMonth} this month`} />
        <StatCard icon="pi-ticket" label="Active vouchers" value={stats?.vouchers.active} accent="var(--accent-emerald)"
          sub={`${stats?.vouchers.total} total`} />
        <StatCard icon="pi-check-circle" label="Redemptions" value={stats?.redemptions.total} accent="var(--accent-amber)"
          sub={`${stats?.redemptions.thisWeek} this week`} />
        <StatCard icon="pi-star-fill" label="Points in circulation" value={stats?.points.totalInCirculation?.toLocaleString()} accent="var(--accent-rose)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="vx-split-grid">

        {/* Top vouchers */}
        <div className="vx-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top redeemed vouchers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {topVouchers.map((v, i) => (
              <div key={v._id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: 'var(--surface-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-500)', flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.title}
                  </div>
                  <Tag value={v.category} severity={categoryColors[v.category]} style={{ fontSize: '0.62rem', marginTop: '0.2rem' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--brand-600)' }}>{v.redeemedCount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring soon */}
        <div className="vx-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>Expiring within 7 days</h2>
          {lowData.expiringSoon.length === 0 ? (
            <p style={{ color: 'var(--ink-500)', fontSize: '0.85rem' }}>Nothing expiring soon.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {lowData.expiringSoon.map((v) => (
                <div key={v._id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, background: 'rgba(240,70,111,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <i className="pi pi-clock" style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>Expires {formatDate(v.expiryDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .vx-stat-grid { grid-template-columns: repeat(2, 1fr) !important; } .vx-split-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
