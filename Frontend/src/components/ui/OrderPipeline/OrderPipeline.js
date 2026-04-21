import React from 'react';

const STAGES = [
    { key: 'Pending', label: 'Order Placed', icon: '📋', desc: 'Order received and confirmed' },
    { key: 'Processing', label: 'Tailoring', icon: '✂️', desc: 'Fabric cutting & stitching' },
    { key: 'Shipped', label: 'Shipped', icon: '🚚', desc: 'On the way to you' },
    { key: 'Delivered', label: 'Delivered', icon: '✅', desc: 'At your doorstep' },
];

function OrderPipeline({ status }) {
    const currentIdx = STAGES.findIndex(s => s.key === status);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, width: '100%', padding: '16px 0' }}>
            {STAGES.map((stage, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {/* Connector line */}
                        {i > 0 && (
                            <div style={{
                                position: 'absolute', top: 18, right: '50%', width: '100%', height: 3,
                                background: i <= currentIdx ? 'var(--accent)' : 'rgba(128,128,128,0.15)',
                                zIndex: 0, transition: 'background 0.5s'
                            }} />
                        )}
                        {/* Circle */}
                        <div style={{
                            width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: done ? 'var(--accent)' : 'var(--bg-card)',
                            border: done ? 'none' : '2px solid rgba(128,128,128,0.2)',
                            fontSize: 18, zIndex: 1, transition: 'all 0.3s',
                            boxShadow: active ? '0 0 0 4px color-mix(in srgb, var(--accent) 25%, transparent)' : 'none'
                        }}>
                            {done ? stage.icon : <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{i + 1}</span>}
                        </div>
                        {/* Label */}
                        <div style={{ marginTop: 10, textAlign: 'center' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: done ? 'var(--accent)' : 'var(--text-muted)' }}>{stage.label}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{stage.desc}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default OrderPipeline;
