import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function RecentlyViewed() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('mz_recently_viewed') || '[]');
            setItems(saved.slice(0, 6));
        } catch { }
    }, []);

    if (items.length === 0) return null;

    return (
        <section style={{ padding: '60px 40px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <span className="badge-gold">Recently Viewed</span>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text)', marginTop: 8 }}>Continue Where You <span style={{ color: 'var(--accent)' }}>Left Off</span></h2>
                </div>
                <button onClick={() => { localStorage.removeItem('mz_recently_viewed'); setItems([]); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Clear All</button>
            </div>
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
                {items.map((item, i) => (
                    <Link key={i} to={item.link || '/fabrics'} style={{ textDecoration: 'none', flexShrink: 0 }}>
                        <div style={{ width: 160, background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 8%, transparent)', borderRadius: 'var(--card-radius)', padding: 14, textAlign: 'center', transition: 'all 0.2s' }}>
                            <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{item.type}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{item.name}</div>
                            {item.price && <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>£{item.price}</div>}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

// Call this from any page to track a view
export function trackView(item) {
    try {
        const saved = JSON.parse(localStorage.getItem('mz_recently_viewed') || '[]');
        const filtered = saved.filter(s => s.id !== item.id);
        filtered.unshift(item);
        localStorage.setItem('mz_recently_viewed', JSON.stringify(filtered.slice(0, 20)));
    } catch { }
}

export default RecentlyViewed;
