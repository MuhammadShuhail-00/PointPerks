import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Skeleton } from 'primereact/skeleton';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { voucherAPI, redemptionAPI } from '../../services/api';
import { updatePoints } from '../../store/slices/authSlice';
import useAuth from '../../hooks/useAuth';
import {
  formatDiscount, formatDate, categoryColors, categoryIcons, daysRemaining,
} from '../../utils/helpers';

const VoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [voucher, setVoucher] = useState(null);
  const [userRedemption, setUserRedemption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [newRedemption, setNewRedemption] = useState(null);

  const fetchVoucher = () => {
    setLoading(true);
    voucherAPI.getOne(id)
      .then((res) => {
        setVoucher(res.data.voucher);
        setUserRedemption(res.data.userRedemption);
      })
      .catch(() => toast.error('Voucher not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVoucher(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      const res = await redemptionAPI.redeem(id);
      const redemption = res.data.redemption;
      setNewRedemption(redemption);
      dispatch(updatePoints(user.points - (voucher.pointsCost || 0)));
      setConfirmOpen(false);
      setSuccessOpen(true);
      toast.success('Voucher redeemed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed');
      setConfirmOpen(false);
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="vx-page" style={{ maxWidth: 900 }}>
        <Skeleton height="320px" borderRadius="24px" className="mb-4" />
        <Skeleton height="2rem" width="60%" className="mb-2" />
        <Skeleton height="1rem" width="40%" />
      </div>
    );
  }

  if (!voucher) return null;

  const days = daysRemaining(voucher.expiryDate);
  const canAfford = user?.points >= voucher.pointsCost;
  const alreadyRedeemed = !!userRedemption;

  return (
    <div className="vx-page" style={{ maxWidth: 900 }}>
      <Button label="Back to vouchers" icon="pi pi-arrow-left" text
        onClick={() => navigate('/vouchers')} style={{ color: 'var(--ink-500)', marginBottom: '1rem', paddingLeft: 0 }} />

      <div className="vx-card" style={{ overflow: 'hidden' }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-500) 60%, var(--accent-amber) 140%)',
          padding: '3rem 2rem', textAlign: 'center', color: '#fff',
        }}>
          <i className={categoryIcons[voucher.category]} style={{ fontSize: '2rem', opacity: 0.85 }} />
          <div style={{ fontSize: '3rem', fontWeight: 800, marginTop: '0.75rem' }}>
            {formatDiscount(voucher.discountType, voucher.discountValue)}
          </div>
          <div style={{ opacity: 0.9, marginTop: '0.25rem' }}>{voucher.merchant}</div>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Tag value={voucher.category} severity={categoryColors[voucher.category]} />
            {voucher.isFeatured && <Tag value="Featured" severity="warning" icon="pi pi-star" />}
            {days <= 7 && <Tag value={`Expires in ${days} day${days !== 1 ? 's' : ''}`} severity="danger" />}
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>{voucher.title}</h1>
          <p style={{ color: 'var(--ink-500)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{voucher.description}</p>

          {/* Info grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
            padding: '1.25rem', background: 'var(--surface-50)', borderRadius: 14, marginBottom: '1.5rem',
          }} className="vx-info-grid">
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginBottom: '0.25rem' }}>Cost</div>
              <div style={{ fontWeight: 700 }}>{voucher.pointsCost > 0 ? `${voucher.pointsCost} pts` : 'Free'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginBottom: '0.25rem' }}>Expires</div>
              <div style={{ fontWeight: 700 }}>{formatDate(voucher.expiryDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginBottom: '0.25rem' }}>Remaining</div>
              <div style={{ fontWeight: 700 }}>{voucher.remainingCount ?? 'Unlimited'}</div>
            </div>
          </div>

          {/* Terms */}
          {voucher.terms && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Terms & Conditions</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', lineHeight: 1.6 }}>{voucher.terms}</p>
            </div>
          )}

          {/* CTA */}
          {alreadyRedeemed ? (
            <Button label="View in My Redemptions" icon="pi pi-check-circle"
              onClick={() => navigate('/my-redemptions')} className="w-full"
              style={{ background: 'var(--accent-emerald)', border: 'none', borderRadius: 12, padding: '0.9rem', fontWeight: 600 }} />
          ) : !voucher.isAvailable ? (
            <Button label="No longer available" disabled className="w-full"
              style={{ borderRadius: 12, padding: '0.9rem' }} />
          ) : !canAfford ? (
            <Button label={`You need ${voucher.pointsCost - user.points} more points`} disabled className="w-full"
              style={{ borderRadius: 12, padding: '0.9rem' }} />
          ) : (
            <Button label="Redeem this voucher" icon="pi pi-ticket"
              onClick={() => setConfirmOpen(true)} className="w-full"
              style={{
                background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500))',
                border: 'none', borderRadius: 12, padding: '0.9rem', fontWeight: 600,
              }} />
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog visible={confirmOpen} onHide={() => setConfirmOpen(false)} header="Confirm redemption"
        style={{ width: '90vw', maxWidth: 420 }}>
        <p style={{ color: 'var(--ink-500)', marginBottom: '1.5rem' }}>
          This will use <strong style={{ color: 'var(--ink-900)' }}>{voucher.pointsCost} points</strong> from
          your balance of {user?.points} points. This action cannot be undone, but you can cancel for a refund later.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button label="Cancel" outlined severity="secondary" onClick={() => setConfirmOpen(false)} className="flex-1" />
          <Button label="Confirm redeem" loading={redeeming} onClick={handleRedeem} className="flex-1"
            style={{ background: 'var(--ink-900)', border: 'none' }} />
        </div>
      </Dialog>

      {/* Success dialog */}
      <Dialog visible={successOpen} onHide={() => { setSuccessOpen(false); navigate('/my-redemptions'); }}
        header="Voucher redeemed!" style={{ width: '90vw', maxWidth: 420 }} closable={false}>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          {newRedemption?.qrCodeData && (
            <img src={newRedemption.qrCodeData} alt="QR Code" style={{ width: 180, height: 180, margin: '0 auto 1.25rem' }} />
          )}
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            {newRedemption?.redemptionCode}
          </div>
          <Button label="View in My Redemptions" className="w-full"
            onClick={() => { setSuccessOpen(false); navigate('/my-redemptions'); }}
            style={{ background: 'var(--ink-900)', border: 'none', borderRadius: 10 }} />
        </div>
      </Dialog>

      <style>{`@media (max-width: 560px) { .vx-info-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
};

export default VoucherDetail;
