import React, { useEffect, useState, useRef } from "react";
import ChatAPIs from "../../../services/ChatAPIs";
import UserAPI from "../../../services/UserAPI";
import io from 'socket.io-client';
import { apiFetch } from '../../../services/api';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AdminChat() {
    const [convos, setConvos] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [activeUser, setActiveUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState("");
    const [sending, setSending] = useState(false);
    const socketRef = useRef(null);
    const chatBoxRef = useRef(null);
    const token = localStorage.getItem('token');

    const scrollDown = () => {
        if (chatBoxRef.current) requestAnimationFrame(() => { chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; });
    };

    // Connect socket
    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ["polling"] });
        socketRef.current = socket;
        socket.on("receive-msg", (data) => {
            setMessages(prev => [...prev, { message: data.message, fromUser: true }]);
            scrollDown();
        });
        return () => socket.disconnect();
    }, []);

    // Load conversations with usernames
    useEffect(() => {
        async function load() {
            const all = await ChatAPIs.getAllConversations(null, token);
            const withUsers = await Promise.all(all.map(async (c) => {
                const user = await UserAPI.getUser(c.user, token);
                return { ...c, username: user?.username || 'Unknown', userImage: user?.image };
            }));
            setConvos(withUsers);
        }
        load();
    }, [token]);

    // Select conversation
    const selectConvo = async (convo) => {
        setActiveConvo(convo);
        setActiveUser(convo.username);
        // Join socket room
        socketRef.current?.emit('join-and-exit-room', { user_id: convo.user });
        // Load messages
        const res = await apiFetch(`/api/v1/conversation/${convo._id}/chat`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setMessages(data.messages || []);
        setTimeout(scrollDown, 100);
    };

    // Send message
    const sendMessage = async () => {
        if (!msg.trim() || sending || !activeConvo) return;
        setSending(true);
        socketRef.current?.emit("send-msg", { message: msg, user_id: activeConvo.user });
        await ChatAPIs.createMessage(activeConvo._id, token, { message: msg, fromUser: false });

        // Notify user
        try {
            await apiFetch('/api/v1/extra/notifications', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: activeConvo.user,
                    title: '💬 New message from Admin',
                    message: msg.slice(0, 100),
                    type: 'system',
                    link: '/support'
                })
            });
        } catch { }

        setMessages(prev => [...prev, { message: msg, fromUser: false }]);
        setMsg("");
        setSending(false);
        scrollDown();
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '2rem', marginBottom: 4 }}>Support Messages</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Chat with customers in real-time</p>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 'calc(100vh - 220px)' }}>
                {/* Conversations List */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius, 14px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>
                        💬 Conversations ({convos.length})
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {convos.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No conversations yet</div>
                        ) : convos.map((c, i) => (
                            <div key={i} onClick={() => selectConvo(c)} style={{
                                padding: '12px 18px', cursor: 'pointer',
                                background: activeConvo?._id === c._id ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                                borderBottom: '1px solid color-mix(in srgb, var(--accent) 5%, transparent)',
                                borderLeft: activeConvo?._id === c._id ? '3px solid var(--accent)' : '3px solid transparent',
                                transition: 'all 0.15s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, color: 'var(--accent)', fontWeight: 700, flexShrink: 0
                                    }}>{c.username?.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: activeConvo?._id === c._id ? 'var(--accent)' : 'var(--text)', fontSize: 13 }}>{c.username}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to view messages</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius, 14px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {!activeConvo ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                            <span style={{ fontSize: 48 }}>💬</span>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Select a conversation to start chatting</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '14px 18px', borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />
                                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>Chat with {activeUser}</div>
                            </div>

                            {/* Messages */}
                            <div ref={chatBoxRef} style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
                                {messages.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>No messages yet</div>
                                )}
                                {messages.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: m.fromUser ? 'flex-start' : 'flex-end', marginBottom: 8 }}>
                                        <div style={{
                                            maxWidth: '70%', padding: '8px 14px',
                                            borderRadius: m.fromUser ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                                            background: m.fromUser ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--accent)',
                                            color: m.fromUser ? 'var(--text)' : 'var(--bg)',
                                            fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word'
                                        }}>
                                            {m.fromUser && <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, marginBottom: 2 }}>{activeUser}</div>}
                                            {!m.fromUser && <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2, opacity: 0.7 }}>You (Admin)</div>}
                                            {m.message}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div style={{ padding: '10px 14px', borderTop: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', display: 'flex', gap: 8 }}>
                                <input value={msg} onChange={e => setMsg(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                                    placeholder="Type your reply..."
                                    style={{
                                        flex: 1, background: 'var(--bg)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                                        borderRadius: 20, padding: '9px 16px', color: 'var(--text)', fontSize: 13, outline: 'none'
                                    }} />
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

export default AdminChat;
