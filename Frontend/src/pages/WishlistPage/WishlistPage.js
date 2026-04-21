import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, API } from '../../services/api';
import CartAPI from '../../services/CartAPI';

const imgUrl = (p) => !p ? '/default_fabric.jpg' : p.startsWith('http') ? p : `${API}${p}`;

function WishlistPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        async function load() {
            try {
                const res = await apiFetch('/api/v1/extra/wishlist', { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                setItems(data.items || []);
            } catch { }
            setLoading(false);
        }
        load();
    }, [token]);

    const remove = async (id) => {
        await apiFetch(`/api/v1/extra/wishlist/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }).catch(() => {});
        setItems(prev => prev.filter(i => i._id !== id));
    };

    const moveToCart = async (item) => {
        await CartAPI.addToCart(item.productType, item.product?._id);
        await remove(item._id);
        alert('Moved to cart!');
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '60px 20px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span className="badge-gold">Saved Items</span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text)', margin: '12px 0' }}>My <span style={{ color: 'var(--accent)' }}>Wishlist</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" /></div>
            ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>💝</div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>Your wishlist is empty</h3>
                    <p>Browse <Link to="/fabrics" style={{ color: 'var(--accent)' }}>fabrics</Link> or <Link to="/readymade-suit" style={{ color: 'var(--accent)' }}>suits</Link> and save your favorites!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {items.map((item, i) => (
                        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius)', overflow: 'hidden' }}>
                            <div style={{ height: 160, overflow: 'hidden' }}>
                                <img src={imgUrl(item.product?.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: 16 }}>
                                <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1 }}>{item.productType}</div>
                                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15, margin: '4px 0', textTransform: 'capitalize' }}>
                                    {item.productType === 'Suit' ? item.product?.type?.replace('_', ' ') : `${item.product?.name} (${item.product?.color})`}
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>£{item.product?.price}</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => moveToCart(item)} style={{ flex: 1, padding: '8px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>🛒 Add to Cart</button>
                                    <button onClick={() => remove(item._id)} style={{ padding: '8px 12px', background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.2)', borderRadius: 'var(--btn-radius)', color: '#ff6b6b', fontSize: 12, cursor: 'pointer' }}>🗑</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WishlistPage;
