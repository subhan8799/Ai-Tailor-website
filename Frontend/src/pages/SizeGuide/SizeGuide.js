import React from 'react';
import { Link } from 'react-router-dom';

const CHART = [
    { size: 'XS', chest: '82-87', waist: '68-73', length: '68-70', arm: '58-60' },
    { size: 'S', chest: '88-93', waist: '74-79', length: '70-72', arm: '60-62' },
    { size: 'M', chest: '94-99', waist: '80-85', length: '72-74', arm: '62-64' },
    { size: 'L', chest: '100-105', waist: '86-91', length: '74-76', arm: '64-66' },
    { size: 'XL', chest: '106-111', waist: '92-97', length: '76-78', arm: '66-68' },
    { size: 'XXL', chest: '112-120', waist: '98-108', length: '78-82', arm: '68-72' },
];

const STEPS = [
    { icon: '📏', title: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape level under your arms.' },
    { icon: '📐', title: 'Waist', desc: 'Measure around your natural waistline, keeping the tape comfortably loose.' },
    { icon: '📏', title: 'Length', desc: 'Measure from the base of your neck to where you want the jacket to end.' },
    { icon: '💪', title: 'Arm Length', desc: 'Measure from shoulder point to wrist bone with arm slightly bent.' },
    { icon: '🦴', title: 'Shoulder', desc: 'Measure from one shoulder edge to the other across your back.' },
    { icon: '👔', title: 'Neck', desc: 'Measure around the base of your neck where a collar would sit.' },
];

function SizeGuide() {
    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '60px 20px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <span className="badge-gold">Measurement Guide</span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--text)', margin: '12px 0' }}>Size <span style={{ color: 'var(--accent)' }}>Guide</span></h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Get the perfect fit with our measurement guide</p>
            </div>

            {/* How to Measure */}
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '1.4rem', marginBottom: 20 }}>How to Measure</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 48 }}>
                {STEPS.map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius)', padding: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'color-mix(in srgb, var(--accent) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14, marginBottom: 4 }}>{s.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Size Chart */}
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '1.4rem', marginBottom: 20 }}>Size Chart (cm)</h2>
            <div style={{ overflowX: 'auto', borderRadius: 'var(--card-radius)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', marginBottom: 40 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-card)' }}>
                            {['Size', 'Chest', 'Waist', 'Length', 'Arm Length'].map(h => (
                                <th key={h} style={{ padding: '14px 20px', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {CHART.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                                <td style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>{row.size}</td>
                                <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>{row.chest}</td>
                                <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>{row.waist}</td>
                                <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>{row.length}</td>
                                <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>{row.arm}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: 'var(--card-radius)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', marginBottom: 8 }}>Not sure about your size?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Use our AI-powered measurement tools on the Design page</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/design"><button className="btn-gold">📸 Auto-Measure from Photo</button></Link>
                    <Link to="/style-guide"><button className="btn-outline-gold">🤖 Get Style Recommendation</button></Link>
                </div>
            </div>
        </div>
    );
}

export default SizeGuide;
