import React from 'react';
import { Button } from 'primereact/button';

const EmptyState = ({ icon = 'pi-inbox', title, body, actionLabel, onAction }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '4rem 2rem', textAlign: 'center',
  }}>
    <div style={{
      width: 64, height: 64, borderRadius: 16, background: 'var(--surface-100)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
    }}>
      <i className={`pi ${icon}`} style={{ fontSize: '1.6rem', color: 'var(--ink-300)' }} />
    </div>
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{title}</h3>
    {body && <p style={{ color: 'var(--ink-500)', fontSize: '0.9rem', maxWidth: 320, marginBottom: '1.5rem' }}>{body}</p>}
    {actionLabel && (
      <Button label={actionLabel} onClick={onAction}
        style={{ background: 'var(--ink-900)', border: 'none', borderRadius: 10 }} />
    )}
  </div>
);

export default EmptyState;
