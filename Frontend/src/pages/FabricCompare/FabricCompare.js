import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';

function FabricCompare() {
    const [fabrics, setFabrics] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await apiFetch('/api/v1/fabric');
                const data = await res.json();
                setFabrics(data.fabrics || []);
            } catch { }
            setLoading(false);
        }
        load();
    }, []);

    const toggle = (fab) => {
        if (selected.find(s => s._id === fab._id)) {
            setSelected(selected.filter(s => s._id !== fab._id));
        } else if (selected.length < 3) {
            setSelected([...selected, fab]);
        }
    };

    const COLOR_MAP = { 'navy blue': '#1a237e', 'white': '#f5f5f5', 'light grey': '#b0b0b0', 'beige': '#d4b896', 'cream': '#fffdd0', 'sky blue': '#87ceeb', 'black': '#111', 'burgundy': '#800020', 'dark green': '#013220' };

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '60px 20px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span className="badge-gold">Compare</span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text)', margin: '12px 0' }}>Fabric <span style={{ color: 'var(--accent)' }}>Comparison</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Select up to 3 fabrics to compare side by side</p>
            </div>

            {/* Fabric Selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
                {loading ? <div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" /> :
                    fabrics.map(f => (
                        <button key={f._id} onClick={() => toggle(f)} style={{
                            padding: '8px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                            background: selected.find(s => s._id === f._id) ? 'var(--accent)' : 'var(--bg-card)',
                            color: selected.find(s => s._id === f._id) ? 'var(--bg)' : 'var(--text-secondary)',
                            border: selected.find(s => s._id === f._id) ? 'none' : '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                            fontWeight: selected.find(s => s._id === f._id) ? 700 : 400
                        }}>{f.name} - {f.color}</button>
                    ))
                }
            </div>

            {/* Comparison Table */}
            {selected.length >= 2 && (
                <div style={{ overflowX: 'auto', borderRadius: 'var(--card-radius)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-card)' }}>
                                <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)' }}>Property</th>
                                {selected.map(f => (
                                    <th key={f._id} style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: COLOR_MAP[f.color?.toLowerCase()] || '#888', margin: '0 auto 8px', border: '2px solid rgba(255,255,255,0.1)' }} />
                                        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{f.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.color}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Price per meter', key: 'price', fmt: v => `£${v}` },
                                { label: 'Stock Available', key: 'stock', fmt: v => `${v}m` },
                                { label: 'Material', key: 'name', fmt: v => v },
                                { label: 'Best For', key: 'name', fmt: v => v === 'Cotton' ? 'Business, Casual' : v === 'Linen' ? 'Summer, Casual' : 'Formal, Wedding' },
                                { label: 'Season', key: 'name', fmt: v => v === 'Cotton' ? 'All Year' : v === 'Linen' ? 'Spring/Summer' : 'Autumn/Winter' },
                                { label: 'Wrinkle Resistance', key: 'name', fmt: v => v === 'Cotton' ? '⭐⭐⭐' : v === 'Linen' ? '⭐⭐' : '⭐⭐⭐⭐' },
                                { label: 'Breathability', key: 'name', fmt: v => v === 'Cotton' ? '⭐⭐⭐⭐' : v === 'Linen' ? '⭐⭐⭐⭐⭐' : '⭐⭐' },
                                { label: 'Durability', key: 'name', fmt: v => v === 'Cotton' ? '⭐⭐⭐⭐' : v === 'Linen' ? '⭐⭐⭐' : '⭐⭐⭐⭐⭐' },
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                                    <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{row.label}</td>
                                    {selected.map(f => (
                                        <td key={f._id} style={{ padding: '12px 20px', textAlign: 'center', fontSize: 13, color: 'var(--text)' }}>{row.fmt(f[row.key])}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selected.length < 2 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>
                    Select at least 2 fabrics to compare ({selected.length}/3 selected)
                </div>
            )}
        </div>
    );
}

export default FabricCompare;
