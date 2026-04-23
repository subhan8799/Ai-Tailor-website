import React, { useEffect, useState } from "react";
import "./AdminOrderList.css";
import * as OrderStatus from "../../../constants/OrderStatus";
import { apiFetch } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast/Toast';

function AdminOrderList() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const toast = useToast();

    async function getAllOrders() {
        try {
            const token = localStorage.getItem('token');
            const res = await apiFetch('/api/v1/order/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (err) { console.warn('Failed to load orders:', err.message); }
        setIsLoading(false);
    }

    useEffect(() => { getAllOrders(); }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await apiFetch(`/api/v1/order/status/${orderId}`, {
                method: "PATCH",
                headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ order_status: newStatus })
            });
            toast(`Order updated to ${newStatus}`, 'success');
            getAllOrders();
        } catch { toast('Update failed', 'error'); }
    };

    const stats = [
        { label: 'Total', count: orders.length, icon: '📋' },
        { label: 'Pending', count: orders.filter(o => o.status === OrderStatus.PENDING).length, icon: '⏳' },
        { label: 'Processing', count: orders.filter(o => o.status === OrderStatus.PROCESSING).length, icon: '✂️' },
        { label: 'Shipped', count: orders.filter(o => o.status === OrderStatus.SHIPPED).length, icon: '🚚' },
        { label: 'Delivered', count: orders.filter(o => o.status === OrderStatus.DELIVERED).length, icon: '✅' },
    ];

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const statusColor = (s) => {
        if (s === OrderStatus.DELIVERED) return '#2ecc71';
        if (s === OrderStatus.SHIPPED) return '#3498db';
        if (s === OrderStatus.PROCESSING) return '#f39c12';
        return '#e74c3c';
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '2rem', marginBottom: 4 }}>Customer Orders</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Manage and track all customer orders</p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
                {stats.map((s, i) => (
                    <div key={i} onClick={() => setFilter(i === 0 ? 'all' : s.label)}
                        style={{
                            background: 'var(--bg-card)', border: (filter === 'all' && i === 0) || filter === s.label ? '1px solid var(--accent)' : '1px solid color-mix(in srgb, var(--accent) 10%, transparent)',
                            borderRadius: 'var(--card-radius, 14px)', padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>{s.count}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Orders */}
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div className="spinner-border" style={{ color: 'var(--accent)', width: 48, height: 48 }} role="status" />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                    <h3 style={{ color: 'var(--text-secondary)' }}>No orders found</h3>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map((order, i) => (
                        <div key={i} style={{
                            background: 'var(--bg-card)',
                            border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)',
                            borderRadius: 'var(--card-radius, 14px)',
                            padding: 20,
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: 16,
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', background: 'color-mix(in srgb, var(--accent) 5%, transparent)', padding: '2px 8px', borderRadius: 6 }}>
                                        #{order._id?.slice(-8)}
                                    </span>
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                                        color: statusColor(order.status),
                                        background: `${statusColor(order.status)}15`,
                                        padding: '3px 10px', borderRadius: 20
                                    }}>{order.status}</span>
                                    {order.isGift && <span style={{ fontSize: 10, background: 'rgba(231,76,60,0.1)', color: '#e74c3c', padding: '3px 8px', borderRadius: 20 }}>🎁 Gift</span>}
                                </div>

                                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                                    {order.productType === 'Suit'
                                        ? `${order.product?.type?.replace('_', ' ')} Suit — ${order.product?.fabric?.name || ''}`
                                        : `${order.product?.name} (${order.product?.color})`}
                                </div>

                                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                                    <span>👤 {order.user?.username}</span>
                                    <span>📅 {order.timestamp?.slice(0, 10)}</span>
                                    <span>💰 £{order.price}</span>
                                    <span>📦 {order.productType}</span>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <select value={order.status} onChange={e => handleUpdateStatus(order._id, e.target.value)}
                                    style={{
                                        background: 'var(--bg-input, #1a1a1a)',
                                        border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                                        borderRadius: 8, padding: '8px 12px',
                                        color: 'var(--text)', fontSize: 13, outline: 'none', cursor: 'pointer'
                                    }}>
                                    <option value={OrderStatus.PENDING}>⏳ Pending</option>
                                    <option value={OrderStatus.PROCESSING}>✂️ Processing</option>
                                    <option value={OrderStatus.SHIPPED}>🚚 Shipped</option>
                                    <option value={OrderStatus.DELIVERED}>✅ Delivered</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminOrderList;
