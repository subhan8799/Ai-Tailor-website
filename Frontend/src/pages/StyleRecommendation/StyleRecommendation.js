import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../services/api';

const OCCASIONS = ['Business', 'Wedding', 'Casual', 'Formal Event', 'Party'];
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const BODY_TYPES = ['Slim', 'Athletic', 'Regular', 'Plus Size'];

const RECOMMENDATIONS = {
    'Business-Slim': { type: 'single_breast', fabric: 'Cotton', color: 'Navy Blue', desc: 'Classic navy single-breast for a sharp office look' },
    'Business-Athletic': { type: 'double_breast', fabric: 'Cotton', color: 'Navy Blue', desc: 'Double-breast adds structure to athletic builds' },
    'Business-Regular': { type: 'single_breast', fabric: 'Linen', color: 'Light Grey', desc: 'Light grey linen for comfortable all-day wear' },
    'Business-Plus Size': { type: 'single_breast', fabric: 'Cotton', color: 'Navy Blue', desc: 'Single-breast with dark tones for a slimming effect' },
    'Wedding-Slim': { type: 'tuxedo', fabric: 'Velvet', color: 'Black', desc: 'Classic black velvet tuxedo for the big day' },
    'Wedding-Athletic': { type: 'tuxedo', fabric: 'Velvet', color: 'Burgundy', desc: 'Burgundy velvet tuxedo — bold and memorable' },
    'Wedding-Regular': { type: 'double_breast', fabric: 'Velvet', color: 'Dark Green', desc: 'Dark green double-breast for a unique wedding look' },
    'Wedding-Plus Size': { type: 'tuxedo', fabric: 'Velvet', color: 'Black', desc: 'Black tuxedo with velvet for elegant proportions' },
    'Casual-Slim': { type: 'single_breast', fabric: 'Linen', color: 'Beige', desc: 'Relaxed beige linen for weekend vibes' },
    'Casual-Athletic': { type: 'single_breast', fabric: 'Linen', color: 'Sky Blue', desc: 'Sky blue linen — fresh and effortless' },
    'Casual-Regular': { type: 'single_breast', fabric: 'Cotton', color: 'White', desc: 'Clean white cotton for a casual classic' },
    'Casual-Plus Size': { type: 'single_breast', fabric: 'Linen', color: 'Cream', desc: 'Cream linen for a relaxed comfortable fit' },
    'Formal Event-Slim': { type: 'tuxedo', fabric: 'Velvet', color: 'Black', desc: 'Sleek black tuxedo for formal occasions' },
    'Formal Event-Athletic': { type: 'double_breast', fabric: 'Velvet', color: 'Burgundy', desc: 'Burgundy double-breast for a powerful presence' },
    'Formal Event-Regular': { type: 'tuxedo', fabric: 'Velvet', color: 'Dark Green', desc: 'Dark green tuxedo — sophisticated and unique' },
    'Formal Event-Plus Size': { type: 'tuxedo', fabric: 'Velvet', color: 'Black', desc: 'Classic black tuxedo for timeless elegance' },
    'Party-Slim': { type: 'double_breast', fabric: 'Velvet', color: 'Burgundy', desc: 'Stand out with burgundy velvet double-breast' },
    'Party-Athletic': { type: 'double_breast', fabric: 'Velvet', color: 'Dark Green', desc: 'Dark green velvet — party showstopper' },
    'Party-Regular': { type: 'single_breast', fabric: 'Velvet', color: 'Burgundy', desc: 'Burgundy velvet single-breast for a fun night' },
    'Party-Plus Size': { type: 'double_breast', fabric: 'Cotton', color: 'Navy Blue', desc: 'Navy double-breast — stylish and confident' },
};

function StyleRecommendation() {
    const [occasion, setOccasion] = useState('');
    const [bodyType, setBodyType] = useState('');
    const [season, setSeason] = useState('');
    const [result, setResult] = useState(null);
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        async function loadTrending() {
            try {
                const res = await apiFetch('/api/v1/suit');
                const data = await res.json();
                setTrending((data.suits || []).slice(0, 3));
            } catch { }
        }
        loadTrending();
    }, []);

    const getRecommendation = () => {
        const key = `${occasion}-${bodyType}`;
        setResult(RECOMMENDATIONS[key] || { type: 'single_breast', fabric: 'Cotton', color: 'Navy Blue', desc: 'A classic navy cotton suit — perfect for any occasion' });
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '60px 20px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span className="badge-gold">AI Powered</span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text)', margin: '12px 0' }}>Style <span style={{ color: 'var(--accent)' }}>Recommendation</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Tell us about yourself and we'll suggest the perfect suit</p>
            </div>

            {/* Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 32 }}>
                <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Occasion</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {OCCASIONS.map(o => (
                            <button key={o} onClick={() => setOccasion(o)} style={{
                                padding: '10px 14px', borderRadius: 'var(--btn-radius)', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                                background: occasion === o ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg-card)',
                                border: occasion === o ? '1px solid var(--accent)' : '1px solid color-mix(in srgb, var(--accent) 10%, transparent)',
                                color: occasion === o ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: occasion === o ? 600 : 400
                            }}>{o === 'Business' ? '💼' : o === 'Wedding' ? '💒' : o === 'Casual' ? '☀️' : o === 'Formal Event' ? '🎩' : '🎉'} {o}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Body Type</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {BODY_TYPES.map(b => (
                            <button key={b} onClick={() => setBodyType(b)} style={{
                                padding: '10px 14px', borderRadius: 'var(--btn-radius)', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                                background: bodyType === b ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg-card)',
                                border: bodyType === b ? '1px solid var(--accent)' : '1px solid color-mix(in srgb, var(--accent) 10%, transparent)',
                                color: bodyType === b ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: bodyType === b ? 600 : 400
                            }}>{b}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Season</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {SEASONS.map(s => (
                            <button key={s} onClick={() => setSeason(s)} style={{
                                padding: '10px 14px', borderRadius: 'var(--btn-radius)', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                                background: season === s ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg-card)',
                                border: season === s ? '1px solid var(--accent)' : '1px solid color-mix(in srgb, var(--accent) 10%, transparent)',
                                color: season === s ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: season === s ? 600 : 400
                            }}>{s === 'Spring' ? '🌸' : s === 'Summer' ? '☀️' : s === 'Autumn' ? '🍂' : '❄️'} {s}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <button onClick={getRecommendation} disabled={!occasion || !bodyType} style={{
                    padding: '14px 40px', background: occasion && bodyType ? 'var(--accent)' : 'rgba(128,128,128,0.2)',
                    border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontWeight: 700, fontSize: 15, cursor: occasion && bodyType ? 'pointer' : 'not-allowed'
                }}>🤖 Get My Recommendation</button>
            </div>

            {/* Result */}
            {result && (
                <div style={{ background: 'var(--bg-card)', border: '2px solid var(--accent)', borderRadius: 'var(--card-radius)', padding: 32, textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>✨ Our Recommendation</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text)', margin: '8px 0' }}>
                        {result.color} {result.fabric} {result.type.replace('_', ' ')}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{result.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                        <Link to="/design"><button className="btn-gold">✂️ Design This Suit</button></Link>
                        <Link to="/fabrics"><button className="btn-outline-gold">Browse Fabrics</button></Link>
                    </div>
                </div>
            )}

            {/* Trending */}
            {trending.length > 0 && (
                <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '1.2rem', marginBottom: 16 }}>🔥 Trending Suits</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                        {trending.map((s, i) => (
                            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius)', padding: 16, textAlign: 'center' }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{s.type?.replace('_', ' ')}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>{s.fabric?.name || 'N/A'}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>£{s.price}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StyleRecommendation;
