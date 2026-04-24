import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, API } from '../../../services/api';
import { getDisplayImage } from '../../../utils/helpers';

function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    const timer = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const search = (q) => {
        setQuery(q);
        if (q.length < 2) { setResults([]); setOpen(false); return; }
        clearTimeout(timer.current);
        timer.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await apiFetch(`/api/v1/extra/search?q=${encodeURIComponent(q)}`);
                const data = await res.json();
                setResults(data.results || []);
                setOpen(true);
            } catch { setResults([]); }
            setLoading(false);
        }, 300);
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'color-mix(in srgb, var(--accent) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 20, padding: '0 14px', height: 34 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13, marginRight: 6 }}>🔍</span>
                <input value={query} onChange={e => search(e.target.value)} placeholder="Search fabrics, suits..."
                    onFocus={() => results.length > 0 && setOpen(true)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, width: 140 }} />
            </div>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: -40, minWidth: 320,
                    background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                    borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 9999, overflow: 'hidden', maxHeight: 400, overflowY: 'auto'
                }}>
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(128,128,128,0.1)', fontSize: 11, color: 'var(--text-muted)' }}>
                        {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
                    </div>
                    {!loading && results.length === 0 && (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No results found</div>
                    )}
                    {results.map((r, i) => (
                        <div key={i} onClick={() => { navigate(r.link); setOpen(false); setQuery(''); }}
                            style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(128,128,128,0.05)', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 6%, transparent)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {r.image && (
                                <img src={getDisplayImage(r.image, r.type, r.name)} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(128,128,128,0.1)' }} />
                            )}
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1 }}>{r.type}</span>
                                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, textTransform: 'capitalize' }}>{r.name}</div>
                            </div>
                            {r.price && <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>£{r.price}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GlobalSearch;
