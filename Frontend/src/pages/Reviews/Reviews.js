import React, { useEffect, useState } from 'react';
import { apiFetch, API } from '../../services/api';

const imgUrl = (p) => !p ? '' : p.startsWith('http') ? p : `${API}${p}`;
const Stars = ({ count }) => <span style={{ color: 'var(--accent)', letterSpacing: 2 }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ rating: 5, fabricRating: 5, fitRating: 5, stitchingRating: 5, comment: '' });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;

    useEffect(() => {
        async function load() {
            try {
                const res = await apiFetch('/api/v1/pro/reviews');
                const data = await res.json();
                setReviews(data.reviews || []);
            } catch { }
            setLoading(false);
        }
        load();
    }, []);

    const submit = async () => {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        images.forEach(f => fd.append('images', f));
        await apiFetch('/api/v1/pro/reviews', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
        setShowForm(false);
        window.location.reload();
    };

    const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '60px 40px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span className="badge-gold">Customer Reviews</span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text)', margin: '12px 0 8px' }}>What Our Customers <span style={{ color: 'var(--accent)' }}>Say</span></h1>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
                    <div><span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{avgRating}</span><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>/5</span></div>
                    <div><span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{reviews.length}</span><span style={{ color: 'var(--text-muted)', fontSize: 13 }}> reviews</span></div>
                </div>
            </div>

            {isLoggedIn && (
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 28px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>✍️ Write a Review</button>
                </div>
            )}

            {showForm && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--card-radius)', padding: 28, marginBottom: 32 }}>
                    <h3 style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)', marginBottom: 20 }}>Your Review</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        {[['rating', 'Overall'], ['fabricRating', 'Fabric Quality'], ['fitRating', 'Fitting'], ['stitchingRating', 'Stitching']].map(([key, label]) => (
                            <div key={key}>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} onClick={() => setForm({ ...form, [key]: n })} style={{
                                            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
                                            color: n <= form[key] ? 'var(--accent)' : 'var(--text-muted)'
                                        }}>★</button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <textarea placeholder="Share your experience..." value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                        style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 10, padding: 14, color: 'var(--text)', fontSize: 13, minHeight: 80, resize: 'vertical', outline: 'none', marginBottom: 12 }} />
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Upload Photos</label>
                        <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files))} className="form-control"
                            style={{ background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12 }} />
                    </div>
                    <button onClick={submit} style={{ padding: '10px 24px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Submit Review</button>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" /></div>
            ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No reviews yet. Be the first!</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {reviews.map((r, i) => (
                        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 8%, transparent)', borderRadius: 'var(--card-radius)', padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'color-mix(in srgb, var(--accent) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: 14 }}>
                                        {r.user?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{r.user?.username || 'Anonymous'}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(r.timestamp).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <Stars count={r.rating} />
                            </div>
                            {r.comment && <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{r.comment}</p>}
                            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', marginBottom: r.images?.length ? 12 : 0 }}>
                                <span>Fabric: <Stars count={r.fabricRating || 0} /></span>
                                <span>Fit: <Stars count={r.fitRating || 0} /></span>
                                <span>Stitching: <Stars count={r.stitchingRating || 0} /></span>
                            </div>
                            {r.images?.length > 0 && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {r.images.map((img, j) => (
                                        <img key={j} src={imgUrl(img)} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Reviews;
