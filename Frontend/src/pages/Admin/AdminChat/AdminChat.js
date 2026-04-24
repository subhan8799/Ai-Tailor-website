import React, { useEffect, useState, useRef, useCallback } from "react";
import io from 'socket.io-client';
import { apiFetch, API } from '../../../services/api';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const userImg = (p) => !p || p === '/uploads/undefined' ? '' : p.startsWith('http') ? p : `${API}${p}`;

function AdminChat() {
    const [convos, setConvos] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [activeUser, setActiveUser] = useState('');
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState("");
    const [sending, setSending] = useState(false);
    const [typing, setTyping] = useState(null); // username of who's typing
    const socketRef = useRef(null);
    const chatBoxRef = useRef(null);
    const activeIdRef = useRef(null);
    const typingTimeout = useRef(null);
    const token = localStorage.getItem('token');
    const adminId = localStorage.getItem('user_id');

    const scrollDown = useCallback(() => {
        if (chatBoxRef.current) requestAnimationFrame(() => { chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; });
    }, []);

    // Load conversations from REST API
    const loadConvos = useCallback(async () => {
        try {
            const res = await apiFetch('/api/v1/conversation/', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setConvos(data.convos || []);
        } catch { }
    }, [token]);

    // 1. Socket connection + events
    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ["polling", "websocket"] });
        socketRef.current = socket;

        socket.on("connect", () => {
            if (adminId) socket.emit('go-online', { userId: adminId });
        });

        // New message arrives
        socket.on("new-message", (msg) => {
            // If it's for the active conversation, add to messages
            if (String(msg.conversation) === String(activeIdRef.current)) {
                setMessages(prev => {
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
                // Auto mark as seen since admin is viewing
                socket.emit('mark-seen', { convoId: activeIdRef.current, userId: adminId });
            }
            // Always refresh sidebar
            loadConvos();
        });

        // Conversation updated (unread counts changed)
        socket.on("convo-updated", () => loadConvos());

        // Messages seen by customer
        socket.on("msgs-seen", (data) => {
            if (String(data.convoId) === String(activeIdRef.current)) {
                setMessages(prev => prev.map(m => !m.fromUser ? { ...m, status: 'seen' } : m));
            }
        });

        // Typing
        socket.on("user-typing", (data) => {
            if (String(data.convoId) === String(activeIdRef.current)) setTyping(data.username);
        });
        socket.on("user-stop-typing", (data) => {
            if (String(data.convoId) === String(activeIdRef.current)) setTyping(null);
        });

        return () => socket.disconnect();
    }, [adminId, loadConvos]);

    // 2. Initial load
    useEffect(() => { loadConvos(); }, [loadConvos]);

    // 3. Open conversation
    const openConvo = async (convo) => {
        const cid = convo._id;
        activeIdRef.current = cid;
        setActiveId(cid);
        setActiveUser(convo.user?.username || 'Unknown');
        setTyping(null);

        // Join socket room
        socketRef.current?.emit('join-chat', { convoId: cid, userId: adminId });

        // Mark as seen via socket
        socketRef.current?.emit('mark-seen', { convoId: cid, userId: adminId });

        // Load messages
        try {
            const res = await apiFetch(`/api/v1/conversation/${cid}/chat`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setMessages(data.messages || []);
            setTimeout(scrollDown, 100);
        } catch { setMessages([]); }

        // Update sidebar immediately
        setConvos(prev => prev.map(c => c._id === cid ? { ...c, unreadByAdmin: 0 } : c));
    };

    // 4. Send message
    const sendMessage = async () => {
        if (!msg.trim() || sending || !activeId) return;
        setSending(true);
        socketRef.current?.emit('stop-typing', { convoId: activeId, userId: adminId });
        socketRef.current?.emit('send-msg', {
            convoId: activeId,
            message: msg,
            fromUser: false,
            senderId: adminId
        });
        setMsg("");
        setSending(false);
    };

    // 5. Typing
    const handleTyping = (e) => {
        setMsg(e.target.value);
        if (!activeId) return;
        socketRef.current?.emit('typing', { convoId: activeId, userId: adminId, username: 'Admin' });
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socketRef.current?.emit('stop-typing', { convoId: activeId, userId: adminId });
        }, 2000);
    };

    const fmtTime = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const statusIcon = (s) => s === 'seen' ? '✓✓' : s === 'delivered' ? '✓✓' : '✓';
    const statusColor = (s) => s === 'seen' ? '#4ade80' : 'inherit';

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg)', padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)', fontSize: '2rem', marginBottom: 4 }}>Support Messages</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Real-time chat with customers</p>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 'calc(100vh - 220px)' }}>
                {/* Sidebar */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius, 14px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>
                        💬 Conversations ({convos.length})
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {convos.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No conversations</div>
                        ) : convos.map((c) => {
                            const isActive = String(c._id) === String(activeId);
                            const unread = isActive ? 0 : (c.unreadByAdmin || 0);
                            return (
                                <div key={c._id} onClick={() => openConvo(c)} style={{
                                    padding: '12px 18px', cursor: 'pointer',
                                    background: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                                    borderBottom: '1px solid color-mix(in srgb, var(--accent) 5%, transparent)',
                                    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ position: 'relative', flexShrink: 0 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'color-mix(in srgb, var(--accent) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'var(--accent)', fontWeight: 700, overflow: 'hidden' }}>
                                                {userImg(c.user?.image) ? <img src={userImg(c.user.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (c.user?.username || '?').charAt(0).toUpperCase()}
                                            </div>
                                            {unread > 0 && (
                                                <div style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, background: '#e74c3c', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{unread}</div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: unread > 0 ? 700 : 500, color: isActive ? 'var(--accent)' : 'var(--text)', fontSize: 13 }}>{c.user?.username || 'Unknown'}</span>
                                                {c.lastMessageAt && <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{fmtTime(c.lastMessageAt)}</span>}
                                            </div>
                                            <div style={{ fontSize: 11, color: unread > 0 ? 'var(--text)' : 'var(--text-muted)', fontWeight: unread > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                                                {c.lastMessage ? (<>{c.lastMessageFromUser === false && <span style={{ color: 'var(--accent)' }}>You: </span>}{c.lastMessage}</>) : 'No messages'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--card-radius, 14px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {!activeId ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                            <span style={{ fontSize: 48 }}>💬</span>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Select a conversation</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '14px 18px', borderBottom: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{activeUser}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {typing ? <span style={{ color: 'var(--accent)' }}>{typing} is typing...</span> : 'Online'}
                                </div>
                            </div>

                            <div ref={chatBoxRef} style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
                                {messages.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>No messages</div>}
                                {messages.map((m, i) => (
                                    <div key={m._id || i} style={{ display: 'flex', justifyContent: m.fromUser ? 'flex-start' : 'flex-end', marginBottom: 8 }}>
                                        <div style={{
                                            maxWidth: '70%', padding: '8px 14px',
                                            borderRadius: m.fromUser ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                                            background: m.fromUser ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--accent)',
                                            color: m.fromUser ? 'var(--text)' : 'var(--bg)',
                                            fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word'
                                        }}>
                                            {m.fromUser && <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, marginBottom: 2 }}>{activeUser}</div>}
                                            {m.message}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                <span style={{ fontSize: 9, opacity: 0.6 }}>{fmtTime(m.createdAt)}</span>
                                                {!m.fromUser && <span style={{ fontSize: 10, color: statusColor(m.status) }}>{statusIcon(m.status)}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {typing && (
                                    <div style={{ display: 'flex', marginBottom: 8 }}>
                                        <div style={{ padding: '8px 14px', borderRadius: '14px 14px 14px 4px', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', fontSize: 12, color: 'var(--text-muted)' }}>
                                            <span style={{ animation: 'pulse 1.5s infinite' }}>●</span> <span style={{ animation: 'pulse 1.5s infinite 0.3s' }}>●</span> <span style={{ animation: 'pulse 1.5s infinite 0.6s' }}>●</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '10px 14px', borderTop: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)', display: 'flex', gap: 8 }}>
                                <input value={msg} onChange={handleTyping}
                                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                                    placeholder="Type your reply..."
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

export default AdminChat;
