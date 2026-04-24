import React, { useEffect, useState, useRef, useCallback } from "react";
import ChatAPIs from "../../services/ChatAPIs";
import AuthAPI from "../../services/AuthAPI";
import io from 'socket.io-client';
import { apiFetch } from '../../services/api';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Support() {
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState("");
    const [convoId, setConvoId] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [sending, setSending] = useState(false);
    const [adminTyping, setAdminTyping] = useState(false);
    const [adminOnline, setAdminOnline] = useState(false);
    const socketRef = useRef(null);
    const chatBoxRef = useRef(null);
    const typingTimeout = useRef(null);

    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');

    const scrollDown = useCallback(() => {
        if (chatBoxRef.current) requestAnimationFrame(() => { chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; });
    }, []);

    // 1. Connect socket
    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ["polling", "websocket"] });
        socketRef.current = socket;

        socket.on("connect", () => {
            if (userId) socket.emit('go-online', { userId });
        });

        // Receive new message
        socket.on("new-message", (msg) => {
            setMessages(prev => {
                if (prev.find(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
            scrollDown();
        });

        // Messages marked as seen by admin
        socket.on("msgs-seen", () => {
            setMessages(prev => prev.map(m => m.fromUser ? { ...m, status: 'seen' } : m));
        });

        // Typing indicators
        socket.on("user-typing", () => setAdminTyping(true));
        socket.on("user-stop-typing", () => setAdminTyping(false));

        // Online/offline
        socket.on("user-online", (data) => { /* could track specific admin */ setAdminOnline(true); });
        socket.on("user-offline", () => setAdminOnline(false));

        return () => socket.disconnect();
    }, [userId, scrollDown]);

    // 2. Check login + load conversation
    useEffect(() => {
        async function init() {
            const isLogged = await AuthAPI.isLoggedIn();
            setLoggedIn(isLogged);
            if (!isLogged) return;

            const convo = await ChatAPIs.getConversation(userId, token);
            if (convo?._id) {
                setConvoId(convo._id);
                // Join socket room
                socketRef.current?.emit('join-chat', { convoId: convo._id, userId });
                // Mark admin messages as seen
                socketRef.current?.emit('mark-seen', { convoId: convo._id, userId });
                // Load messages
                const msgs = await ChatAPIs.getMessages(userId, token);
                setMessages(msgs || []);
                setTimeout(scrollDown, 100);
            }
        }
        init();
    }, [userId, token, scrollDown]);

    // 3. Send message
    const sendMessage = async () => {
        if (!msg.trim() || sending || !convoId) return;
        setSending(true);
        socketRef.current?.emit('stop-typing', { convoId, userId });

        socketRef.current?.emit('send-msg', {
            convoId,
            message: msg,
            fromUser: true,
            senderId: userId
        });

        setMsg("");
        setSending(false);
        scrollDown();
    };

    // 4. Typing indicator
    const handleTyping = (e) => {
        setMsg(e.target.value);
        if (!convoId) return;
        socketRef.current?.emit('typing', { convoId, userId, username: 'Customer' });
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socketRef.current?.emit('stop-typing', { convoId, userId });
        }, 2000);
    };

    // 5. Start conversation
    const startConversation = async () => {
        await ChatAPIs.createConversation(token);
        window.location.reload();
    };

    const fmtTime = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const statusIcon = (s) => s === 'seen' ? '✓✓' : s === 'delivered' ? '✓✓' : '✓';
    const statusColor = (s) => s === 'seen' ? 'var(--accent)' : 'inherit';

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '40px 20px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span className="badge-gold">Support</span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text)', margin: '12px 0' }}>
                    Live <span style={{ color: 'var(--accent)' }}>Support</span>
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* FAQ */}
                <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '1.3rem', marginBottom: 16 }}>FAQs</h2>
                    {[
                        { q: 'How do I design a custom suit?', a: 'Go to Design page, select fabric, suit type, enter measurements, and add to cart.' },
                        { q: 'How long does delivery take?', a: 'Custom suits: 7-14 days. Fabric orders: 3-5 days.' },
                        { q: 'Can I return a custom suit?', a: 'Free alterations for defects within 14 days.' },
                        { q: 'How do I track my order?', a: 'Visit My Orders page for real-time status.' },
                    ].map((faq, i) => (
                        <details key={i} style={{ marginBottom: 8, background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 8%, transparent)', borderRadius: 10 }}>
                            <summary style={{ padding: '12px 16px', cursor: 'pointer', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>{faq.q}</summary>
                            <div style={{ padding: '0 16px 12px', color: 'var(--text-secondary)', fontSize: 13 }}>{faq.a}</div>
                        </details>
                    ))}
                </div>

                {/* Chat */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--card-radius)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 500 }}>
                    {/* Header */}
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: adminOnline ? '#4ade80' : '#666' }} />
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>Admin Support</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {adminTyping ? <span style={{ color: 'var(--accent)' }}>typing...</span> : adminOnline ? 'Online' : 'Offline'}
                            </div>
                        </div>
                    </div>

                    {!loggedIn ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                            <span style={{ fontSize: 36 }}>🔒</span>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Please login to chat</p>
                        </div>
                    ) : !convoId ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                            <span style={{ fontSize: 36 }}>💬</span>
                            <button onClick={startConversation} style={{ padding: '10px 24px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Start Conversation</button>
                        </div>
                    ) : (
                        <>
                            {/* Messages */}
                            <div ref={chatBoxRef} style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
                                {messages.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>Say hello! 👋</div>}
                                {messages.map((m, i) => (
                                    <div key={m._id || i} style={{ display: 'flex', justifyContent: m.fromUser ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                                        <div style={{
                                            maxWidth: '75%', padding: '8px 14px',
                                            borderRadius: m.fromUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                            background: m.fromUser ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 8%, transparent)',
                                            color: m.fromUser ? 'var(--bg)' : 'var(--text)',
                                            fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word'
                                        }}>
                                            {!m.fromUser && <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, marginBottom: 2 }}>Admin</div>}
                                            {m.message}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                <span style={{ fontSize: 9, opacity: 0.6 }}>{fmtTime(m.createdAt)}</span>
                                                {m.fromUser && <span style={{ fontSize: 10, color: statusColor(m.status) }}>{statusIcon(m.status)}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {adminTyping && (
                                    <div style={{ display: 'flex', marginBottom: 8 }}>
                                        <div style={{ padding: '8px 14px', borderRadius: '14px 14px 14px 4px', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', fontSize: 12, color: 'var(--text-muted)' }}>
                                            <span style={{ animation: 'pulse 1.5s infinite' }}>●</span> <span style={{ animation: 'pulse 1.5s infinite 0.3s' }}>●</span> <span style={{ animation: 'pulse 1.5s infinite 0.6s' }}>●</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div style={{ padding: '10px 14px', borderTop: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', display: 'flex', gap: 8 }}>
                                <input value={msg} onChange={handleTyping}
                                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                                    placeholder="Type a message..."
                                    style={{ flex: 1, background: 'var(--bg)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 20, padding: '9px 16px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                                <button onClick={sendMessage} disabled={!msg.trim() || sending} style={{
                                    background: msg.trim() ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 20%, transparent)',
                                    border: 'none', borderRadius: '50%', width: 38, height: 38,
                                    color: 'var(--bg)', fontSize: 16, cursor: msg.trim() ? 'pointer' : 'default',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>➤</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>
        </div>
    );
}

export default Support;
