import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch, API } from '../../services/api';
import { useToast } from '../../components/ui/Toast/Toast';
import CartAPI from '../../services/CartAPI';

const imgUrl = (p) => !p ? '/default_fabric.jpg' : p.startsWith('http') ? p : `${API}${p}`;

function CartEdit() {
    const [searchParams] = useSearchParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const toast = useToast();
    const cartId = searchParams.get('id');
    const token = localStorage.getItem('token');

    useEffect(() => {
        async function load() {
            if (!cartId) { setLoading(false); return; }
            try {
                const userId = localStorage.getItem('user_id');
                const res = await apiFetch(`/api/v1/cart/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                const found = data.cartItems?.find(i => i._id === cartId);
                setItem(found || null);
            } catch { }
            setLoading(false);
        }
        load();
    }, [cartId, token]);

    const handleRemoveAndRedesign = async () => {
        if (item) {
            await CartAPI.deleteFromCart(item._id);
            toast('Old item removed. Redirecting to redesign...', 'info');
        }
        navigate(item?.productType === 'Suit' ? '/design' : '/fabrics');
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" /></div>;
    if (!item) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Item not found. <button onClick={() => navigate('/add-to-cart')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Back to Cart</button></div>;

    const p = item.product;
    const isSuit = item.productType === 'Suit';

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '40px 20px', maxWidth: 700, margin: '0 auto' }}>
            <button onClick={() => navigate('/add-to-cart')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>← Back to Cart</button>

            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '1.8rem', marginBottom: 24 }}>Update Cart Item</h1>

            <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--card-radius)', overflow: 'hidden' }}>
                {/* Product Image */}
                <div style={{ height: 200, overflow: 'hidden' }}>
                    <img src={imgUrl(p?.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ padding: 24 }}>
                    <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{item.productType}</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '1.4rem', margin: '0 0 16px', textTransform: 'capitalize' }}>
                        {isSuit ? `${p?.type?.replace('_', ' ')} Suit` : `${p?.name} (${p?.color})`}
                    </h2>

                    {/* Current Details */}
                    <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                        <div style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Current Details</div>

                        {isSuit ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {[
                                    { label: 'Type', val: p?.type?.replace('_', ' ') },
                                    { label: 'Price', val: `£${p?.price}` },
                                    { label: 'Length', val: `${p?.length}cm` },
                                    { label: 'Waist', val: `${p?.waist}cm` },
                                    { label: 'Chest', val: `${p?.chest}cm` },
                                    { label: 'Arm Length', val: `${p?.arm_length}cm` },
                                ].map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid color-mix(in srgb, var(--accent) 6%, transparent)' }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{d.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{d.val}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {[
                                    { label: 'Material', val: p?.name },
                                    { label: 'Color', val: p?.color },
                                    { label: 'Price', val: `£${p?.price}/m` },
                                    { label: 'Stock', val: `${p?.stock}m` },
                                ].map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid color-mix(in srgb, var(--accent) 6%, transparent)' }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{d.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{d.val}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action */}
                    <div style={{ background: 'color-mix(in srgb, var(--accent) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                            {isSuit
                                ? 'To change measurements, fabric, or suit type — remove this item and create a new design.'
                                : 'To change fabric type or color — remove this item and select a new fabric.'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={handleRemoveAndRedesign} style={{
                            flex: 1, padding: 14,
                            background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black))',
                            border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)',
                            fontWeight: 700, fontSize: 14, cursor: 'pointer'
                        }}>{isSuit ? '✂️ Remove & Redesign Suit' : '🧵 Remove & Choose New Fabric'}</button>

                        <button onClick={() => navigate('/add-to-cart')} style={{
                            padding: '14px 20px', background: 'transparent',
                            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                            borderRadius: 'var(--btn-radius)', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer'
                        }}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartEdit;
