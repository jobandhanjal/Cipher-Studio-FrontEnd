import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const push = useCallback((msg) => {
    const id = Date.now().toString();
    setMessages(m => [...m, { id, ...msg }]);
    // auto-remove
    setTimeout(() => setMessages(m => m.filter(x => x.id !== id)), 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ push }}>
      {children}
      <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 10000 }}>
        {messages.map(m => (
          <div key={m.id} style={{ background: '#111827', color: '#fff', padding: '8px 12px', marginBottom: 8, borderRadius: 6 }}>
            <strong>{m.title}</strong>
            <div>{m.message}</div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

export default NotificationContext;
