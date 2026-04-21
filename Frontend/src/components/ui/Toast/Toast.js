import React, { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext();

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const show = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }, []);

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const colors = { success: '#4ade80', error: '#ff6b6b', warning: '#ffc107', info: '#3498db' };

    return (
        <ToastContext.Provider value={show}>
            {children}
            <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        background: 'var(--bg-card, #1a1a1a)', border: `1px solid ${colors[t.type]}40`,
                        borderLeft: `4px solid ${colors[t.type]}`, borderRadius: 10,
                        padding: '12px 18px', minWidth: 280, maxWidth: 400,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        animation: 'toastIn 0.3s ease', display: 'flex', alignItems: 'center', gap: 10
                    }}>
                        <span style={{ fontSize: 18 }}>{icons[t.type]}</span>
                        <span style={{ color: 'var(--text, #f0ead6)', fontSize: 13 }}>{t.message}</span>
                    </div>
                ))}
            </div>
            <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }`}</style>
        </ToastContext.Provider>
    );
}
