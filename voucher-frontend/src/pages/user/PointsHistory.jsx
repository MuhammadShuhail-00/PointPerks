import React, { useEffect, useState } from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Paginator } from 'primereact/paginator';
import { userAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import EmptyState from '../../components/common/EmptyState';

const TYPE_META = {
  earned: { icon: 'pi-arrow-up', color: 'var(--accent-emerald)' },
  bonus: { icon: 'pi-gift', color: 'var(--accent-emerald)' },
  refunded: { icon: 'pi-replay', color: 'var(--brand-600)' },
  spent: { icon: 'pi-arrow-down', color: 'var(--accent-rose)' },
};

const PAGE_SIZE = 15;

const PointsHistory = () => {
  const [data, setData] = useState({ currentPoints: 0, history: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    userAPI.getPointsHistory({ page: page + 1, limit: PAGE_SIZE })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="vx-page" style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>Points history</h1>
      <p style={{ color: 'var(--ink-500)', marginBottom: '1.5rem' }}>Every point earned, spent, or refunded.</p>

      {/* Balance card */}
      <div className="vx-card" style={{
        padding: '1.75rem', marginBottom: '2rem', textAlign: 'center',
        background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500))', border: 'none',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Current balance</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>
          {data.currentPoints?.toLocaleString()} <span style={{ fontSize: '1.2rem', fontWeight: 600, opacity: 0.85 }}>pts</span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="64px" borderRadius="12px" />)}
        </div>
      ) : data.history.length === 0 ? (
        <EmptyState icon="pi-star" title="No points activity yet"
          body="Earn points by signing up, referring friends, or redeeming vouchers." />
      ) : (
        <>
          <div className="vx-card" style={{ overflow: 'hidden' }}>
            {data.history.map((h, i) => {
              const meta = TYPE_META[h.type] || TYPE_META.earned;
              const isPositive = h.points > 0;
              return (
                <div key={h._id || i} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                  borderBottom: i < data.history.length - 1 ? '1px solid var(--surface-border)' : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: `${meta.color}1A`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <i className={`pi ${meta.icon}`} style={{ color: meta.color, fontSize: '0.9rem' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-300)' }}>{formatDate(h.createdAt)}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {isPositive ? '+' : ''}{h.points}
                  </div>
                </div>
              );
            })}
          </div>

          {data.pagination?.totalPages > 1 && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <Paginator first={page * PAGE_SIZE} rows={PAGE_SIZE} totalRecords={data.pagination.total}
                onPageChange={(e) => setPage(e.page)} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PointsHistory;
