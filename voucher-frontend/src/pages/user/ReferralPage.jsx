import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Avatar } from 'primereact/avatar';
import toast from 'react-hot-toast';
import { referralAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import EmptyState from '../../components/common/EmptyState';

const ReferralPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    referralAPI.getMy().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  const referralLink = data ? `${window.location.origin}/register?ref=${data.referralCode}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(data.referralCode);
    toast.success('Referral code copied!');
  };

  if (loading) {
    return (
      <div className="vx-page" style={{ maxWidth: 760 }}>
        <Skeleton height="180px" borderRadius="20px" className="mb-4" />
        <Skeleton height="120px" borderRadius="16px" />
      </div>
    );
  }

  return (
    <div className="vx-page" style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>Refer & earn</h1>
      <p style={{ color: 'var(--ink-500)', marginBottom: '1.75rem' }}>
        Get {data?.rewardPerReferral} points for every friend who joins with your code.
      </p>

      {/* Referral code card */}
      <div className="vx-card" style={{
        padding: '2rem', marginBottom: '1.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, var(--ink-900), var(--brand-700))', border: 'none',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Your referral code</div>
        <div style={{
          fontSize: '2.2rem', fontWeight: 800, color: '#fff', letterSpacing: '0.08em',
          fontFamily: 'monospace', marginBottom: '1.5rem',
        }}>{data?.referralCode}</div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button label="Copy code" icon="pi pi-copy" onClick={copyCode}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10 }} />
          <Button label="Copy invite link" icon="pi pi-link" onClick={copyLink}
            style={{ background: '#fff', color: 'var(--ink-900)', border: 'none', borderRadius: 10, fontWeight: 600 }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="vx-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{data?.referralCount || 0}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>Friends referred</div>
        </div>
        <div className="vx-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>+{data?.totalEarned || 0}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>Points earned</div>
        </div>
      </div>

      {/* Referral list */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Your referrals</h2>
      {(!data?.referrals || data.referrals.length === 0) ? (
        <EmptyState icon="pi-users" title="No referrals yet"
          body="Share your code or link above to start earning points." />
      ) : (
        <div className="vx-card" style={{ overflow: 'hidden' }}>
          {data.referrals.map((r, i) => (
            <div key={r._id} style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem',
              borderBottom: i < data.referrals.length - 1 ? '1px solid var(--surface-border)' : 'none',
            }}>
              <Avatar label={r.referred?.name?.[0]?.toUpperCase()} image={r.referred?.avatar} shape="circle"
                style={{ backgroundColor: 'var(--brand-100)', color: 'var(--brand-700)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.referred?.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>Joined {formatDate(r.createdAt)}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                +{r.rewardPoints}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferralPage;
