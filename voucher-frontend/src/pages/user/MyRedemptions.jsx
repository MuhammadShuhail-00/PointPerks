import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import toast from 'react-hot-toast';
import { redemptionAPI } from '../../services/api';
import { formatDate, getStatusSeverity, downloadPDF } from '../../utils/helpers';
import EmptyState from '../../components/common/EmptyState';

const TABS = [
  { label: 'All', status: undefined },
  { label: 'Active', status: 'active' },
  { label: 'Used', status: 'used' },
  { label: 'Cancelled', status: 'cancelled' },
];

const MyRedemptions = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const handleDownload = async (id, title) => {
    setDownloadingId(id);
    try {
      const res = await redemptionAPI.downloadPDF(id);
      downloadPDF(res.data, `voucher-${title?.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      toast.error('Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="vx-page" style={{ maxWidth: 1000 }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>My redemptions</h1>
      <p style={{ color: 'var(--ink-500)', marginBottom: '1.5rem' }}>Track and manage your redeemed vouchers.</p>

      <TabView activeIndex={tab} onTabChange={(e) => setTab(e.index)}>
        {TABS.map((t) => <TabPanel key={t.label} header={t.label} />)}
      </TabView>

      <div style={{ marginTop: '1.25rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height="100px" borderRadius="16px" />)}
          </div>
        ) : redemptions.length === 0 ? (
          <EmptyState icon="pi-ticket" title="No redemptions here"
            body="Browse vouchers and redeem one to see it in this list." actionLabel="Browse vouchers"
            onAction={() => navigate('/vouchers')} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {redemptions.map((r) => (
              <div key={r._id} className="vx-card" style={{
                padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
              }}>
                {/* QR thumbnail */}
                {r.qrCodeData && (
                  <img src={r.qrCodeData} alt="QR" style={{
                    width: 60, height: 60, borderRadius: 8, border: '1px solid var(--surface-border)', flexShrink: 0,
                  }} />
                )}

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700 }}>{r.voucher?.title}</span>
                    <Tag value={r.status} severity={getStatusSeverity(r.status)} style={{ fontSize: '0.65rem' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)' }}>{r.voucher?.merchant}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--ink-300)', marginTop: '0.3rem' }}>
                    {r.redemptionCode}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-300)', marginTop: '0.2rem' }}>
                    Redeemed {formatDate(r.createdAt)} · Expires {formatDate(r.expiresAt)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button label="PDF" icon="pi pi-file-pdf" outlined size="small"
                    loading={downloadingId === r._id}
                    onClick={() => handleDownload(r._id, r.voucher?.title)} />
                  {r.status === 'active' && (
                    <Button label="Cancel" icon="pi pi-times" outlined severity="danger" size="small"
                      onClick={() => handleCancel(r._id)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRedemptions;
