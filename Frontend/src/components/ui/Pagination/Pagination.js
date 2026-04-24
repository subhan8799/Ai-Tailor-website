import React from 'react';

function Pagination({ current, total, perPage, onChange, onPerPageChange }) {
    const totalPages = Math.ceil(total / perPage);
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '16px 0', flexWrap: 'wrap' }}>
            <button onClick={() => onChange(current - 1)} disabled={current === 1}
                style={{ padding: '6px 12px', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, color: current === 1 ? 'var(--text-muted)' : 'var(--accent)', fontSize: 12, cursor: current === 1 ? 'default' : 'pointer' }}>← Prev</button>

            {pages.map((p, i) => (
                p === '...' ? <span key={i} style={{ color: 'var(--text-muted)', fontSize: 12, padding: '0 4px' }}>…</span> :
                <button key={i} onClick={() => onChange(p)} style={{
                    width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: p === current ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 6%, transparent)',
                    color: p === current ? 'var(--bg, #0d0d0d)' : 'var(--text-muted)',
                    border: p === current ? 'none' : '1px solid color-mix(in srgb, var(--accent) 12%, transparent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{p}</button>
            ))}

            <button onClick={() => onChange(current + 1)} disabled={current === totalPages}
                style={{ padding: '6px 12px', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, color: current === totalPages ? 'var(--text-muted)' : 'var(--accent)', fontSize: 12, cursor: current === totalPages ? 'default' : 'pointer' }}>Next →</button>

            {onPerPageChange && (
                <select value={perPage} onChange={e => onPerPageChange(Number(e.target.value))}
                    style={{ marginLeft: 12, padding: '5px 8px', background: 'color-mix(in srgb, var(--accent) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 12%, transparent)', borderRadius: 6, color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
                    {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
                </select>
            )}

            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{total} total</span>
        </div>
    );
}

export default Pagination;
