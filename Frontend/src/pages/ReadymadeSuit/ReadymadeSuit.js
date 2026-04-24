import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SuitAPI from '../../services/SuitAPI';
import CartAPI from '../../services/CartAPI';
import * as ProductTypes from '../../constants/ProductTypes';
import { API, apiFetch } from '../../services/api';
import { useToast } from '../../components/ui/Toast/Toast';
import { getDisplayImage } from '../../utils/helpers';

const imgUrl = (p) => !p || p === '/uploads/undefined' ? '' : p.startsWith('http') ? p : `${API}${p}`;

function ReadymadeSuit() {
    const [allSuit, setAllSuit] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 12;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const get = async () => {
            const data = await SuitAPI.getAllSuit();
            setAllSuit(data?.suits || []);
            setLoading(false);
        };
        get();
        const q = searchParams.get('search');
        if (q) setSearchQuery(q);
    }, [searchParams]);

    const filtered = allSuit.filter(s => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return s.type?.toLowerCase().includes(q) || s.fabric?.name?.toLowerCase().includes(q) || s.fabric?.color?.toLowerCase().includes(q);
    });
    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const handleCart = async (id) => {
        if (!token) { toast('Please login first', 'warning'); navigate('/login'); return; }
        const res = await CartAPI.addToCart(ProductTypes.SUIT, id);
        if (res) { toast('Suit added to cart!', 'success'); navigate("/add-to-cart"); }
        else toast('Failed to add to cart', 'error');
    };

    const handleWishlist = async (suit) => {
        if (!token) { toast('Please login to save to wishlist', 'warning'); navigate('/login'); return; }
        try {
            const res = await apiFetch('/api/v1/extra/wishlist', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_type: 'Suit', product_id: suit._id })
            });
            const data = await res.json();
            if (res.ok) toast('Added to wishlist! 💝', 'success');
            else toast(data.msg || 'Already in wishlist', 'info');
        } catch { toast('Failed to add to wishlist', 'error'); }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '60px 40px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <span className="badge-gold">Collection</span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--text)', margin: '12px 0 8px' }}>
                    Ready-Made <span style={{ color: 'var(--accent)' }}>Suits</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Expertly crafted suits ready for immediate order</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 400, margin: '20px auto 0' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by type, fabric, color..."
                        style={{ flex: 1, background: 'color-mix(in srgb, var(--accent) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 20, padding: '8px 16px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                    {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                    <div className="spinner-border" style={{ color: 'var(--accent)', width: 48, height: 48 }} role="status" />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>{searchQuery ? `No suits matching "${searchQuery}"` : 'No suits available yet.'}</div>
            ) : (<>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                    {paginated.map((suit, i) => (
                        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius)', overflow: 'hidden', position: 'relative' }}>
                            {/* Wishlist Icon */}
                            <button onClick={() => handleWishlist(suit)} title="Add to Wishlist" style={{
                                position: 'absolute', top: 12, right: 12, zIndex: 2,
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                                color: '#ff6b9d', fontSize: 16, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(4px)', transition: 'all 0.2s'
                            }}>♥</button>

                            <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--accent) 5%, var(--bg))' }}>
                                <img src={getDisplayImage(suit.image, 'Suit', suit.type)} alt={suit.type} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ padding: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text)', margin: 0, textTransform: 'capitalize' }}>
                                        {suit.type?.replace('_', ' ')}
                                    </h3>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)' }}>£{suit.price}</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                    Fabric: {suit.fabric?.name || 'N/A'} · {suit.fabric?.color || 'N/A'}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                                    <span>Length: {suit.length}cm</span><span>Waist: {suit.waist}cm</span>
                                    <span>Chest: {suit.chest}cm</span><span>Arm: {suit.arm_length}cm</span>
                                </div>
                                <button onClick={() => handleCart(suit._id)} style={{
                                    width: '100%', padding: 12,
                                    background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black))',
                                    border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)',
                                    fontWeight: 700, fontSize: 13, cursor: 'pointer'
                                }}>🛒 Add to Cart</button>
                            </div>
                        </div>
                    ))}
                </div>
                {filtered.length > perPage && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '20px 0' }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            style={{ padding: '6px 12px', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, color: page === 1 ? 'var(--text-muted)' : 'var(--accent)', fontSize: 12, cursor: page === 1 ? 'default' : 'pointer' }}>← Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: p === page ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 6%, transparent)', color: p === page ? 'var(--bg)' : 'var(--text-muted)', border: p === page ? 'none' : '1px solid color-mix(in srgb, var(--accent) 12%, transparent)' }}>{p}</button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            style={{ padding: '6px 12px', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, color: page === totalPages ? 'var(--text-muted)' : 'var(--accent)', fontSize: 12, cursor: page === totalPages ? 'default' : 'pointer' }}>Next →</button>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{filtered.length} suits</span>
                    </div>
                )}
            </>)}
        </div>
    );
}

export default ReadymadeSuit;
