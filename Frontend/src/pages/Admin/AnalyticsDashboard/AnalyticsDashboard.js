import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../services/api';

const Bar = ({ value, max, color }) => (
    <div style={{ height: 8, background: 'rgba(128,128,128,0.1)', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
        <div style={{ height: '100%', width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color || 'var(--accent)', borderRadius: 4, transition: 'width 0.5s ease' }} />
    </div>
);

function AnalyticsDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        async function load() {
            try {
                const res = await apiFetch('/api/v1/pro/analytics', { headers: { 'Authorization': `Bearer ${token}` } });
                setData(await res.json());
            } catch { }
            setLoading(false);
        }
        load();
    }, [token]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" /></div>;
    if (!data) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Failed to load analytics.</div>;

    const statCards = [
        { label: 'Total Revenue', val: `£${data.totalRevenue || 0}`, icon: '💰', color: '#2ecc71' },
        { label: 'Orders', val: data.orders || 0, icon: '📦', color: 'var(--accent)' },
        { label: 'Users', val: data.users || 0, icon: '👤', color: '#3498db' },
        { label: 'Avg Rating', val: `${data.avgRating || 0}★`, icon: '⭐', color: '#f39c12' },
        { label: 'Fabrics', val: data.fabrics || 0, icon: '🧵', color: '#9b59b6' },
        { label: 'Suits', val: data.suits || 0, icon: '👔', color: '#e74c3c' },
        { label: 'Reviews', val: data.reviews || 0, icon: '💬', color: '#1abc9c' },
        { label: 'Appointments', val: data.appointments || 0, icon: '📅', color: '#e67e22' },
    ];

    const statusColors = { Pending: '#ffc107', Processing: '#3498db', Shipped: '#6c757d', Delivered: '#2ecc71' };
    const maxOrders = Math.max(...Object.values(data.ordersByStatus || {}), 1);

    const months = Object.entries(data.monthlyOrders || {}).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    const maxMonthly = Math.max(...months.map(m => m[1]), 1);

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
                <span className="badge-gold">Admin</span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text)', margin: '8px 0' }}>Analytics <span style={{ color: 'var(--accent)' }}>Dashboard</span></h1>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14, marginBottom: 32 }}>
                {statCards.map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius)', padding: '20px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Orders by Status */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius)', padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '1.1rem', marginBottom: 20 }}>Orders by Status</h3>
                    {Object.entries(data.ordersByStatus || {}).map(([status, count]) => (
                        <div key={status} style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{status}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: statusColors[status] || 'var(--accent)' }}>{count}</span>
                            </div>
                            <Bar value={count} max={maxOrders} color={statusColors[status]} />
                        </div>
                    ))}
                    {Object.keys(data.ordersByStatus || {}).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No orders yet.</p>}
                </div>

                {/* Monthly Orders */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius)', padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '1.1rem', marginBottom: 20 }}>Monthly Orders</h3>
                    {months.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet.</p> : (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
                            {months.map(([month, count]) => (
                                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>{count}</span>
                                    <div style={{ width: '100%', background: 'var(--accent)', borderRadius: '6px 6px 0 0', height: `${(count / maxMonthly) * 120}px`, minHeight: 4, transition: 'height 0.5s ease' }} />
                                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{month.slice(5)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
