import React, { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../../../services/api';

async function getUserOrders() {
    const token = localStorage.getItem('token'), userId = localStorage.getItem('user_id');
    if (!token || !userId) return null;
    try { const r = await apiFetch(`/api/v1/order/user/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }); const d = await r.json(); return d.orders || []; } catch { return null; }
}
async function getUserCart() {
    const token = localStorage.getItem('token'), userId = localStorage.getItem('user_id');
    if (!token || !userId) return null;
    try { const r = await apiFetch(`/api/v1/cart/user/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }); const d = await r.json(); return d.cartItems || []; } catch { return null; }
}
async function getFabrics() {
    try { const r = await apiFetch('/api/v1/fabric'); const d = await r.json(); return d.fabrics || []; } catch { return []; }
}

async function getSmartResponse(input) {
    const l = input.toLowerCase();
    if (l.match(/order|status|track|deliver|ship|my order|placed/)) {
        const orders = await getUserOrders();
        if (!orders) return "Please log in first to see your orders.";
        if (!orders.length) return "You don't have any orders yet. Design your first suit on the Design page!";
        let msg = `You have ${orders.length} order(s):\n\n`;
        orders.forEach((o, i) => { msg += `${i+1}. ${o.productType === 'Suit' ? (o.product?.type?.replace('_',' ')||'Suit') : (o.product?.name||'Fabric')} — £${o.price} · ${o.status} · ${o.timestamp?.slice(0,10)||''}\n`; });
        return msg;
    }
    if (l.match(/cart|bag|shopping/)) {
        const cart = await getUserCart();
        if (!cart) return "Please log in to view your cart.";
        if (!cart.length) return "Your cart is empty! Visit the Design page to create a suit.";
        let total = 0, msg = `${cart.length} item(s) in cart:\n\n`;
        cart.forEach((item, i) => { const p = item.product?.price||0; total += p; msg += `${i+1}. ${item.productType==='Suit'?(item.product?.type?.replace('_',' ')||'Suit'):(item.product?.name||'Fabric')} — £${p}\n`; });
        return msg + `\nTotal: £${total}`;
    }
    if (l.match(/fabric|material|cotton|linen|velvet|price|cost/)) {
        const fabrics = await getFabrics();
        if (!fabrics.length) return "Couldn't load fabrics. Check the Fabrics page.";
        let msg = `${fabrics.length} fabrics available:\n\n`;
        fabrics.forEach(f => { msg += `🧵 ${f.name} — ${f.color} · £${f.price}/m\n`; });
        return msg + "\nVisit the Design page for live pricing!";
    }
    if (l.match(/measure|size|chest|waist|photo|camera/)) return "For measurements you need Length, Waist, Chest, and Arm Length in cm.\n\nOn the Design page you can:\n1. Upload a photo\n2. Use your camera\n3. Use Smart Size Finder (height + weight)\n\nOur AI estimates measurements automatically!";
    if (l.match(/design|custom|bespoke|make.*suit|create/)) return "How to design your suit:\n\n1. Go to the Design page\n2. Select fabric (Cotton, Linen, Velvet)\n3. Select type (Single, Double, Tuxedo)\n4. Enter measurements\n5. Preview in 3D\n6. Add to Cart\n\nPrice updates live as you select!";
    if (l.match(/gift|send.*someone/)) return "You can gift a suit! 🎁\n\n1. Design your suit\n2. Add to cart\n3. Check 'Send as a Gift' at checkout\n4. Recipient gets notified";
    if (l.match(/pay|stripe|card|checkout/)) return "We use Stripe for secure payments 🔒\n\n• All major cards accepted\n• Payment info never stored\n• Encrypted end-to-end";
    if (l.match(/deliver|how long|time|days|when/)) return "Delivery times:\n\n• Custom suits: 7-14 business days\n• Fabric orders: 3-5 business days\n\nTrack on My Orders page.";
    if (l.match(/theme|color|customiz/)) return "Click the 🎨 button on the left to customize:\n\n• 7 preset themes\n• Custom colors\n• Font options\n• Layout controls";
    if (l.match(/^(hi|hello|hey|good|assalam|salam)/)) return "Hello! Welcome to MZ Tailor 👋\n\nI can help with:\n• 📦 Orders & tracking\n• 🛒 Cart info\n• 🧵 Fabric prices\n• ✂️ Design guide\n• 📸 Measurements\n• 💳 Payments\n\nJust ask!";
    if (l.match(/thank|bye|goodbye/)) return "You're welcome! Have a great day! 👔✨";
    return "I can help with:\n\n• \"Show my orders\"\n• \"What's in my cart?\"\n• \"Show fabrics\"\n• \"How to design?\"\n• \"Delivery time?\"\n• \"How to gift?\"\n\nTry one of these!";
}

function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'bot', text: "Hi! I'm your MZ Tailor assistant 👋\n\nAsk me about orders, cart, fabrics, or anything!", time: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);
    useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

    const send = async () => {
        const t = input.trim();
        if (!t || typing) return;
        setMessages(p => [...p, { from: 'user', text: t, time: new Date() }]);
        setInput('');
        setTyping(true);
        const response = await getSmartResponse(t);
        setTyping(false);
        setMessages(p => [...p, { from: 'bot', text: response, time: new Date() }]);
    };

    const quickSend = (msg) => { setInput(msg); setTimeout(() => { setInput(''); setMessages(p => [...p, { from: 'user', text: msg, time: new Date() }]); setTyping(true); getSmartResponse(msg).then(r => { setTyping(false); setMessages(p => [...p, { from: 'bot', text: r, time: new Date() }]); }); }, 100); };

    const formatTime = (d) => { const dt = new Date(d); return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };

    const quickActions = [
        { label: '📦 Orders', msg: 'Show my orders' },
        { label: '🛒 Cart', msg: "What's in my cart?" },
        { label: '🧵 Fabrics', msg: 'Show fabrics' },
        { label: '✂️ Design', msg: 'How to design?' },
        { label: '📸 Measure', msg: 'How to measure?' },
        { label: '🎁 Gift', msg: 'How to gift?' },
    ];

    return (
        <div style={{ position: 'fixed', bottom: 22, right: 22, zIndex: 1998, fontFamily: 'Inter, sans-serif' }}>
            {open && (
                <div style={{
                    width: 'min(340px, calc(100vw - 32px))',
                    height: 'min(520px, calc(100vh - 32px))',
                    background: 'rgba(12,12,12,0.98)',
                    borderRadius: 24,
                    boxShadow: '0 26px 90px rgba(0,0,0,0.45)',
                    display: 'flex', flexDirection: 'column',
                    marginBottom: 14, overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                    animation: 'chatOpen 0.25s ease',
                    boxSizing: 'border-box'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(201,168,76,0.98), rgba(84,65,34,0.97))',
                        padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>MZ Tailor AI</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.82)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6ee7b7', display: 'inline-block' }}></span>
                                    Expert tailoring assistant
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} style={{
                            background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff',
                            width: 34, height: 34, borderRadius: 12, fontSize: 15, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}>✕</button>
                    </div>

                    {/* Quick Intro */}
                    <div style={{ padding: '12px 16px 8px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ fontSize: 12, color: '#e7e3d7', marginBottom: 8 }}>Ask about orders, fabrics, measurements, or suit design.</div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ padding: '12px 14px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
                        {quickActions.map((q, i) => (
                            <button key={i} onClick={() => quickSend(q.msg)} style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 18, padding: '8px 14px', fontSize: 12,
                                color: '#f9f7ef', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600,
                                transition: 'transform 0.15s ease, background 0.15s ease'
                            }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>{q.label}</button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 10px', background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
                                {msg.from === 'bot' && (
                                    <div style={{ width: 34, height: 34, borderRadius: 12, background: 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginRight: 10, marginTop: 2 }}>🤖</div>
                                )}
                                <div>
                                    <div style={{
                                        maxWidth: 280, padding: '14px 16px',
                                        borderRadius: msg.from === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                                        background: msg.from === 'user'
                                            ? 'linear-gradient(135deg, #c9a84c, #b8953a)'
                                            : 'rgba(255,255,255,0.05)',
                                        color: msg.from === 'user' ? '#111' : '#e7e3d7',
                                        fontSize: 13, lineHeight: 1.7,
                                        border: msg.from === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                        boxShadow: msg.from === 'user' ? '0 10px 24px rgba(201,168,76,0.12)' : 'none'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 4, textAlign: msg.from === 'user' ? 'right' : 'left', paddingLeft: msg.from === 'bot' ? 2 : 0 }}>
                                        {formatTime(msg.time)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {typing && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 12, background: 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '12px 16px', display: 'flex', gap: 6 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a84c', animation: 'bounce 1.4s infinite', animationDelay: '0s' }}></span>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a84c', animation: 'bounce 1.4s infinite', animationDelay: '0.2s' }}></span>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a84c', animation: 'bounce 1.4s infinite', animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', gap: 10, background: 'rgba(11,11,11,0.98)', flexShrink: 0
                    }}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') send(); }}
                            placeholder="Ask me anything..."
                            style={{
                                flex: 1, border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 22, padding: '12px 18px', fontSize: 13, outline: 'none',
                                background: 'rgba(255,255,255,0.02)', color: '#fff',
                                transition: 'box-shadow 0.2s ease'
                            }}
                            onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(201,168,76,0.15)'}
                            onBlur={e => e.target.style.boxShadow = 'none'}
                        />
                        <button onClick={send} disabled={typing || !input.trim()} style={{
                            background: input.trim() ? 'linear-gradient(135deg, #c9a84c, #b8953a)' : 'rgba(255,255,255,0.08)',
                            color: input.trim() ? '#111' : '#ccc',
                            border: 'none', borderRadius: 16, width: 46, height: 46,
                            cursor: input.trim() ? 'pointer' : 'default', fontSize: 18,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            transition: 'transform 0.15s ease'
                        }} onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {!open && (
                <button onClick={() => setOpen(true)} style={{
                    width: 54, height: 54, borderRadius: 18,
                    background: 'linear-gradient(135deg, #c9a84c, #8f7b3d)',
                    color: '#111', border: 'none',
                    fontSize: 22, cursor: 'pointer',
                    boxShadow: '0 14px 28px rgba(0,0,0,0.30)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0
                }}>
                    🤖
                </button>
            )}

            <style>{`
                @keyframes chatOpen { from { opacity:0; transform:translateY(24px) scale(0.96) } to { opacity:1; transform:translateY(0) scale(1) } }
                @keyframes bounce { 0%,80%,100% { transform:translateY(0) } 40% { transform:translateY(-6px) } }
            `}</style>
        </div>
    );
}

export default ChatbotWidget;
