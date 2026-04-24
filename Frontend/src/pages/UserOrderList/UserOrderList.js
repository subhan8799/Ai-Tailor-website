import React, { useEffect, useState } from 'react';
import './UserOrderList.css';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import OrderPipeline from '../../components/ui/OrderPipeline/OrderPipeline';
import { getDisplayImage } from '../../utils/helpers';

function UserOrderList() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    async function getAllOrders() {
      try {
        const userId = localStorage.getItem('user_id');
        const token = localStorage.getItem('token');
        const res = await apiFetch(`/api/v1/order/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders(data);
      } catch(err) { console.warn('Failed to load orders:', err.message); }
      setIsLoading(false);
    }
    getAllOrders();
  }, []);

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      <p className="orders-subtitle">Track and manage your bespoke suit orders</p>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner-border" style={{ color: '#c9a84c', width: 48, height: 48 }} role="status" />
        </div>
      ) : !orders.orders?.length ? (
        <div className="orders-empty">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Start by <Link to="/design">designing your first suit</Link></p>
        </div>
      ) : (
        <>
        <div className="orders-grid">
          {orders.orders.slice((page - 1) * perPage, page * perPage).map((order, i) => (
            <div key={i} className="order-card" style={{display:'block'}}>
              <div style={{display:'grid', gridTemplateColumns:'80px 1fr auto', gap:20, alignItems:'center'}}>
              <img className="order-img" src={getDisplayImage(order.product?.image, order.productType, order.product?.type)} alt="order" />
              <div className="order-info">
                <div className="order-id">#{order._id}</div>
                <div className="order-name">
                  {order.productType === 'Suit'
                    ? `${order.product?.fabric?.color || ''} ${order.product?.fabric?.name || ''} Suit`
                    : `${order.product?.name} (${order.product?.color})`}
                  {order.isGift && <span className="badge-gold" style={{marginLeft: 8, fontSize: 10}}>🎁 Gift</span>}
                </div>
                <div className="order-meta">
                  <span>📅 {order.timestamp?.slice(0, 10)}</span>
                  <span>📦 {order.productType}</span>
                </div>
              </div>
              <div className="order-right">
                <div className="order-price">£{order.price}</div>
              </div>
              </div>
              <OrderPipeline status={order.status} />
            </div>
          ))}
        </div>
        {orders.orders.length > perPage && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '20px 0' }}>
                {(() => { const tp = Math.ceil(orders.orders.length / perPage); return (<>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="orders-page-btn" style={{ padding: '6px 12px', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, color: page === 1 ? 'var(--text-muted)' : 'var(--accent)', fontSize: 12, cursor: page === 1 ? 'default' : 'pointer' }}>←</button>
                    {Array.from({ length: tp }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                        <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: p === page ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 6%, transparent)', color: p === page ? 'var(--bg)' : 'var(--text-muted)', border: p === page ? 'none' : '1px solid color-mix(in srgb, var(--accent) 12%, transparent)' }}>{p}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(tp, p + 1))} disabled={page === tp} style={{ padding: '6px 12px', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, color: page === tp ? 'var(--text-muted)' : 'var(--accent)', fontSize: 12, cursor: page === tp ? 'default' : 'pointer' }}>→</button>
                </>); })()}
            </div>
        )}
        </>
      )}
    </div>
  );
}

export default UserOrderList;
