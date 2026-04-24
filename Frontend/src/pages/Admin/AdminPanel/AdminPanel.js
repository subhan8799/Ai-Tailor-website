import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast/Toast';

const g = '#c9a84c';
const getId = (doc) => typeof doc._id === 'object' ? doc._id.$oid || doc._id.toString?.() || String(doc._id) : String(doc._id);

function AdminPanel() {
    const [collections, setCollections] = useState([]);
    const [active, setActive] = useState(null);
    const [docs, setDocs] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [creating, setCreating] = useState(false);
    const [createData, setCreateData] = useState({});
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(new Set());
    const [bulkField, setBulkField] = useState('');
    const [bulkValue, setBulkValue] = useState('');
    const [bulkImageFile, setBulkImageFile] = useState(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'
    const [inlineEdits, setInlineEdits] = useState({}); // { docId: { field: value } }
    const token = localStorage.getItem('token');
    const h = { 'Authorization': `Bearer ${token}` };
    const toast = useToast();

    const loadCollections = useCallback(async () => {
        try {
            const res = await apiFetch('/api/v1/admin/collections', { headers: h });
            const data = await res.json();
            setCollections(data.collections || []);
        } catch { setCollections([]); }
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const loadDocs = useCallback(async (name) => {
        setLoading(true); setEditId(null); setCreating(false); setSearch(''); setSelected(new Set()); setPage(1); setInlineEdits({});
        try {
            const res = await apiFetch(`/api/v1/admin/collection/${name}`, { headers: h });
            const data = await res.json();
            const d = data.documents || [];
            setDocs(d);
            const allFields = new Set();
            d.forEach(doc => Object.keys(doc).forEach(k => allFields.add(k)));
            setFields(['_id', ...Array.from(allFields).filter(k => k !== '_id').sort()]);
        } catch { setDocs([]); setFields([]); }
        setLoading(false);
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        const res = await apiFetch(`/api/v1/admin/collection/${active}/${id}`, { method: 'DELETE', headers: h });
        if (res.ok) toast('Deleted ✓', 'success');
        else toast('Delete failed', 'error');
        loadDocs(active); loadCollections();
    };

    const startEdit = (doc) => {
        setEditId(getId(doc));
        const d = {};
        Object.keys(doc).forEach(k => { if (k !== '_id' && k !== '__v') d[k] = typeof doc[k] === 'object' ? JSON.stringify(doc[k]) : doc[k]; });
        setEditData(d);
    };

    const saveEdit = async () => {
        try {
            const res = await apiFetch(`/api/v1/admin/collection/${active}/${editId}`, {
                method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            if (res.ok) toast('Updated ✓', 'success');
            else { const d = await res.json().catch(() => ({})); toast(d.msg || 'Update failed', 'error'); }
        } catch { toast('Update failed', 'error'); }
        setEditId(null);
        loadDocs(active);
    };

    const saveCreate = async () => {
        try {
            const res = await apiFetch(`/api/v1/admin/collection/${active}`, {
                method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
                body: JSON.stringify(createData)
            });
            if (res.ok) toast('Created ✓', 'success');
            else toast('Create failed', 'error');
        } catch { toast('Create failed', 'error'); }
        setCreating(false); setCreateData({});
        loadDocs(active); loadCollections();
    };

    // Upload image helper
    const uploadImage = async (file) => {
        const fd = new FormData();
        fd.append('image', file);
        try {
            const res = await apiFetch('/api/v1/admin/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
            const data = await res.json();
            return data.path || '';
        } catch { return ''; }
    };

    const isImageField = (f) => /image|photo|picture|avatar|img/i.test(f);

    // Bulk update
    const bulkUpdate = async () => {
        if (!bulkField || selected.size === 0) return;
        let val = bulkValue;
        // If bulk image file was selected, upload it first
        if (isImageField(bulkField) && bulkImageFile) {
            toast('Uploading image...', 'info');
            val = await uploadImage(bulkImageFile);
            if (!val) { toast('Image upload failed', 'error'); return; }
        }
        let count = 0;
        for (const id of selected) {
            try {
                const res = await apiFetch(`/api/v1/admin/collection/${active}/${id}`, {
                    method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ [bulkField]: val })
                });
                if (res.ok) count++;
            } catch { }
        }
        toast(`Updated ${count}/${selected.size} records ✓`, 'success');
        setSelected(new Set()); setBulkField(''); setBulkValue(''); setBulkImageFile(null);
        loadDocs(active);
    };

    // Save all inline edits for selected rows
    const saveInlineEdits = async () => {
        let count = 0;
        for (const [id, data] of Object.entries(inlineEdits)) {
            if (!selected.has(id) || Object.keys(data).length === 0) continue;
            try {
                const res = await apiFetch(`/api/v1/admin/collection/${active}/${id}`, {
                    method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (res.ok) count++;
            } catch { }
        }
        toast(`Updated ${count} records ✓`, 'success');
        setInlineEdits({}); setSelected(new Set());
        loadDocs(active);
    };

    // Bulk delete
    const bulkDelete = async () => {
        if (selected.size === 0 || !window.confirm(`Delete ${selected.size} records?`)) return;
        let count = 0;
        for (const id of selected) {
            try {
                const res = await apiFetch(`/api/v1/admin/collection/${active}/${id}`, { method: 'DELETE', headers: h });
                if (res.ok) count++;
            } catch { }
        }
        toast(`Deleted ${count}/${selected.size} records ✓`, 'success');
        setSelected(new Set());
        loadDocs(active); loadCollections();
    };

    const toggleSelect = (id) => {
        setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    };
    const toggleAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map(d => getId(d))));
    };

    useEffect(() => { loadCollections(); }, [loadCollections]);
    useEffect(() => { if (active) loadDocs(active); }, [active, loadDocs]);

    const filtered = search ? docs.filter(d => JSON.stringify(d).toLowerCase().includes(search.toLowerCase())) : docs;
    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const formatVal = (v) => {
        if (v === null || v === undefined) return '—';
        if (typeof v === 'boolean') return v ? '✅' : '❌';
        if (typeof v === 'object') return JSON.stringify(v).slice(0, 50);
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
                <div onClick={() => setActive(null)} style={{ padding: '10px 18px', cursor: 'pointer', fontSize: 13, color: !active ? g : '#666', background: !active ? `${g}10` : 'transparent', borderLeft: !active ? `3px solid ${g}` : '3px solid transparent' }}>📊 Dashboard</div>
                <Link to="/admin/orders" style={{ display: 'block', padding: '10px 18px', fontSize: 13, color: '#666', textDecoration: 'none', borderLeft: '3px solid transparent' }}>📦 Customer Orders</Link>
                <Link to="/admin/chat" style={{ display: 'block', padding: '10px 18px', fontSize: 13, color: '#666', textDecoration: 'none', borderLeft: '3px solid transparent' }}>💬 Support Chat</Link>
                <div style={{ padding: '10px 18px 6px', fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1.5 }}>Collections</div>
                {collections.map(c => (
                    <div key={c.name} onClick={() => setActive(c.name)} style={{ padding: '9px 18px', cursor: 'pointer', fontSize: 13, display: 'flex', justifyContent: 'space-between', color: active === c.name ? g : '#777', background: active === c.name ? `${g}10` : 'transparent', borderLeft: active === c.name ? `3px solid ${g}` : '3px solid transparent' }}>
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
                {!active && (
                    <div>
                        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', color: '#eee', marginBottom: 6 }}>Dashboard</h1>
                        <p style={{ color: '#555', fontSize: 13, marginBottom: 28 }}>{collections.length} collections · {totalRecords} total records</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 14 }}>
                            {collections.map(c => (
                                <div key={c.name} onClick={() => setActive(c.name)} style={{ background: '#141414', border: `1px solid ${g}12`, borderRadius: 12, padding: '20px 16px', cursor: 'pointer', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: g }}>{c.count}</div>
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4, textTransform: 'capitalize' }}>{c.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {active && (
                    <div>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.4rem', color: '#eee', margin: 0, textTransform: 'capitalize' }}>{active}</h1>
                                <span style={{ fontSize: 11, color: '#555' }}>{docs.length} records</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    style={{ background: '#1a1a1a', border: `1px solid ${g}15`, borderRadius: 8, padding: '7px 14px', color: '#ccc', fontSize: 12, outline: 'none', width: 180 }} />
                                <div style={{ display: 'flex', border: `1px solid ${g}15`, borderRadius: 8, overflow: 'hidden' }}>
                                    <button onClick={() => setViewMode('list')} style={{ padding: '7px 10px', background: viewMode === 'list' ? `${g}20` : 'transparent', border: 'none', color: viewMode === 'list' ? g : '#666', fontSize: 13, cursor: 'pointer' }}>☰</button>
                                    <button onClick={() => setViewMode('card')} style={{ padding: '7px 10px', background: viewMode === 'card' ? `${g}20` : 'transparent', border: 'none', color: viewMode === 'card' ? g : '#666', fontSize: 13, cursor: 'pointer' }}>▦</button>
                                </div>
                                <button onClick={() => { setCreating(true); setCreateData({}); setEditId(null); }} style={{ padding: '7px 16px', background: g, border: 'none', borderRadius: 8, color: '#0a0a0a', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>+ Add</button>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selected.size > 0 && (
                            <div style={{ background: '#141414', border: `1px solid ${g}20`, borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12, color: g, fontWeight: 700 }}>{selected.size} selected</span>
                                <select value={bulkField} onChange={e => { setBulkField(e.target.value); setBulkValue(''); setBulkImageFile(null); }}
                                    style={{ background: '#1a1a1a', border: `1px solid ${g}20`, borderRadius: 6, padding: '5px 10px', color: '#ccc', fontSize: 11 }}>
                                    <option value="">— Field —</option>
                                    {fields.filter(f => f !== '_id' && f !== '__v').map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                                {isImageField(bulkField) ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <input type="file" accept="image/*" onChange={e => setBulkImageFile(e.target.files[0])}
                                            style={{ background: '#1a1a1a', border: `1px solid ${g}20`, borderRadius: 6, padding: '4px 8px', color: '#ccc', fontSize: 10, width: 180 }} />
                                        {bulkImageFile && <span style={{ fontSize: 9, color: '#4ade80' }}>✓ {bulkImageFile.name.slice(0, 15)}</span>}
                                    </div>
                                ) : (
                                    <input placeholder="New value" value={bulkValue} onChange={e => setBulkValue(e.target.value)}
                                        style={{ background: '#1a1a1a', border: `1px solid ${g}20`, borderRadius: 6, padding: '5px 10px', color: '#ccc', fontSize: 11, width: 150 }} />
                                )}
                                <button onClick={bulkUpdate} disabled={!bulkField || (isImageField(bulkField) ? !bulkImageFile : !bulkValue)} style={{ padding: '5px 14px', background: bulkField ? g : '#333', border: 'none', borderRadius: 6, color: '#0a0a0a', fontWeight: 700, fontSize: 11, cursor: bulkField ? 'pointer' : 'default' }}>✏️ Same Value</button>
                                <button onClick={saveInlineEdits} style={{ padding: '5px 14px', background: '#2ecc71', border: 'none', borderRadius: 6, color: '#0a0a0a', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>💾 Save Each Row</button>
                                <button onClick={bulkDelete} style={{ padding: '5px 14px', background: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: 6, color: '#ff6b6b', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>🗑 Delete</button>
                                <button onClick={() => setSelected(new Set())} style={{ padding: '5px 10px', background: 'transparent', border: '1px solid #333', borderRadius: 6, color: '#666', fontSize: 11, cursor: 'pointer' }}>✕ Clear</button>
                            </div>
                        )}

                        {/* Create Form */}
                        {creating && (
                            <div style={{ background: '#141414', border: `1px solid ${g}20`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                                <h3 style={{ color: '#ddd', fontSize: 14, marginBottom: 14 }}>Create New Record</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 10 }}>
                                    {fields.filter(f => f !== '_id' && f !== '__v').map(f => (
                                        <div key={f}>
                                            <label style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>{f}</label>
                                            {isImageField(f) ? (
                                                <div>
                                                    <input type="file" accept="image/*" onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;
                                                        const path = await uploadImage(file);
                                                        if (path) { setCreateData(prev => ({ ...prev, [f]: path })); toast('Image uploaded ✓', 'success'); }
                                                        else toast('Upload failed', 'error');
                                                    }}
                                                        style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${g}15`, borderRadius: 6, padding: '7px 10px', color: '#ccc', fontSize: 12 }} />
                                                    {createData[f] && <span style={{ fontSize: 9, color: '#4ade80', marginTop: 4, display: 'block' }}>✓ {String(createData[f]).slice(-25)}</span>}
                                                </div>
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
                            <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner-border" style={{ color: g }} role="status" /></div>
                        ) : filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>{search ? 'No matching records.' : 'Empty collection.'}</div>
                        ) : viewMode === 'list' ? (
                            <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${g}10` }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: fields.length * 130 }}>
                                    <thead>
                                        <tr style={{ background: '#111' }}>
                                            <th style={{ padding: '10px 8px', borderBottom: `1px solid ${g}10`, position: 'sticky', top: 0, background: '#111' }}>
                                                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll}
                                                    style={{ accentColor: g, width: 14, height: 14, cursor: 'pointer' }} />
                                            </th>
                                            {fields.map(f => (
                                                <th key={f} style={{ padding: '10px 10px', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${g}10`, textAlign: 'left', whiteSpace: 'nowrap', position: 'sticky', top: 0, background: '#111' }}>{f}</th>
                                            ))}
                                            <th style={{ padding: '10px 10px', fontSize: 10, color: '#555', textTransform: 'uppercase', borderBottom: `1px solid ${g}10`, position: 'sticky', top: 0, background: '#111' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((doc, i) => {
                                            const docId = getId(doc);
                                            const isEditing = editId === docId;
                                            const isSelected = selected.has(docId);
                                            const rowEdits = inlineEdits[docId] || {};
                                            return (
                                                <tr key={i} style={{ borderBottom: '1px solid #1a1a1a', background: isSelected ? `${g}08` : 'transparent' }}>
                                                    <td style={{ padding: '8px 8px' }}>
                                                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(docId)}
                                                            style={{ accentColor: g, width: 14, height: 14, cursor: 'pointer' }} />
                                                    </td>
                                                    {fields.map(f => (
                                                        <td key={f} style={{ padding: '8px 10px', fontSize: 12, color: '#999', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {isEditing && f !== '_id' && f !== '__v' ? (
                                                                isImageField(f) ? (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                        <input type="file" accept="image/*" onChange={async (e) => {
                                                                            const file = e.target.files[0];
                                                                            if (!file) return;
                                                                            const path = await uploadImage(file);
                                                                            if (path) { setEditData(prev => ({ ...prev, [f]: path })); toast('Image uploaded ✓', 'success'); }
                                                                            else toast('Upload failed', 'error');
                                                                        }}
                                                                            style={{ width: '100%', minWidth: 120, background: '#1a1a1a', border: `1px solid ${g}30`, borderRadius: 4, padding: '3px 6px', color: '#ccc', fontSize: 10 }} />
                                                                        {editData[f] && <span style={{ fontSize: 9, color: '#4ade80' }}>✓ {String(editData[f]).slice(-25)}</span>}
                                                                    </div>
                                                                ) : (
                                                                    <input value={editData[f] ?? ''} onChange={e => setEditData({ ...editData, [f]: e.target.value })}
                                                                        style={{ width: '100%', minWidth: 80, background: '#1a1a1a', border: `1px solid ${g}30`, borderRadius: 4, padding: '4px 6px', color: '#ddd', fontSize: 11, outline: 'none' }} />
                                                                )
                                                            ) : isSelected && f !== '_id' && f !== '__v' ? (
                                                                isImageField(f) ? (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                        <input type="file" accept="image/*" onChange={async (e) => {
                                                                            const file = e.target.files[0];
                                                                            if (!file) return;
                                                                            const path = await uploadImage(file);
                                                                            if (path) { setInlineEdits(prev => ({ ...prev, [docId]: { ...prev[docId], [f]: path } })); toast('✓', 'success'); }
                                                                        }}
                                                                            style={{ width: '100%', minWidth: 100, background: '#1a1a1a', border: `1px solid ${g}20`, borderRadius: 4, padding: '3px 6px', color: '#ccc', fontSize: 10 }} />
                                                                        {rowEdits[f] && <span style={{ fontSize: 9, color: '#4ade80' }}>✓</span>}
                                                                    </div>
                                                                ) : (
                                                                    <input
                                                                        value={rowEdits[f] !== undefined ? rowEdits[f] : (typeof doc[f] === 'object' ? JSON.stringify(doc[f]) : doc[f] ?? '')}
                                                                        onChange={e => setInlineEdits(prev => ({ ...prev, [docId]: { ...prev[docId], [f]: e.target.value } }))}
                                                                        style={{ width: '100%', minWidth: 80, background: '#1a1a1a', border: `1px solid ${g}20`, borderRadius: 4, padding: '4px 6px', color: '#ddd', fontSize: 11, outline: 'none' }} />
                                                                )
                                                            ) : (
                                                                <span title={String(doc[f] ?? '')} style={f === '_id' ? { fontFamily: 'monospace', fontSize: 10, color: '#555' } : {}}>
                                                                    {f === '_id' ? docId.slice(-10) : formatVal(doc[f])}
                                                                </span>
                                                            )}
                                                        </td>
                                                    ))}
                                                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                                                        {isEditing ? (
                                                            <div style={{ display: 'flex', gap: 4 }}>
                                                                <button onClick={saveEdit} style={{ background: `${g}20`, color: g, border: `1px solid ${g}30`, padding: '3px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>💾</button>
                                                                <button onClick={() => setEditId(null)} style={{ background: 'transparent', color: '#555', border: '1px solid #333', padding: '3px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>✕</button>
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', gap: 4 }}>
                                                                <button onClick={() => startEdit(doc)} style={{ background: `${g}10`, color: g, border: `1px solid ${g}20`, padding: '3px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>✏️</button>
                                                                <button onClick={() => handleDelete(docId)} style={{ background: 'rgba(220,53,69,0.08)', color: '#ff6b6b', border: '1px solid rgba(220,53,69,0.15)', padding: '3px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>🗑</button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}

                        {/* Card View */}
                        {!loading && filtered.length > 0 && viewMode === 'card' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                                {paginated.map((doc, i) => {
                                    const docId = getId(doc);
                                    return (
                                        <div key={i} style={{ background: '#141414', border: `1px solid ${g}12`, borderRadius: 12, padding: 16, position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4 }}>
                                                <button onClick={() => startEdit(doc)} style={{ background: `${g}10`, color: g, border: `1px solid ${g}20`, padding: '3px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>✏️</button>
                                                <button onClick={() => handleDelete(docId)} style={{ background: 'rgba(220,53,69,0.08)', color: '#ff6b6b', border: '1px solid rgba(220,53,69,0.15)', padding: '3px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>🗑</button>
                                            </div>
                                            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#444', marginBottom: 8 }}>#{docId.slice(-10)}</div>
                                            {fields.filter(f => f !== '_id' && f !== '__v').slice(0, 6).map(f => (
                                                <div key={f} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1a1a1a', fontSize: 11 }}>
                                                    <span style={{ color: '#555', textTransform: 'uppercase', fontSize: 9, letterSpacing: 0.5 }}>{f}</span>
                                                    <span style={{ color: '#aaa', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatVal(doc[f])}</span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && filtered.length > perPage && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '16px 0', flexWrap: 'wrap' }}>
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    style={{ padding: '6px 12px', background: `${g}10`, border: `1px solid ${g}15`, borderRadius: 8, color: page === 1 ? '#333' : g, fontSize: 12, cursor: page === 1 ? 'default' : 'pointer' }}>← Prev</button>
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let p;
                                    if (totalPages <= 7) p = i + 1;
                                    else if (page <= 4) p = i + 1;
                                    else if (page >= totalPages - 3) p = totalPages - 6 + i;
                                    else p = page - 3 + i;
                                    return (
                                        <button key={p} onClick={() => setPage(p)} style={{
                                            width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                            background: p === page ? g : `${g}08`, color: p === page ? '#0a0a0a' : '#666',
                                            border: p === page ? 'none' : `1px solid ${g}12`
                                        }}>{p}</button>
                                    );
                                })}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    style={{ padding: '6px 12px', background: `${g}10`, border: `1px solid ${g}15`, borderRadius: 8, color: page === totalPages ? '#333' : g, fontSize: 12, cursor: page === totalPages ? 'default' : 'pointer' }}>Next →</button>
                                <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                                    style={{ marginLeft: 8, padding: '5px 8px', background: '#1a1a1a', border: `1px solid ${g}12`, borderRadius: 6, color: '#666', fontSize: 11 }}>
                                    {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
                                </select>
                                <span style={{ fontSize: 11, color: '#555', marginLeft: 8 }}>{filtered.length} total</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;
