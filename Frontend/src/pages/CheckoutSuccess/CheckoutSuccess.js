import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiFetch } from '../../services/api';
import { emit } from '../../services/events';

export default function CheckoutSuccess() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const sessionId = searchParams.get("session_id");
        if (!sessionId) { setStatus('error'); return; }

        async function createOrder() {
            try {
                const token = localStorage.getItem('token');
                const res = await apiFetch('/api/v1/order/checkout-success', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        session_id: sessionId,
                        user_id: localStorage.getItem('user_id'),
                        isGift: searchParams.get("isGift")
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data.orders || []);
                    setStatus('success');
                    emit('cart-updated');
                } else {
                    console.error('Order creation failed:', res.status);
                    setStatus('error');
                }
            } catch (err) {
                console.error('Order creation error:', err);
                setStatus('error');
            }
        }
        createOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (status === 'loading') {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <div className="spinner-border" style={{ color: '#c9a84c', width: 48, height: 48 }} role="status" />
                <p style={{ color: '#a09880', marginTop: 16 }}>Processing your order...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <h2 style={{ color: '#ff6b6b' }}>Something went wrong</h2>
                <p style={{ color: '#a09880' }}>Your payment was processed but order creation failed.</p>
                <Link to="/user-order-list" style={{ color: '#c9a84c' }}>Check My Orders</Link>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', padding: 60, maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h1 style={{ color: '#c9a84c', fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Order Placed!</h1>
            <p style={{ color: '#a09880', marginBottom: 32 }}>
                {orders.length} item{orders.length !== 1 ? 's' : ''} ordered successfully
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link to="/user-order-list" style={{
                    padding: '12px 24px', background: '#c9a84c', color: '#0d0d0d',
                    borderRadius: 8, textDecoration: 'none', fontWeight: 700
                }}>📦 View My Orders</Link>
                <Link to="/design" style={{
                    padding: '12px 24px', background: 'transparent', color: '#c9a84c',
                    borderRadius: 8, textDecoration: 'none', fontWeight: 600,
                    border: '1px solid rgba(201,168,76,0.3)'
                }}>✂️ Design Another</Link>
            </div>
        </div>
    );
}
