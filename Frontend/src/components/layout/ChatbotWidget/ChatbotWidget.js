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
    try { const r = await apiFetch(`/api/v1/cart/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }); const d = await r.json(); return d.cartItems || []; } catch { return null; }
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
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1998 }}>
            {open && (
                <div style={{
                    width: 370, height: 560,
                    background: 'var(--bg, #0d0d0d)',
                    borderRadius: 24,
                    boxShadow: '0 16px 60px rgba(0,0,0,0.5), 0 0 0 1px color-mix(in srgb, var(--accent) 15%, transparent)',
                    display: 'flex', flexDirection: 'column',
                    marginBottom: 12, overflow: 'hidden',
                    animation: 'chatOpen 0.3s ease'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, var(--accent, #c9a84c), color-mix(in srgb, var(--accent) 70%, black))',
                        padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>MZ Tailor AI</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                                    Online now
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} style={{
                            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                            width: 32, height: 32, borderRadius: 10, fontSize: 18, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(4px)', transition: 'background 0.2s'
                        }}>✕</button>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ padding: '10px 14px', display: 'flex', gap: 6, overflowX: 'auto', borderBottom: '1px solid color-mix(in srgb, var(--accent) 8%, transparent)', flexShrink: 0 }}>
                        {quickActions.map((q, i) => (
                            <button key={i} onClick={() => quickSend(q.msg)} style={{
                                background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                                borderRadius: 20, padding: '5px 12px', fontSize: 11,
                                color: 'var(--accent)', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500,
                                transition: 'all 0.2s'
                            }}>{q.label}</button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                                {msg.from === 'bot' && (
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'color-mix(in srgb, var(--accent) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 2 }}>🤖</div>
                                )}
                                <div>
                                    <div style={{
                                        maxWidth: 260, padding: '10px 14px',
                                        borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: msg.from === 'user'
                                            ? 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 80%, black))'
                                            : 'var(--bg-card, #1a1a1a)',
                                        color: msg.from === 'user' ? '#fff' : 'var(--text-secondary, #a09880)',
                                        fontSize: 13, lineHeight: 1.6,
                                        border: msg.from === 'bot' ? '1px solid color-mix(in srgb, var(--accent) 8%, transparent)' : 'none',
                                        whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--text-muted, #555)', marginTop: 3, textAlign: msg.from === 'user' ? 'right' : 'left', paddingLeft: msg.from === 'bot' ? 2 : 0 }}>
                                        {formatTime(msg.time)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {typing && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'color-mix(in srgb, var(--accent) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 8%, transparent)', borderRadius: '16px 16px 16px 4px', padding: '10px 16px', display: 'flex', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'bounce 1.4s infinite', animationDelay: '0s' }}></span>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'bounce 1.4s infinite', animationDelay: '0.2s' }}></span>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'bounce 1.4s infinite', animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '12px 14px', borderTop: '1px solid color-mix(in srgb, var(--accent) 8%, transparent)',
                        display: 'flex', gap: 8, background: 'var(--bg-card, #1a1a1a)', flexShrink: 0
                    }}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') send(); }}
                            placeholder="Type a message..."
                            style={{
                                flex: 1, border: '1px solid color-mix(in srgb, var(--accent) 12%, transparent)',
                                borderRadius: 24, padding: '10px 18px', fontSize: 13, outline: 'none',
                                background: 'var(--bg, #0d0d0d)', color: 'var(--text, #f0ead6)',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'color-mix(in srgb, var(--accent) 12%, transparent)'}
                        />
                        <button onClick={send} disabled={typing || !input.trim()} style={{
                            background: input.trim() ? 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black))' : 'color-mix(in srgb, var(--accent) 15%, transparent)',
                            color: input.trim() ? '#fff' : 'var(--text-muted)',
                            border: 'none', borderRadius: 14, width: 40, height: 40,
                            cursor: input.trim() ? 'pointer' : 'default', fontSize: 16,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            transition: 'all 0.2s'
                        }}>➤</button>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button onClick={() => setOpen(o => !o)} style={{
                width: 58, height: 58, borderRadius: 18,
                background: 'linear-gradient(135deg, var(--accent, #c9a84c), color-mix(in srgb, var(--accent) 70%, black))',
                color: '#fff', border: 'none',
                fontSize: open ? 22 : 28, cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                float: 'right', transition: 'all 0.3s',
                transform: open ? 'rotate(0deg)' : 'rotate(0deg)'
            }}>
                {open ? '✕' : '🤖'}
            </button>

            <style>{`
                @keyframes chatOpen { from { opacity:0; transform:translateY(20px) scale(0.95) } to { opacity:1; transform:translateY(0) scale(1) } }
                @keyframes bounce { 0%,80%,100% { transform:translateY(0) } 40% { transform:translateY(-6px) } }
            `}</style>
        </div>
    );
}

export default ChatbotWidget;
