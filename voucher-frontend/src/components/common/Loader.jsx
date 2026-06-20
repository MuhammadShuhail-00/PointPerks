import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '200px', gap: '1rem',
    }}>
      <ProgressSpinner style={{ width: '50px', height: '50px' }} />
      <p style={{ color: '#6c757d' }}>{message}</p>
    </div>
  );
};

export default Loader;
