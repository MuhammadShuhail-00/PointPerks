import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import toast from 'react-hot-toast';
import { redemptionAPI } from '../../services/api';
import { formatDate, formatDiscount, getStatusSeverity, downloadPDF } from '../../utils/helpers';

const PDFVoucherPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [redemption, setRedemption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    redemptionAPI.getOne(id)
      .then((res) => setRedemption(res.data.redemption))
      .catch(() => toast.error('Redemption not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await redemptionAPI.downloadPDF(id);
      downloadPDF(res.data, `voucher-${redemption.redemptionCode}.pdf`);
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="vx-page" style={{ maxWidth: 500 }}>
        <Skeleton height="480px" borderRadius="20px" />
      </div>
    );
  }

  if (!redemption) return null;

  const v = redemption.voucherSnapshot || {};

  return (
    <div className="vx-page" style={{ maxWidth: 480 }}>
      <Button label="Back" icon="pi pi-arrow-left" text
        onClick={() => navigate('/my-redemptions')} style={{ color: 'var(--ink-500)', marginBottom: '1rem', paddingLeft: 0 }} />

      {/* Ticket-style card */}
      <div className="vx-card" style={{ overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-500) 60%, var(--accent-amber) 140%)',
          padding: '2rem', textAlign: 'center', color: '#fff',
        }}>
          <Tag value={redemption.status} severity={getStatusSeverity(redemption.status)}
            style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }} />
          <div style={{ fontSize: '2.4rem', fontWeight: 800 }}>
            {formatDiscount(v.discountType, v.discountValue)}
          </div>
          <div style={{ opacity: 0.9, marginTop: '0.25rem' }}>{v.merchant}</div>
        </div>

        <div style={{ padding: '1.75rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>{v.title}</h2>

          {redemption.qrCodeData && (
            <img src={redemption.qrCodeData} alt="QR Code" style={{
              width: 200, height: 200, margin: '0 auto 1.5rem', borderRadius: 12,
              border: '1px solid var(--surface-border)', padding: '0.5rem',
            }} />
          )}

          <div style={{
            fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em',
            padding: '0.75rem', background: 'var(--surface-50)', borderRadius: 10, marginBottom: '1.5rem',
          }}>
            {redemption.redemptionCode}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>Points used</div>
              <div style={{ fontWeight: 600 }}>{redemption.pointsUsed} pts</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>Valid until</div>
              <div style={{ fontWeight: 600 }}>{formatDate(redemption.expiresAt)}</div>
            </div>
          </div>

          <Button label="Download PDF" icon="pi pi-file-pdf" loading={downloading}
            onClick={handleDownload} className="w-full"
            style={{ background: 'var(--ink-900)', border: 'none', borderRadius: 10, padding: '0.8rem', fontWeight: 600 }} />
        </div>
      </div>
    </div>
  );
};

export default PDFVoucherPage;
