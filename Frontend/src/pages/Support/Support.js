import React, { useEffect, useState, useRef } from "react";
import ChatAPIs from "../../services/ChatAPIs";
import AuthAPI from "../../services/AuthAPI";
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Support() {
    const [msg, setMsg] = useState("")
    const [allMsg, setAllMsg] = useState([])
    const [hasConv, setHasConv] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)
    const [sending, setSending] = useState(false)
    const socketRef = useRef(null)
    const chatBoxRef = useRef(null)
    const inputRef = useRef(null)

    const user_id = localStorage.getItem('user_id')
    const token = localStorage.getItem('token')

    const scrollDown = () => {
        if (chatBoxRef.current) {
            requestAnimationFrame(() => { chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; });
        }
    }

    // Connect socket
    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ["polling"] });
        socketRef.current = socket;

        socket.on("connect", () => console.log("Socket connected:", socket.id));

        socket.on("receive-msg", (data) => {
            setAllMsg(prev => [...prev, { message: data.message, fromUser: data.fromUser }]);
            scrollDown();
        });

        return () => { socket.disconnect(); };
    }, []);

    // Join room when logged in
    useEffect(() => {
        if (loggedIn && user_id && socketRef.current) {
            socketRef.current.emit('join-room', { user_id });
        }
    }, [loggedIn, user_id]);

    // Check login
    useEffect(() => {
        async function check() { setLoggedIn(await AuthAPI.isLoggedIn()); }
        check();
    }, []);

    // Check conversation
    useEffect(() => {
        async function checkConv() {
            if (!loggedIn) return;
            const result = await ChatAPIs.hasConversation(user_id, token);
            setHasConv(result);
        }
        checkConv();
    }, [loggedIn, user_id, token]);

    // Load messages
    useEffect(() => {
        async function load() {
            if (!loggedIn || !hasConv) return;
            const data = await ChatAPIs.getMessages(user_id, token);
            setAllMsg(data || []);
            setTimeout(scrollDown, 100);
        }
        load();
    }, [loggedIn, hasConv, user_id, token]);

    const sendMessage = async () => {
        if (!msg.trim() || sending) return;
        setSending(true);

        // Emit via socket
        socketRef.current?.emit("send-msg", { message: msg, user_id });

        // Save to DB
        const convo = await ChatAPIs.getConversation(user_id, token);
        if (convo?._id) {
            await ChatAPIs.createMessage(convo._id, token, { message: msg, fromUser: true });
        }

        // Show locally
        setAllMsg(prev => [...prev, { message: msg, fromUser: true }]);
        setMsg("");
        setSending(false);
        scrollDown();
        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => { if (e.key === 'Enter') sendMessage(); };

    const startConversation = async () => {
        await ChatAPIs.createConversation(token);
        window.location.reload();
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '40px 20px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span className="badge-gold">Support</span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--text)', margin: '12px 0' }}>
                    Live <span style={{ color: 'var(--accent)' }}>Support</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Chat with our team in real-time</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* FAQ Section */}
                <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '1.3rem', marginBottom: 16 }}>Frequently Asked Questions</h2>
                    {[
                        { q: 'How do I design a custom suit?', a: 'Go to the Design page, select fabric, suit type, enter measurements, and add to cart.' },
                        { q: 'How long does delivery take?', a: 'Custom suits take 7-14 business days. Fabric orders take 3-5 days.' },
                        { q: 'Can I return a custom suit?', a: 'Custom suits cannot be returned, but we offer free alterations for defects within 14 days.' },
                        { q: 'How do I track my order?', a: 'Visit My Orders page to see real-time status updates.' },
                    ].map((faq, i) => (
                        <details key={i} style={{ marginBottom: 8, background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 8%, transparent)', borderRadius: 10, overflow: 'hidden' }}>
                            <summary style={{ padding: '12px 16px', cursor: 'pointer', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>{faq.q}</summary>
                            <div style={{ padding: '0 16px 12px', color: 'var(--text-secondary)', fontSize: 13 }}>{faq.a}</div>
                        </details>
                    ))}
                </div>

                {/* Chat Section */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--card-radius)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 500 }}>
                    {/* Chat Header */}
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>Live Chat with Admin</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Messages are sent to our support team via Socket.io</div>
                        </div>
                    </div>

                    {!loggedIn ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                            <span style={{ fontSize: 36 }}>🔒</span>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Please login to start chatting</p>
                        </div>
                    ) : !hasConv ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                            <span style={{ fontSize: 36 }}>💬</span>
                            <button onClick={startConversation} style={{
                                padding: '10px 24px', background: 'var(--accent)', border: 'none',
                                borderRadius: 'var(--btn-radius)', color: 'var(--bg)', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                            }}>Start Conversation</button>
                        </div>
                    ) : (
                        <>
                            {/* Messages */}
                            <div ref={chatBoxRef} style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
                                {allMsg.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                                        No messages yet. Say hello! 👋
                                    </div>
                                )}
                                {allMsg.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: m.fromUser ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                                        <div style={{
                                            maxWidth: '75%', padding: '8px 14px',
                                            borderRadius: m.fromUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                            background: m.fromUser ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 8%, transparent)',
                                            color: m.fromUser ? 'var(--bg)' : 'var(--text)',
                                            fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word'
                                        }}>
                                            {!m.fromUser && <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, marginBottom: 2 }}>Admin</div>}
                                            {m.message}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div style={{ padding: '10px 14px', borderTop: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', display: 'flex', gap: 8 }}>
                                <input
                                    ref={inputRef}
                                    value={msg}
                                    onChange={e => setMsg(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your message..."
                                    style={{
                                        flex: 1, background: 'var(--bg)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                                        borderRadius: 20, padding: '9px 16px', color: 'var(--text)', fontSize: 13, outline: 'none'
                                    }}
                                />
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
        </div>
    );
}

export default Support;
