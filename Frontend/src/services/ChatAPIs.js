import { apiFetch } from './api';

async function hasConversation(user_id, token) {
    try {
        const res = await apiFetch(`/api/v1/conversation/user/${user_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok;
    } catch { return false; }
}

async function createConversation(token) {
    try {
        const res = await apiFetch('/api/v1/conversation', {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.convo;
    } catch { return null; }
}

async function createMessage(convo_id, token, messageData) {
    try {
        await apiFetch(`/api/v1/conversation/${convo_id}/chat`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(messageData)
        });
    } catch (err) { console.warn('Failed to create message:', err.message); }
}

async function getAllConversations(user_id, token) {
    try {
        const res = await apiFetch('/api/v1/conversation', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.convos || [];
    } catch { return []; }
}

async function getConversation(user_id, token) {
    try {
        const res = await apiFetch(`/api/v1/conversation/user/${user_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.convo;
    } catch { return null; }
}

async function getMessages(user_id, token) {
    try {
        const convo = await getConversation(user_id, token);
        if (!convo?._id) return [];
        const res = await apiFetch(`/api/v1/conversation/${convo._id}/chat`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return data.messages || [];
    } catch { return []; }
}

const ChatAPIs = { createConversation, getMessages, hasConversation, getConversation, createMessage, getAllConversations };
export default ChatAPIs;
