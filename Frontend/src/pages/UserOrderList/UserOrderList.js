import React, { useEffect, useState } from 'react';
import './UserOrderList.css';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import OrderPipeline from '../../components/ui/OrderPipeline/OrderPipeline';

function UserOrderList() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="orders-grid">
          {orders.orders.map((order, i) => (
            <div key={i} className="order-card" style={{display:'block'}}>
              <div style={{display:'grid', gridTemplateColumns:'80px 1fr auto', gap:20, alignItems:'center'}}>
              <img className="order-img" src={order.product?.image || '/default_fabric.jpg'} alt="order" />
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
      )}
    </div>
  );
}

export default UserOrderList;
