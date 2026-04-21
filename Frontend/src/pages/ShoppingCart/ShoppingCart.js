import React, { useEffect, useState } from 'react';
import "./ShoppingCart.css";
import * as ProductTypes from '../../constants/ProductTypes';
import CartAPI from '../../services/CartAPI';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, API } from '../../services/api';
import { useToast } from '../../components/ui/Toast/Toast';

const imgUrl = (p) => !p ? '/default_fabric.jpg' : p.startsWith('http') ? p : `${API}${p}`;

function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isGift, setIsGift] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/api/v1/cart/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      const cartItems = data.cartItems || [];
      setItems(cartItems);
      setTotalPrice(cartItems.reduce((s, i) => s + (i.product?.price || 0), 0));
    } catch { }
    setItemsLoading(false);
  };

  useEffect(() => { loadCart(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item?')) return;
    await CartAPI.deleteFromCart(id);
    toast('Item removed', 'success');
    loadCart();
  };

  const handleAddAnother = async (item) => {
    await CartAPI.addToCart(item.productType, item.product?._id);
    toast('Quantity +1', 'success');
    loadCart();
  };

  const handleUpdate = (item) => {
    navigate(`/cart-edit?id=${item._id}`);
  };

  const handleRemoveOne = async (item) => {
    const sameItems = items.filter(i => i.product?._id === item.product?._id);
    if (sameItems.length > 1) {
      await CartAPI.deleteFromCart(sameItems[sameItems.length - 1]._id);
      toast('Quantity -1', 'success');
      loadCart();
    }
  };

  const checkoutButton = async () => {
    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/api/v1/order/checkout?isGift=${isGift}`, {
        method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Origin': window.location.origin }
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast(data.msg || 'Checkout failed', 'error');
    } catch { toast('Checkout failed', 'error'); }
    setCheckoutLoading(false);
  };

  // Group items by product ID
  const grouped = {};
  items.forEach(item => {
    const key = item.product?._id;
    if (!grouped[key]) grouped[key] = { ...item, qty: 1, allIds: [item._id] };
    else { grouped[key].qty++; grouped[key].allIds.push(item._id); }
  });
  const groupedItems = Object.values(grouped);

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '40px 20px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '2rem', marginBottom: 4 }}>Shopping Bag</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>

      {itemsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner-border" style={{ color: 'var(--accent)', width: 48, height: 48 }} role="status" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {groupedItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>Your bag is empty</h3>
                <p><Link to="/design" style={{ color: 'var(--accent)' }}>Design a suit</Link> or <Link to="/fabrics" style={{ color: 'var(--accent)' }}>browse fabrics</Link></p>
              </div>
            ) : groupedItems.map(item => (
              <div key={item._id} style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius, 14px)', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                <img src={imgUrl(item.product?.image)} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', flexShrink: 0 }} />

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1 }}>{item.productType}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>
                    {item.productType === ProductTypes.SUIT ? `${item.product?.type?.replace('_', ' ')} Suit` : `${item.product?.name} (${item.product?.color})`}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>
                    £{item.product?.price}
                    {item.qty > 1 && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>× {item.qty} = £{item.product?.price * item.qty}</span>}
                  </div>
                  {item.productType === ProductTypes.SUIT && item.product && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      L:{item.product.length} · W:{item.product.waist} · C:{item.product.chest} · A:{item.product.arm_length}
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                  {/* Quantity */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)', borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => handleRemoveOne(item)} disabled={item.qty <= 1}
                      style={{ width: 30, height: 30, background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: 'none', color: item.qty > 1 ? 'var(--accent)' : 'var(--text-muted)', fontSize: 15, cursor: item.qty > 1 ? 'pointer' : 'default' }}>−</button>
                    <span style={{ width: 32, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{item.qty}</span>
                    <button onClick={() => handleAddAnother(item)}
                      style={{ width: 30, height: 30, background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: 'none', color: 'var(--accent)', fontSize: 15, cursor: 'pointer' }}>+</button>
                  </div>

                  <button onClick={() => handleUpdate(item)} style={{
                    background: 'transparent', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                    borderRadius: 6, padding: '4px 10px', color: 'var(--accent)', fontSize: 11, cursor: 'pointer', width: '100%', textAlign: 'center'
                  }}>✏️ Update</button>

                  <button onClick={() => { item.allIds.forEach(id => CartAPI.deleteFromCart(id)); toast('Removed', 'success'); setTimeout(loadCart, 300); }}
                    style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.2)', borderRadius: 6, padding: '4px 10px', color: '#ff6b6b', fontSize: 11, cursor: 'pointer', width: '100%', textAlign: 'center' }}>
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--card-radius, 16px)', padding: 24, position: 'sticky', top: 88 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)' }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}><span>Items ({items.length})</span><span>£{totalPrice}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}><span>Tailoring</span><span>Included</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}><span>Delivery</span><span>At checkout</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: 'var(--text)', paddingTop: 12, borderTop: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', marginTop: 8 }}><span>Total</span><span style={{ color: 'var(--accent)' }}>£{totalPrice}</span></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'color-mix(in srgb, var(--accent) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 10, margin: '16px 0', cursor: 'pointer' }}
              onClick={() => setIsGift(!isGift)}>
              <input type="checkbox" checked={isGift} readOnly style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🎁 Send as a Gift</span>
            </div>

            <button onClick={checkoutButton} disabled={checkoutLoading || items.length === 0} style={{
              width: '100%', padding: 14,
              background: items.length > 0 ? 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black))' : 'rgba(128,128,128,0.2)',
              border: 'none', borderRadius: 'var(--btn-radius, 10px)', color: 'var(--bg)', fontSize: 15, fontWeight: 700,
              cursor: items.length > 0 ? 'pointer' : 'not-allowed'
            }}>
              {checkoutLoading ? <span><i className="fa-solid fa-spinner fa-spin"></i> Processing...</span> : '🔒 Proceed to Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingCart;
