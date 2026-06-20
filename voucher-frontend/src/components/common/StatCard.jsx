import React from 'react';

const StatCard = ({ icon, label, value, accent = 'var(--brand-600)', sub }) => (
  <div className="vx-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10, background: `${accent}1A`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem',
    }}>
      <i className={`pi ${icon}`} style={{ color: accent, fontSize: '1.1rem' }} />
    </div>
    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink-900)' }}>{value}</div>
    <div style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{sub}</div>}
  </div>
);

export default StatCard;
