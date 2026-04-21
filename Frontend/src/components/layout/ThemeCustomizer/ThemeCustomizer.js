import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';

const FONTS = ['Playfair Display', 'Inter', 'Georgia', 'Roboto', 'Poppins', 'Lora', 'Montserrat', 'Raleway'];

const ColorInput = ({ label, value, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={value} onChange={e => onChange(e.target.value)}
                style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)', width: 60 }}>{value}</span>
        </div>
    </div>
);

const SliderInput = ({ label, value, onChange, min = 0, max = 30 }) => (
    <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontSize: 11, color: 'var(--accent)' }}>{value}px</span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
    </div>
);

const SelectInput = ({ label, value, options, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <select value={value} onChange={e => onChange(e.target.value)}
            style={{ background: 'var(--bg-input)', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 6, padding: '4px 8px', color: 'var(--text)', fontSize: 11, outline: 'none' }}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

function ThemeCustomizer() {
    const { theme, applyPreset, updateField, resetTheme, PRESETS } = useTheme();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('presets');

    const tabs = [
        { id: 'presets', label: '🎨 Presets' },
        { id: 'colors', label: '🖌️ Colors' },
        { id: 'nav', label: '📱 Navbar' },
        { id: 'typography', label: '🔤 Fonts' },
        { id: 'layout', label: '📐 Layout' },
    ];

    return (
        <>
            {/* Toggle Button */}
            <button onClick={() => setOpen(!open)} style={{
                position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)',
                background: 'var(--accent)', color: 'var(--bg)', border: 'none',
                padding: '12px 6px', borderRadius: '0 10px 10px 0', cursor: 'pointer',
                fontSize: 16, zIndex: 1998, boxShadow: '2px 0 12px rgba(0,0,0,0.3)',
                writingMode: open ? 'horizontal-tb' : 'vertical-rl'
            }}>
                {open ? '✕' : '🎨'}
            </button>

            {/* Panel */}
            <div style={{
                position: 'fixed', left: open ? 0 : -340, top: 0, width: 320, height: '100vh',
                background: 'var(--bg-card)', borderRight: '1px solid rgba(128,128,128,0.15)',
                zIndex: 1999, transition: 'left 0.3s ease', overflowY: 'auto',
                boxShadow: open ? '8px 0 32px rgba(0,0,0,0.5)' : 'none'
            }}>
                {/* Header */}
                <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(128,128,128,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, color: 'var(--text)', fontWeight: 700 }}>🎨 Customize Theme</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Current: {theme.name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={resetTheme} style={{
                            background: 'rgba(220,53,69,0.1)', color: '#ff6b6b', border: '1px solid rgba(220,53,69,0.2)',
                            padding: '4px 10px', borderRadius: 6, fontSize: 10, cursor: 'pointer'
                        }}>Reset</button>
                        <button onClick={() => setOpen(false)} style={{
                            background: 'rgba(128,128,128,0.1)', color: 'var(--text-muted)', border: '1px solid rgba(128,128,128,0.2)',
                            width: 28, height: 28, borderRadius: 8, fontSize: 16, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>✕</button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(128,128,128,0.1)', overflowX: 'auto' }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            flex: 1, padding: '10px 4px', background: tab === t.id ? 'rgba(128,128,128,0.08)' : 'transparent',
                            border: 'none', borderBottom: tab === t.id ? `2px solid var(--accent)` : '2px solid transparent',
                            color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                            fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap'
                        }}>{t.label}</button>
                    ))}
                </div>

                <div style={{ padding: 16 }}>
                    {/* Presets */}
                    {tab === 'presets' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {Object.entries(PRESETS).map(([name, p]) => (
                                <div key={name} onClick={() => applyPreset(name)} style={{
                                    background: p.bgCard, border: theme.name === name ? `2px solid ${p.accent}` : '1px solid rgba(128,128,128,0.15)',
                                    borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                                        {[p.accent, p.bg, p.text].map((c, i) => (
                                            <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: '1px solid rgba(128,128,128,0.2)' }} />
                                        ))}
                                    </div>
                                    <div style={{ color: p.text, fontSize: 12, fontWeight: 600 }}>{name}</div>
                                    {theme.name === name && <div style={{ color: p.accent, fontSize: 10, marginTop: 4 }}>✓ Active</div>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Colors */}
                    {tab === 'colors' && <>
                        <ColorInput label="Accent Color" value={theme.accent} onChange={v => updateField('accent', v)} />
                        <ColorInput label="Accent Light" value={theme.accentLight} onChange={v => updateField('accentLight', v)} />
                        <ColorInput label="Background" value={theme.bg} onChange={v => updateField('bg', v)} />
                        <ColorInput label="Card Background" value={theme.bgCard} onChange={v => updateField('bgCard', v)} />
                        <ColorInput label="Input Background" value={theme.bgInput} onChange={v => updateField('bgInput', v)} />
                        <ColorInput label="Text Primary" value={theme.text} onChange={v => updateField('text', v)} />
                        <ColorInput label="Text Secondary" value={theme.textSecondary} onChange={v => updateField('textSecondary', v)} />
                        <ColorInput label="Text Muted" value={theme.textMuted} onChange={v => updateField('textMuted', v)} />
                        <ColorInput label="Footer Background" value={theme.footerBg} onChange={v => updateField('footerBg', v)} />
                    </>}

                    {/* Navbar */}
                    {tab === 'nav' && <>
                        <ColorInput label="Navbar Background" value={theme.navBg.startsWith('rgba') ? '#0d0d0d' : theme.navBg} onChange={v => updateField('navBg', v)} />
                        <ColorInput label="Navbar Text" value={theme.navText} onChange={v => updateField('navText', v)} />
                        <ColorInput label="Accent (Links/Buttons)" value={theme.accent} onChange={v => updateField('accent', v)} />
                        <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8, border: '1px solid rgba(128,128,128,0.1)' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Preview</div>
                            <div style={{ background: theme.navBg, padding: '10px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: theme.accent, fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700 }}>MZ Tailor</span>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {['Home', 'Design', 'Fabrics'].map(l => (
                                        <span key={l} style={{ color: theme.navText, fontSize: 11 }}>{l}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>}

                    {/* Typography */}
                    {tab === 'typography' && <>
                        <SelectInput label="Heading Font" value={theme.fontHeading} options={FONTS} onChange={v => updateField('fontHeading', v)} />
                        <SelectInput label="Body Font" value={theme.fontBody} options={FONTS} onChange={v => updateField('fontBody', v)} />
                        <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8, border: '1px solid rgba(128,128,128,0.1)' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Preview</div>
                            <h3 style={{ fontFamily: theme.fontHeading + ', serif', color: 'var(--text)', fontSize: 20, marginBottom: 6 }}>Heading Text</h3>
                            <p style={{ fontFamily: theme.fontBody + ', sans-serif', color: 'var(--text-secondary)', fontSize: 13 }}>Body text looks like this with {theme.fontBody} font.</p>
                        </div>
                    </>}

                    {/* Layout */}
                    {tab === 'layout' && <>
                        <SliderInput label="Button Radius" value={theme.btnRadius} onChange={v => updateField('btnRadius', v)} />
                        <SliderInput label="Card Radius" value={theme.cardRadius} onChange={v => updateField('cardRadius', v)} max={40} />
                        <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8, border: '1px solid rgba(128,128,128,0.1)' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Preview</div>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(128,128,128,0.15)', borderRadius: theme.cardRadius + 'px', padding: 16, marginBottom: 10 }}>
                                <div style={{ color: 'var(--text)', fontSize: 13, marginBottom: 10 }}>Card with {theme.cardRadius}px radius</div>
                                <button style={{ background: 'var(--accent)', color: 'var(--bg)', border: 'none', padding: '8px 20px', borderRadius: theme.btnRadius + 'px', fontSize: 12, fontWeight: 600 }}>Button ({theme.btnRadius}px)</button>
                            </div>
                        </div>
                    </>}
                </div>
            </div>
        </>
    );
}

export default ThemeCustomizer;
