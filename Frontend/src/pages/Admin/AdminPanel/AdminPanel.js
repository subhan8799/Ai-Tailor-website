import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../services/api';

const g = '#c9a84c'; // gold accent

function AdminPanel() {
    const [collections, setCollections] = useState([]);
    const [active, setActive] = useState(null); // null = dashboard
    const [docs, setDocs] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [creating, setCreating] = useState(false);
    const [createData, setCreateData] = useState({});
    const [search, setSearch] = useState('');
    const token = localStorage.getItem('token');
    const h = { 'Authorization': `Bearer ${token}` };

    const loadCollections = useCallback(async () => {
        try {
            const res = await apiFetch('/api/v1/admin/collections', { headers: h });
            const data = await res.json();
            setCollections(data.collections || []);
        } catch { setCollections([]); }
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const loadDocs = useCallback(async (name) => {
        setLoading(true); setEditId(null); setCreating(false); setSearch('');
        try {
            const res = await apiFetch(`/api/v1/admin/collection/${name}`, { headers: h });
            const data = await res.json();
            const d = data.documents || [];
            setDocs(d);
            // Extract all unique field names from all documents
            const allFields = new Set();
            d.forEach(doc => Object.keys(doc).forEach(k => allFields.add(k)));
            const ordered = ['_id', ...Array.from(allFields).filter(k => k !== '_id').sort()];
            setFields(ordered);
        } catch { setDocs([]); setFields([]); }
        setLoading(false);
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        await apiFetch(`/api/v1/admin/collection/${active}/${id}`, { method: 'DELETE', headers: h }).catch(() => {});
        loadDocs(active);
        loadCollections();
    };

    const startEdit = (doc) => {
        setEditId(doc._id);
        const d = { ...doc };
        delete d._id;
        setEditData(d);
    };

    const saveEdit = async () => {
        await apiFetch(`/api/v1/admin/collection/${active}/${editId}`, {
            method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json' },
            body: JSON.stringify(editData)
        }).catch(() => {});
        setEditId(null);
        loadDocs(active);
    };

    const saveCreate = async () => {
        await apiFetch(`/api/v1/admin/collection/${active}`, {
            method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
            body: JSON.stringify(createData)
        }).catch(() => {});
        setCreating(false); setCreateData({});
        loadDocs(active);
        loadCollections();
    };

    useEffect(() => { loadCollections(); }, [loadCollections]);
    useEffect(() => { if (active) loadDocs(active); }, [active, loadDocs]);

    const filtered = search
        ? docs.filter(d => JSON.stringify(d).toLowerCase().includes(search.toLowerCase()))
        : docs;

    const formatVal = (v) => {
        if (v === null || v === undefined) return '—';
        if (typeof v === 'boolean') return v ? '✅ true' : '❌ false';
        if (typeof v === 'object') return JSON.stringify(v).slice(0, 60);
        return String(v).slice(0, 80);
    };

    const totalRecords = collections.reduce((s, c) => s + c.count, 0);

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 68px)', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
            {/* Sidebar */}
            <div style={{ width: 240, background: '#0f0f0f', borderRight: `1px solid ${g}12`, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${g}10` }}>
                    <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 17, color: g, letterSpacing: 1 }}>⚙️ Administration</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>Database Manager</div>
                </div>

                {/* Dashboard */}
                <div onClick={() => setActive(null)} style={{
                    padding: '10px 18px', cursor: 'pointer', fontSize: 13,
                    color: !active ? g : '#666', background: !active ? `${g}10` : 'transparent',
                    borderLeft: !active ? `3px solid ${g}` : '3px solid transparent'
                }}>📊 Dashboard</div>

                <Link to="/admin/orders" style={{
                    display: 'block', padding: '10px 18px', cursor: 'pointer', fontSize: 13,
                    color: '#666', background: 'transparent', textDecoration: 'none',
                    borderLeft: '3px solid transparent'
                }}>📦 Customer Orders</Link>

                <Link to="/admin/chat" style={{
                    display: 'block', padding: '10px 18px', cursor: 'pointer', fontSize: 13,
                    color: '#666', background: 'transparent', textDecoration: 'none',
                    borderLeft: '3px solid transparent'
                }}>💬 Support Chat</Link>

                <div style={{ padding: '10px 18px 6px', fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1.5 }}>Collections</div>

                {collections.map(c => (
                    <div key={c.name} onClick={() => setActive(c.name)} style={{
                        padding: '9px 18px', cursor: 'pointer', fontSize: 13,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        color: active === c.name ? g : '#777',
                        background: active === c.name ? `${g}10` : 'transparent',
                        borderLeft: active === c.name ? `3px solid ${g}` : '3px solid transparent',
                        transition: 'all 0.15s'
                    }}>
                        <span>{c.name}</span>
                        <span style={{ background: `${g}15`, color: g, padding: '1px 8px', borderRadius: 10, fontSize: 10 }}>{c.count}</span>
                    </div>
                ))}

                <div style={{ marginTop: 'auto', padding: '14px 18px', borderTop: `1px solid ${g}08` }}>
                    <Link to="/" style={{ color: '#555', textDecoration: 'none', fontSize: 12 }}>← Back to Site</Link>
                </div>
            </div>

            {/* Main */}
            <div style={{ flex: 1, padding: 28, overflowY: 'auto', overflowX: 'hidden' }}>

                {/* DASHBOARD */}
                {!active && (
                    <div>
                        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', color: '#eee', marginBottom: 6 }}>Dashboard</h1>
                        <p style={{ color: '#555', fontSize: 13, marginBottom: 28 }}>MongoDB Database Overview · {collections.length} collections · {totalRecords} total records</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 14, marginBottom: 32 }}>
                            {collections.map(c => (
                                <div key={c.name} onClick={() => setActive(c.name)} style={{
                                    background: '#141414', border: `1px solid ${g}12`, borderRadius: 12,
                                    padding: '20px 16px', cursor: 'pointer', transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: g, fontFamily: 'Playfair Display,serif' }}>{c.count}</div>
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4, textTransform: 'capitalize' }}>{c.name}</div>
                                </div>
                            ))}
                        </div>

                        <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.1rem', color: '#ccc', marginBottom: 14 }}>Recent Activity</h2>
                        <div style={{ background: '#141414', border: `1px solid ${g}10`, borderRadius: 10, padding: 20, color: '#555', fontSize: 13 }}>
                            Click any collection in the sidebar to view, create, edit, or delete records.
                        </div>
                    </div>
                )}

                {/* COLLECTION VIEW */}
                {active && (
                    <div>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.4rem', color: '#eee', margin: 0, textTransform: 'capitalize' }}>{active}</h1>
                                <span style={{ fontSize: 11, color: '#555' }}>{docs.length} records · {fields.length} fields</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ background: '#1a1a1a', border: `1px solid ${g}15`, borderRadius: 8, padding: '7px 14px', color: '#ccc', fontSize: 12, outline: 'none', width: 200 }} />
                                <button onClick={() => { setCreating(true); setCreateData({}); setEditId(null); }} style={{
                                    padding: '7px 16px', background: g, border: 'none', borderRadius: 8,
                                    color: '#0a0a0a', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap'
                                }}>+ Add Record</button>
                            </div>
                        </div>

                        {/* Create Form */}
                        {creating && (
                            <div style={{ background: '#141414', border: `1px solid ${g}20`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                                <h3 style={{ color: '#ddd', fontSize: 14, marginBottom: 14 }}>Create New Record</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 10 }}>
                                    {fields.filter(f => f !== '_id' && f !== '__v').map(f => (
                                        <div key={f}>
                                            <label style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>{f}</label>
                                            {f === 'image' ? (
                                                <input type="file" accept="image/*" onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    const fd = new FormData();
                                                    fd.append('image', file);
                                                    try {
                                                        const res = await apiFetch('/api/v1/admin/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
                                                        const data = await res.json();
                                                        if (data.path) setCreateData(prev => ({ ...prev, image: data.path }));
                                                    } catch { }
                                                }}
                                                    style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${g}15`, borderRadius: 6, padding: '7px 10px', color: '#ccc', fontSize: 12 }} />
                                            ) : (
                                                <input value={createData[f] || ''} onChange={e => setCreateData({ ...createData, [f]: e.target.value })}
                                                    style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${g}15`, borderRadius: 6, padding: '7px 10px', color: '#ccc', fontSize: 12, outline: 'none' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                                    <button onClick={saveCreate} style={{ padding: '7px 20px', background: g, border: 'none', borderRadius: 6, color: '#0a0a0a', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>💾 Save</button>
                                    <button onClick={() => setCreating(false)} style={{ padding: '7px 20px', background: 'transparent', border: '1px solid #333', borderRadius: 6, color: '#666', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 60 }}>
                                <div className="spinner-border" style={{ color: g, width: 36, height: 36 }} role="status" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>
                                {search ? 'No matching records.' : 'Empty collection.'}
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${g}10` }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: fields.length * 140 }}>
                                    <thead>
                                        <tr style={{ background: '#111' }}>
                                            {fields.map(f => (
                                                <th key={f} style={{
                                                    padding: '10px 12px', fontSize: 10, color: '#555',
                                                    textTransform: 'uppercase', letterSpacing: 1,
                                                    borderBottom: `1px solid ${g}10`, textAlign: 'left',
                                                    whiteSpace: 'nowrap', position: 'sticky', top: 0, background: '#111'
                                                }}>{f}</th>
                                            ))}
                                            <th style={{ padding: '10px 12px', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${g}10`, position: 'sticky', top: 0, background: '#111', whiteSpace: 'nowrap' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((doc, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                {fields.map(f => (
                                                    <td key={f} style={{ padding: '8px 12px', fontSize: 12, color: '#999', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {editId === doc._id && f !== '_id' && f !== '__v' ? (
                                                            f.toLowerCase().includes('image') || f.toLowerCase().includes('photo') ? (
                                                                <div style={{display:'flex', flexDirection:'column', gap:4}}>
                                                                    <input type="file" accept="image/*" onChange={async (e) => {
                                                                        const file = e.target.files[0];
                                                                        if (!file) return;
                                                                        const fd = new FormData();
                                                                        fd.append('image', file);
                                                                        try {
                                                                            const res = await apiFetch('/api/v1/admin/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
                                                                            const data = await res.json();
                                                                            if (data.path) setEditData(prev => ({ ...prev, [f]: data.path }));
                                                                        } catch { }
                                                                    }}
                                                                        style={{ width: '100%', minWidth: 120, background: '#1a1a1a', border: `1px solid ${g}30`, borderRadius: 4, padding: '3px 6px', color: '#ccc', fontSize: 10 }} />
                                                                    {editData[f] && <span style={{fontSize:9, color:'#4ade80'}}>✓ {String(editData[f]).slice(-20)}</span>}
                                                                </div>
                                                            ) : (
                                                                <input value={editData[f] ?? ''} onChange={e => setEditData({ ...editData, [f]: e.target.value })}
                                                                    style={{ width: '100%', minWidth: 80, background: '#1a1a1a', border: `1px solid ${g}30`, borderRadius: 4, padding: '4px 6px', color: '#ddd', fontSize: 11, outline: 'none' }} />
                                                            )
                                                        ) : (
                                                            <span title={String(doc[f] ?? '')} style={f === '_id' ? { fontFamily: 'monospace', fontSize: 10, color: '#555' } : {}}>
                                                                {f === '_id' ? String(doc[f]).slice(-10) : formatVal(doc[f])}
                                                            </span>
                                                        )}
                                                    </td>
                                                ))}
                                                <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                                    {editId === doc._id ? (
                                                        <div style={{ display: 'flex', gap: 4 }}>
                                                            <button onClick={saveEdit} style={{ background: `${g}20`, color: g, border: `1px solid ${g}30`, padding: '3px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>💾 Save</button>
                                                            <button onClick={() => setEditId(null)} style={{ background: 'transparent', color: '#555', border: '1px solid #333', padding: '3px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>✕</button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: 4 }}>
                                                            <button onClick={() => startEdit(doc)} style={{ background: `${g}10`, color: g, border: `1px solid ${g}20`, padding: '3px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>✏️</button>
                                                            <button onClick={() => handleDelete(doc._id)} style={{ background: 'rgba(220,53,69,0.08)', color: '#ff6b6b', border: '1px solid rgba(220,53,69,0.15)', padding: '3px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>🗑</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Field Info */}
                        <div style={{ marginTop: 20, padding: 16, background: '#111', borderRadius: 10, border: `1px solid ${g}08` }}>
                            <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>FIELDS ({fields.length})</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {fields.map(f => (
                                    <span key={f} style={{ background: '#1a1a1a', border: '1px solid #222', padding: '3px 10px', borderRadius: 4, fontSize: 11, color: '#777' }}>{f}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;
