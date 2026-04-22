import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, API } from '../../services/api';
import { useToast } from '../../components/ui/Toast/Toast';

const imgUrl = (p) => !p ? '' : p.startsWith('http') ? p : `${API}${p}`;

function Profile() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', address: '', phone: '' });
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    const toast = useToast();

    useEffect(() => {
        async function load() {
            try {
                const [uRes, oRes] = await Promise.all([
                    apiFetch(`/api/v1/user/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    apiFetch(`/api/v1/order/user/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                ]);
                const uData = await uRes.json();
                const oData = await oRes.json();
                setUser(uData.user);
                setOrders(oData.orders || []);
                setEditData({ name: uData.user.name || '', address: uData.user.address || '', phone: uData.user.phone || '' });
            } catch { }
            setLoading(false);
        }
        load();
    }, [token, userId]);

    const handleImageUpload = async () => {
        if (!imageFile) return;
        const fd = new FormData();
        fd.append('image', imageFile);
        try {
            const res = await fetch(`${API}/api/v1/user/${userId}/image`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setImageFile(null);
                toast('Profile image updated! 📸', 'success');
            } else {
                toast('Failed to update image', 'error');
            }
        } catch {
            toast('Error updating image', 'error');
        }
    };

    const handleSaveInfo = async () => {
        try {
            const res = await fetch(`${API}/api/v1/user/${userId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setEditing(false);
                toast('Profile updated! 💾', 'success');
            } else {
                toast('Failed to update profile', 'error');
            }
        } catch {
            toast('Error updating profile', 'error');
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner-border" style={{ color: 'var(--accent)' }} role="status" /></div>;

    const tabs = [
        { id: 'overview', label: '👤 Overview' },
        { id: 'wardrobe', label: '👔 Wardrobe' },
        { id: 'measurements', label: '📏 Measurements' },
        { id: 'appointments', label: '📅 Appointments' },
    ];

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '40px 20px', maxWidth: 1100, margin: '0 auto' }}>
            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, padding: 28, background: 'var(--bg-card)', borderRadius: 'var(--card-radius)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'color-mix(in srgb, var(--accent) 15%, transparent)', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {user?.image ? <img src={imgUrl(user.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} /> : null}
                        <span style={{ fontSize: 32, color: 'var(--accent)', display: user?.image ? 'none' : 'block' }}>👤</span>
                    </div>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--accent)', color: 'var(--bg)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📷</div>
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--text)', margin: 0 }}>{user?.name || user?.username}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0' }}>{user?.email}</p>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📦 {orders.length} orders</span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📍 {user?.address || 'No address'}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📱 {user?.phone || 'No phone'}</span>
                    </div>
                    <button onClick={() => setEditing(!editing)} style={{ marginTop: 12, padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontSize: 12, cursor: 'pointer' }}>{editing ? 'Cancel Edit' : 'Edit Info'}</button>
                    {imageFile && (
                        <div style={{ marginTop: 12 }}>
                            <button onClick={handleImageUpload} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontSize: 12, cursor: 'pointer' }}>Upload Image</button>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{imageFile.name}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile */}
            {editing && (
                <div style={{ marginBottom: 32, padding: 28, background: 'var(--bg-card)', borderRadius: 'var(--card-radius)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                    <h3 style={{ margin: 0, marginBottom: 16, color: 'var(--text)' }}>Edit Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Name</label>
                            <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Address</label>
                            <input value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Phone</label>
                            <input value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', outline: 'none' }} />
                        </div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                        <button onClick={handleSaveInfo} style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditing(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--btn-radius)', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', paddingBottom: 0 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        padding: '10px 20px', background: 'transparent', border: 'none',
                        borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                        color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}>{t.label}</button>
                ))}
            </div>

            {/* Overview */}
            {tab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    {[
                        { label: 'Total Orders', val: orders.length, icon: '📦' },
                        { label: 'Pending', val: orders.filter(o => o.status === 'Pending').length, icon: '⏳' },
                        { label: 'Delivered', val: orders.filter(o => o.status === 'Delivered').length, icon: '✅' },
                        { label: 'Total Spent', val: `£${orders.reduce((s, o) => s + (o.price || 0), 0)}`, icon: '💰' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius)', padding: 24, textAlign: 'center' }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Wardrobe */}
            {tab === 'wardrobe' && (
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>Your past suit designs — click to reorder</p>
                    {orders.filter(o => o.productType === 'Suit').length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>👔</div>
                            <p>No suits in your wardrobe yet. <Link to="/design" style={{ color: 'var(--accent)' }}>Design your first suit!</Link></p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                            {orders.filter(o => o.productType === 'Suit').map((o, i) => (
                                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius)', overflow: 'hidden' }}>
                                    <div style={{ height: 140, background: 'color-mix(in srgb, var(--accent) 5%, var(--bg))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={imgUrl(o.product?.image) || '/default_fabric.jpg'} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ padding: 16 }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{o.product?.type?.replace('_', ' ') || 'Suit'}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>{o.product?.fabric?.name || ''} · {o.product?.fabric?.color || ''}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>£{o.price}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.timestamp?.slice(0, 10)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Measurements */}
            {tab === 'measurements' && <SavedMeasurements />}

            {/* Appointments */}
            {tab === 'appointments' && <AppointmentBooking />}
        </div>
    );
}

function SavedMeasurements() {
    const [measurements, setMeasurements] = useState(() => {
        try { return JSON.parse(localStorage.getItem('mz_measurements')) || {}; } catch { return {}; }
    });
    const fields = ['chest', 'waist', 'length', 'armLength', 'shoulder', 'neck', 'hip'];
    const toast = useToast();

    const save = () => {
        localStorage.setItem('mz_measurements', JSON.stringify(measurements));
        toast('Measurements saved! 💾', 'success');
    };

    return (
        <div style={{padding: '20px 0'}}>
            {/* Header */}
            <div style={{
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 24,
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#c9a84c',
                    marginBottom: 4
                }}>
                    📏 Your Saved Measurements
                </div>
                <div style={{
                    fontSize: 13,
                    color: '#a09880',
                    lineHeight: 1.4
                }}>
                    Save your body measurements for quick reuse in future orders
                </div>
            </div>

            {/* Measurement Grid */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: 12,
                padding: '20px'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: 24
                }}>
                    {fields.map(f => (
                        <div key={f} style={{
                            background: 'rgba(201,168,76,0.05)',
                            border: '1px solid rgba(201,168,76,0.2)',
                            borderRadius: 8,
                            padding: '12px',
                            position: 'relative'
                        }}>
                            <label style={{
                                position: 'absolute',
                                top: '-8px',
                                left: '12px',
                                background: '#1a1a1a',
                                padding: '0 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#c9a84c',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                            }}>
                                {f === 'chest' && '💪 Chest'}
                                {f === 'waist' && '🎯 Waist'}
                                {f === 'length' && '👕 Length'}
                                {f === 'armLength' && '🦾 Arm Length'}
                                {f === 'shoulder' && '🤷 Shoulder'}
                                {f === 'neck' && '🧣 Neck'}
                                {f === 'hip' && '🦵 Hip'}
                            </label>
                            <input
                                type="number"
                                value={measurements[f] || ''}
                                onChange={e => setMeasurements({ ...measurements, [f]: e.target.value })}
                                placeholder={
                                    f === 'chest' ? '100' :
                                    f === 'waist' ? '85' :
                                    f === 'length' ? '180' :
                                    f === 'armLength' ? '65' :
                                    f === 'shoulder' ? '45' :
                                    f === 'neck' ? '40' :
                                    '95'
                                }
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#f0ead6',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    padding: '8px 0',
                                    textAlign: 'center'
                                }}
                            />
                            <div style={{
                                fontSize: '10px',
                                color: '#a09880',
                                textAlign: 'center',
                                marginTop: '4px'
                            }}>
                                cm
                            </div>
                        </div>
                    ))}
                </div>

                {/* Measurement Tips */}
                <div style={{
                    background: 'rgba(201,168,76,0.05)',
                    border: '1px solid rgba(201,168,76,0.15)',
                    borderRadius: 8,
                    padding: '12px',
                    fontSize: '11px',
                    color: '#a09880',
                    lineHeight: 1.4,
                    marginBottom: 20
                }}>
                    <div style={{fontWeight: 600, color: '#c9a84c', marginBottom: 4}}>
                        💡 Measurement Tips:
                    </div>
                    • Chest: Around fullest part under arms<br/>
                    • Waist: Around natural waistline<br/>
                    • Length: From shoulder to desired suit length<br/>
                    • Arm: From shoulder to wrist<br/>
                    • Shoulder: Across back from shoulder seam to seam<br/>
                    • Neck: Around base of neck<br/>
                    • Hip: Around fullest part of hips
                </div>

                {/* Save Button */}
                <div style={{textAlign: 'center'}}>
                    <button
                        onClick={save}
                        style={{
                            padding: '12px 32px',
                            background: 'linear-gradient(135deg, #c9a84c 0%, #b8953a 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#0d0d0d',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(201,168,76,0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(201,168,76,0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(201,168,76,0.3)';
                        }}
                    >
                        💾 Save Measurements
                    </button>
                </div>
            </div>
        </div>
    );
}

function AppointmentBooking() {
    const [appointments, setAppointments] = useState([]);
    const [form, setForm] = useState({ type: 'virtual', date: '', timeSlot: '', notes: '' });
    const [creating, setCreating] = useState(false);
    const token = localStorage.getItem('token');
    const toast = useToast();

    const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

    const loadAppointments = async () => {
        try {
            const res = await apiFetch('/api/v1/pro/appointments', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setAppointments(data.appointments || []);
        } catch { }
    };

    useEffect(() => { loadAppointments(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    const book = async () => {
        if (!form.date || !form.timeSlot) { toast('Please select date and time', 'warning'); return; }
        try {
            const res = await apiFetch('/api/v1/pro/appointments', {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                toast('🎉 Your appointment is booked!', 'success');
                setCreating(false);
                setForm({ type: 'virtual', date: '', timeSlot: '', notes: '' });
                loadAppointments();
            } else {
                toast('Failed to book appointment', 'error');
            }
        } catch { toast('Booking failed. Try again.', 'error'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Schedule a fitting consultation</p>
                <button onClick={() => setCreating(!creating)} style={{ padding: '8px 18px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>+ Book Appointment</button>
            </div>

            {creating && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--card-radius)', padding: 24, marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, padding: '10px', color: 'var(--text)', fontSize: 13 }}>
                                <option value="virtual">🖥️ Virtual Consultation</option>
                                <option value="physical">🏪 In-Store Visit</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Date</label>
                            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]}
                                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, padding: '10px', color: 'var(--text)', fontSize: 13 }} />
                        </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Time Slot</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {timeSlots.map(t => (
                                <button key={t} onClick={() => setForm({ ...form, timeSlot: t })} style={{
                                    padding: '8px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                                    background: form.timeSlot === t ? 'var(--accent)' : 'var(--bg-input)',
                                    color: form.timeSlot === t ? 'var(--bg)' : 'var(--text-secondary)',
                                    border: form.timeSlot === t ? 'none' : '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                                    fontWeight: form.timeSlot === t ? 700 : 400
                                }}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                        style={{ width: '100%', marginTop: 12, background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, padding: 10, color: 'var(--text)', fontSize: 13, minHeight: 60, resize: 'vertical', outline: 'none' }} />
                    <button onClick={book} style={{ marginTop: 12, padding: '10px 24px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>📅 Confirm Booking</button>
                </div>
            )}

            {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No appointments yet.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {appointments.map((a, i) => (
                        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{a.type === 'virtual' ? '🖥️ Virtual' : '🏪 In-Store'} Consultation</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>📅 {new Date(a.date).toLocaleDateString()} · ⏰ {a.timeSlot}</div>
                            </div>
                            <span style={{
                                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                background: a.status === 'confirmed' ? 'rgba(46,204,113,0.15)' : a.status === 'completed' ? 'rgba(201,168,76,0.15)' : 'rgba(255,193,7,0.15)',
                                color: a.status === 'confirmed' ? '#2ecc71' : a.status === 'completed' ? 'var(--accent)' : '#ffc107',
                                textTransform: 'uppercase'
                            }}>{a.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Profile;
