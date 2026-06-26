import React from 'react';

/* ── Design tokens ───────────────────────────────────────────────── */
const C = {
  surfaceContainerHighest: '#e2e2e2',
  outlineVariant: '#c4c6cf',
  onSurfaceVariant: '#43474e',
};

const Footer = () => {
  return (
    <footer
      style={{
        width: '100%',
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        background: C.surfaceContainerHighest,
        borderTop: `1px solid ${C.outlineVariant}`,
        boxSizing: 'border-box',
      }}
    >
      <p style={{ fontSize: 12, color: C.onSurfaceVariant, margin: 0, textAlign: 'center' }}>
        © {new Date().getFullYear()} PointPerks Institutional. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;