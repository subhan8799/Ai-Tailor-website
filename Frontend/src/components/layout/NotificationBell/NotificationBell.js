import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

function timeAgo(date) {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
}

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const load = useCallback(async () => {
        if (!token) return;
        try {
            const res = await apiFetch('/api/v1/extra/notifications', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnread(data.unread || 0);
        } catch { }
    }, [token]);

    useEffect(() => {
        load();
        const interval = setInterval(load, 15000);
        return () => clearInterval(interval);
    }, [load]);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const markAllRead = async () => {
        setLoading(true);
        await apiFetch('/api/v1/extra/notifications/read-all', { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } }).catch(() => {});
        setUnread(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setLoading(false);
    };

    const markOneRead = async (id, link) => {
        await apiFetch(`/api/v1/extra/notifications/${id}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } }).catch(() => {});
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnread(prev => Math.max(0, prev - 1));
        if (link) {
            setOpen(false);
            navigate(link);
        }
    };

    const icons = { order: '📦', gift: '🎁', system: '🔔', promo: '🏷️' };
    const colors = { order: '#3498db', gift: '#e74c3c', system: '#c9a84c', promo: '#2ecc71' };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => { setOpen(!open); if (!open) load(); }} style={{
                width: 36, height: 36,
                background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 15, position: 'relative', padding: 0,
                transition: 'all 0.2s'
            }}>
                🔔
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: -5, right: -5,
                        background: '#e74c3c', color: '#fff', fontSize: 9, fontWeight: 700,
                        minWidth: 18, height: 18, borderRadius: 9, padding: '0 4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'pulse 2s infinite'
                    }}>{unread > 99 ? '99+' : unread}</span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: -20, width: 360,
                    background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                    borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 9999,
                    maxHeight: 480, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    animation: 'dropDown 0.2s ease'
                }}>
                    {/* Header */}
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(128,128,128,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <div>
                            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>Notifications</span>
                            {unread > 0 && <span style={{ marginLeft: 8, background: 'rgba(231,76,60,0.15)', color: '#e74c3c', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{unread} new</span>}
                        </div>
                        {unread > 0 && (
                            <button onClick={markAllRead} disabled={loading} style={{
                                background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', fontWeight: 500
                            }}>{loading ? '...' : 'Mark all read'}</button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center' }}>
                                <div style={{ fontSize: 36, marginBottom: 8 }}>🔕</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No notifications yet</div>
                            </div>
                        ) : (
                            notifications.slice(0, 30).map((n, i) => (
                                <div key={i} onClick={() => markOneRead(n._id, n.link)} style={{
                                    padding: '12px 18px', borderBottom: '1px solid rgba(128,128,128,0.05)',
                                    background: n.read ? 'transparent' : 'color-mix(in srgb, var(--accent) 3%, transparent)',
                                    cursor: 'pointer', transition: 'background 0.15s',
                                    display: 'flex', gap: 12, alignItems: 'flex-start'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 6%, transparent)'}
                                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'color-mix(in srgb, var(--accent) 3%, transparent)'}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                        background: `${colors[n.type] || '#c9a84c'}15`,
                                        border: `1px solid ${colors[n.type] || '#c9a84c'}30`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                                    }}>{icons[n.type] || '🔔'}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: 'var(--text)', lineHeight: 1.4 }}>{n.title}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, opacity: 0.7 }}>{timeAgo(n.timestamp)}</div>
                                    </div>
                                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[n.type] || 'var(--accent)', flexShrink: 0, marginTop: 6 }} />}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(128,128,128,0.1)', textAlign: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes dropDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
            `}</style>
        </div>
    );
}

export default NotificationBell;
