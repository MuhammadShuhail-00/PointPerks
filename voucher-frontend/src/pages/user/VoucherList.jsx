import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import { Skeleton } from 'primereact/skeleton';
import { voucherAPI } from '../../services/api';
import { categoryIcons } from '../../utils/helpers';
import VoucherCard from '../../components/voucher/VoucherCard';
import EmptyState from '../../components/common/EmptyState';

const CATEGORIES = [
  { key: '', label: 'All', icon: 'pi-th-large' },
  { key: 'food', label: 'Food', icon: categoryIcons.food },
  { key: 'shopping', label: 'Shopping', icon: categoryIcons.shopping },
  { key: 'travel', label: 'Travel', icon: categoryIcons.travel },
  { key: 'entertainment', label: 'Entertainment', icon: categoryIcons.entertainment },
  { key: 'health', label: 'Health', icon: categoryIcons.health },
];

const PAGE_SIZE = 12;

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      voucherAPI.getAll({
        category: category || undefined,
        search: search || undefined,
        page: page + 1,
        limit: PAGE_SIZE,
      }).then((res) => {
        setVouchers(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      }).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [category, search, page]);

  return (
    <div className="vx-page" style={{ maxWidth: 1180 }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>Browse vouchers</h1>
      <p style={{ color: 'var(--ink-500)', marginBottom: '1.75rem' }}>
        {total} vouchers available across 5 categories
      </p>

      {/* Search */}
      <span className="p-input-icon-left" style={{ width: '100%', maxWidth: 420, display: 'block', marginBottom: '1.25rem' }}>
        <i className="pi pi-search" />
        <InputText
          value={search} placeholder="Search by title or merchant..."
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="w-full" style={{ padding: '0.7rem 0.9rem 0.7rem 2.5rem', borderRadius: 10 }}
        />
      </span>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => { setCategory(c.key); setPage(0); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1rem', borderRadius: 999, border: '1px solid',
              borderColor: category === c.key ? 'var(--ink-900)' : 'var(--surface-border)',
              background: category === c.key ? 'var(--ink-900)' : 'var(--surface-0)',
              color: category === c.key ? '#fff' : 'var(--ink-700)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
            }}>
            <i className={`pi ${c.icon}`} style={{ fontSize: '0.8rem' }} />
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }} className="vx-voucher-grid">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height="280px" borderRadius="16px" />)}
        </div>
      ) : vouchers.length === 0 ? (
        <EmptyState icon="pi-search" title="No vouchers found"
          body="Try a different search term or category." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }} className="vx-voucher-grid">
            {vouchers.map((v) => <VoucherCard key={v._id} voucher={v} />)}
          </div>
          {total > PAGE_SIZE && (
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <Paginator first={page * PAGE_SIZE} rows={PAGE_SIZE} totalRecords={total}
                onPageChange={(e) => setPage(e.page)} />
            </div>
          )}
        </>
      )}

      <style>{`
        @media (max-width: 1000px) { .vx-voucher-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 760px) { .vx-voucher-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .vx-voucher-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default VoucherList;
