import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { voucherAPI } from '../../services/api';
import VoucherCard from '../../components/voucher/VoucherCard';
import EmptyState from '../../components/common/EmptyState';

// PointPerks Theme Colors
const C = {
  primary: '#022448',
  primaryContainer: '#1e3a5f',
  brandGold: '#ffc641',
  surface: '#f9f9f8',
  surfaceLow: '#f4f4f3',
  surfaceContainerLow: '#f4f4f3',
  surfaceContainerHighest: '#e2e2e2',
  outline: '#74777f',
  outlineVariant: '#c4c6cf',
  onSurfaceVariant: '#43474e',
  onSurface: '#1a1c1c',
  white: '#ffffff',
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
  header: { marginBottom: 28 },
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
};

const CATEGORIES = [
  { key: '', label: 'All', icon: 'dashboard' },
  { key: 'food', label: 'Food', icon: 'restaurant' },
  { key: 'shopping', label: 'Shopping', icon: 'shopping_bag' },
  { key: 'travel', label: 'Travel', icon: 'flight' },
  { key: 'entertainment', label: 'Entertainment', icon: 'movie' },
  { key: 'health', label: 'Health', icon: 'health_and_safety' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'lowest_points', label: 'Lowest Points' },
  { key: 'highest_points', label: 'Highest Points' },
  { key: 'az', label: 'A - Z' },
  { key: 'za', label: 'Z - A' },
];

const PAGE_SIZE = 12;

const VoucherList = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      voucherAPI.getAll({
        category: category || undefined,
        search: search || undefined,
        sort: sort || undefined,
        page: page + 1,
        limit: PAGE_SIZE,
      }).then((res) => {
        setVouchers(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      }).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [category, search, sort, page]);

  const getSortedVouchers = () => {
    const sorted = [...vouchers];
    switch (sort) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'lowest_points':
        return sorted.sort((a, b) => (a.pointsCost || 0) - (b.pointsCost || 0));
      case 'highest_points':
        return sorted.sort((a, b) => (b.pointsCost || 0) - (a.pointsCost || 0));
      case 'az':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'za':
        return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      default:
        return sorted;
    }
  };

  const displayVouchers = getSortedVouchers();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(0, page - 2);
    let endPage = Math.min(totalPages - 1, page + 2);

    if (totalPages > maxVisible) {
      if (page < 2) endPage = 2;
      if (page > totalPages - 3) startPage = totalPages - 3;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div>
      <style>{`
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

        /* Shimmer loading animation */
        @keyframes pp-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Action Bar */
        .pp-action-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        /* Search input */
        .pp-search-wrap { 
          position: relative; 
          flex: 1; 
          min-width: 280px; 
        }
        .pp-search-input {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 44px;
          border-radius: 12px;
          border: 1.5px solid ${C.outlineVariant};
          background: ${C.white};
          font-size: 14px;
          color: ${C.onSurface};
          font-family: 'Inter', sans-serif;
          outline: none;
          box-sizing: border-box;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .pp-search-input::placeholder { color: ${C.outline}; }
        .pp-search-input:focus {
          border-color: ${C.primary};
          box-shadow: 0 0 0 3px rgba(2, 36, 72, 0.08);
        }

        /* Sort dropdown */
        .pp-sort-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .pp-sort-select {
          height: 48px;
          padding: 0 40px 0 44px;
          border-radius: 12px;
          border: 1.5px solid ${C.outlineVariant};
          background: ${C.white};
          font-size: 14px;
          color: ${C.primary};
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .pp-sort-select:focus {
          border-color: ${C.primary};
          box-shadow: 0 0 0 3px rgba(2, 36, 72, 0.08);
        }
        .pp-sort-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: ${C.outline};
          font-size: 20px;
          display: flex;
        }
        .pp-sort-chevron {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: ${C.onSurfaceVariant};
          font-size: 20px;
          display: flex;
        }

        /* Category Pills */
        .pp-pills-wrap {
          display: flex;
          gap: 8px;
          margin-bottom: 36px;
          overflow-x: auto;
          padding-bottom: 4px;
          /* Hide scrollbar for neatness but keep functionality */
          scrollbar-width: none; 
          -ms-overflow-style: none;
        }
        .pp-pills-wrap::-webkit-scrollbar { display: none; }

        .pp-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
          border: 1.5px solid ${C.outlineVariant};
          background: ${C.white};
          color: ${C.onSurfaceVariant};
        }
        .pp-pill:hover {
          background: ${C.surfaceLow};
          border-color: ${C.outline};
          color: ${C.onSurface};
        }
        .pp-pill-active {
          background: ${C.primary};
          border-color: ${C.primary};
          color: ${C.white};
          box-shadow: 0 2px 8px rgba(2, 36, 72, 0.2);
        }
        .pp-pill-active:hover {
          background: ${C.primaryContainer};
          border-color: ${C.primaryContainer};
          box-shadow: 0 4px 12px rgba(2, 36, 72, 0.25);
        }

        /* Skeleton cards */
        .pp-sk {
          background: ${C.surfaceContainerHighest};
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }
        .pp-sk::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255, 0.5), transparent);
          animation: pp-shimmer 1.5s infinite;
        }

        /* Pagination */
        .pp-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          padding-top: 48px;
        }
        .pp-page-btn {
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1.5px solid ${C.outlineVariant};
          background: ${C.white};
          color: ${C.onSurface};
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          transition: all 200ms ease;
          padding: 0 4px;
        }
        .pp-page-btn:hover:not(:disabled):not(.pp-page-btn-active) {
          border-color: ${C.primary};
          color: ${C.primary};
          background: rgba(2, 36, 72, 0.04);
          transform: translateY(-1px);
        }
        .pp-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          background: ${C.surfaceContainerHighest};
          border-color: ${C.surfaceContainerHighest};
        }
        .pp-page-btn-active {
          background: ${C.primary};
          border-color: ${C.primary};
          color: ${C.white};
          box-shadow: 0 4px 14px rgba(2, 36, 72, 0.25);
          transform: translateY(-1px);
        }
        .pp-page-btn-active:hover {
          background: ${C.primaryContainer};
          border-color: ${C.primaryContainer};
          box-shadow: 0 6px 18px rgba(2, 36, 72, 0.3);
        }
        .pp-page-nav {
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1.5px solid ${C.outlineVariant};
          background: ${C.white};
          color: ${C.onSurface};
          cursor: pointer;
          transition: all 200ms ease;
        }
        .pp-page-nav:hover:not(:disabled) {
          border-color: ${C.primary};
          color: ${C.primary};
          background: rgba(2, 36, 72, 0.04);
          transform: translateY(-1px);
        }
        .pp-page-nav:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          background: ${C.surfaceContainerHighest};
          border-color: ${C.surfaceContainerHighest};
        }
        .pp-page-dots { 
          padding: 0 4px; 
          color: ${C.outline}; 
          user-select: none; 
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 2px;
        }
        .pp-page-info {
          font-size: 13px;
          color: ${C.outline};
          margin-left: 12px;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) { 
          .pp-action-bar { flex-direction: column; align-items: stretch; }
          .pp-search-wrap { min-width: 100%; }
        }
      `}</style>

      {/* BREADCRUMB */}
      <nav style={styles.breadcrumb}>
        <button onClick={() => navigate('/dashboard')} style={styles.breadcrumbLink}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>home</span>
          Home
        </button>
        <span style={{ color: C.outlineVariant }}>/</span>
        <span style={{ color: C.onSurface, fontWeight: 600 }}>Vouchers</span>
      </nav>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Available Vouchers</h1>
        <p style={styles.subtitle}>
          {total} vouchers available across {CATEGORIES.length - 1} categories
        </p>
      </div>

      {/* ACTION BAR: Search & Sort */}
      <div className="pp-action-bar">
        {/* Search Input */}
        <div className="pp-search-wrap">
          <span className="material-symbols-outlined pp-search-icon" style={{ 
            position: 'absolute', 
            left: '14px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: C.outline, 
            fontSize: '20px', 
            pointerEvents: 'none'
          }}>
            search
          </span>
          <input
            type="text"
            value={search}
            placeholder="Search vouchers..."
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pp-search-input"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="pp-sort-wrap">
          <span className="material-symbols-outlined pp-sort-icon">sort</span>
          <select 
            className="pp-sort-select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(0); }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <span className="material-symbols-outlined pp-sort-chevron">expand_more</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="pp-pills-wrap">
        {CATEGORIES.map((c) => {
          const isActive = category === c.key;
          return (
            <button
              key={c.key}
              onClick={() => { setCategory(c.key); setPage(0); }}
              className={`pp-pill ${isActive ? 'pp-pill-active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ 
                fontSize: '18px', 
                fontVariationSettings: isActive ? `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24` : `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24` 
              }}>
                {c.icon}
              </span>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Grid & Loading States */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: C.white, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${C.outlineVariant}`, boxShadow: '0px 4px 20px rgba(30, 58, 95, 0.04)' }}>
              <div className="pp-sk" style={{ height: '180px', borderRadius: '0' }} />
              <div style={{ padding: '20px' }}>
                <div className="pp-sk" style={{ height: '20px', width: '70%', marginBottom: '12px' }} />
                <div className="pp-sk" style={{ height: '14px', width: '100%', marginBottom: '8px' }} />
                <div className="pp-sk" style={{ height: '14px', width: '90%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : vouchers.length === 0 ? (
        <EmptyState icon="search" title="No vouchers found" body="Try a different search term or category." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {displayVouchers.map((v) => (
              <VoucherCard key={v._id} voucher={v} />
            ))}
          </div>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="pp-pagination">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="pp-page-nav"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
              </button>

              {page > 2 && (
                <>
                  <button onClick={() => setPage(0)} className="pp-page-btn">1</button>
                  {page > 3 && <span className="pp-page-dots">...</span>}
                </>
              )}

              {renderPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`pp-page-btn ${page === p ? 'pp-page-btn-active' : ''}`}
                >
                  {p + 1}
                </button>
              ))}

              {page < totalPages - 3 && (
                <>
                  {page < totalPages - 4 && <span className="pp-page-dots">...</span>}
                  <button onClick={() => setPage(totalPages - 1)} className="pp-page-btn">{totalPages}</button>
                </>
              )}

              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="pp-page-nav"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
              </button>

              <span className="pp-page-info">
                Page {page + 1} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoucherList;