import React, { useEffect, useState } from 'react';

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const boxStyle = {
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  padding: '24px 32px',
  borderRadius: '12px',
  boxShadow: '0 6px 30px rgba(0,0,0,0.6)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  minWidth: '220px'
};

const spinnerStyle = {
  width: '36px',
  height: '36px',
  border: '4px solid rgba(255,255,255,0.15)',
  borderTopColor: '#60a5fa',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const styleTag = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;

const LoadingOverlay = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // insert keyframes into document once
    const styleEl = document.createElement('style');
    styleEl.innerHTML = styleTag;
    document.head.appendChild(styleEl);

    const handler = (e) => {
      const detail = e?.detail;
      // support both boolean and numeric detail (count)
      if (typeof detail === 'boolean') setVisible(detail);
      else if (typeof detail === 'number') setVisible(detail > 0);
    };

    window.addEventListener('api:loading', handler);
    return () => {
      window.removeEventListener('api:loading', handler);
      if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
    };
  }, []);

  if (!visible) return null;

  return (
    <div style={backdropStyle} aria-hidden={false} role="dialog" aria-label="Please wait">
      <div style={boxStyle}>
        <div style={spinnerStyle} aria-hidden="true" />
        <div style={{ fontWeight: 600, color: '#e6eef8' }}>Please wait...</div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(230,238,248,0.8)' }}>Request in progress</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
