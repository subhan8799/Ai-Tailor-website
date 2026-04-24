const { StatusCodes } = require('http-status-codes')
const Conversation = require("../models/Conversation")
const Message = require("../models/Message")
const User = require("../models/User")

// Track online users: { visitorId: socketId }
const onlineUsers = new Map()
// Track which conversation each user is viewing
const activeChats = new Map()

const eventHandler = (io, socket) => {

    // User comes online
    socket.on('go-online', (data) => {
        if (!data?.userId) return
        onlineUsers.set(data.userId, socket.id)
        io.emit('user-online', { userId: data.userId })
        console.log(`Online: ${data.userId}`)
    })

    // Join a conversation room
    socket.on('join-chat', (data) => {
        if (!data?.convoId || !data?.userId) return
        // Leave previous rooms
        const prev = activeChats.get(data.userId)
        if (prev) socket.leave(`convo:${prev}`)
        // Join new room
        socket.join(`convo:${data.convoId}`)
        activeChats.set(data.userId, data.convoId)
        console.log(`${data.userId} joined convo:${data.convoId}`)
    })

    // Send message — the core event
    socket.on('send-msg', async (data) => {
        if (!data?.convoId || !data?.message) return
        try {
            // Save to DB
            const msg = await Message.create({
                conversation: data.convoId,
                fromUser: data.fromUser,
                message: data.message,
                status: 'sent'
            })

            // Update conversation metadata atomically
            const updateFields = {
                lastMessage: data.message.slice(0, 100),
                lastMessageAt: new Date(),
                lastMessageFromUser: data.fromUser
            }
            if (data.fromUser) {
                updateFields.$inc = { unreadByAdmin: 1 }
            } else {
                updateFields.$inc = { unreadByUser: 1 }
            }
            // Use raw update to support $inc
            await Conversation.findByIdAndUpdate(data.convoId, {
                lastMessage: updateFields.lastMessage,
                lastMessageAt: updateFields.lastMessageAt,
                lastMessageFromUser: updateFields.lastMessageFromUser,
                $inc: data.fromUser ? { unreadByAdmin: 1 } : { unreadByUser: 1 }
            })

            const msgObj = msg.toObject()

            // Emit to the conversation room (both sides get it)
            io.to(`convo:${data.convoId}`).emit('new-message', msgObj)

            // Also emit to sidebar refresh for admin
            io.emit('convo-updated', { convoId: data.convoId })

            // Mark as delivered if receiver is online in this convo
            // Check if the other side is viewing this convo
            const convo = await Conversation.findById(data.convoId)
            if (convo) {
                const receiverId = data.fromUser ? null : String(convo.user)
                // For admin messages, check if user is in this convo
                // For user messages, check if any admin is in this convo
                let receiverViewing = false
                for (const [uid, cid] of activeChats.entries()) {
                    if (String(cid) === String(data.convoId) && uid !== data.senderId) {
                        receiverViewing = true
                        break
                    }
                }
                if (receiverViewing) {
                    await Message.findByIdAndUpdate(msg._id, { status: 'seen' })
                    io.to(`convo:${data.convoId}`).emit('msg-status', { msgId: msg._id, status: 'seen' })
                }
            }

            // Auto-reply only on customer's FIRST message (no admin reply exists yet)
            if (data.fromUser) {
                const existingAdminMsg = await Message.findOne({ conversation: data.convoId, fromUser: false })
                if (!existingAdminMsg) {
                    setTimeout(async () => {
                        try {
                            const autoMsg = await Message.create({
                                conversation: data.convoId,
                                fromUser: false,
                                message: "Thanks for reaching out! \ud83d\udc4b Our team has been notified and will get back to you shortly. In the meantime, feel free to share more details about your query.",
                                status: 'sent'
                            })
                            await Conversation.findByIdAndUpdate(data.convoId, {
                                lastMessage: autoMsg.message.slice(0, 100),
                                lastMessageAt: new Date(),
                                lastMessageFromUser: false,
                                $inc: { unreadByUser: 1 }
                            })
                            io.to(`convo:${data.convoId}`).emit('new-message', autoMsg.toObject())
                            io.emit('convo-updated', { convoId: data.convoId })
                        } catch (e) { console.warn('Auto-reply error:', e.message) }
                    }, 1500)
                }
            }

            // Send notification
            try {
                const { Notification } = require('../models/Extra')
                if (data.fromUser) {
                    const admins = await User.find({ isAdmin: true })
                    const sender = await User.findById(convo?.user)
                    for (const admin of admins) {
                        await Notification.create({
                            user: admin._id,
                            title: '\ud83d\udcac ' + (sender?.username || 'Customer'),
                            message: data.message.slice(0, 80),
                            type: 'system',
                            link: '/admin/chat'
                        })
                    }
                } else if (convo) {
                    await Notification.create({
                        user: convo.user,
                        title: '\ud83d\udcac Admin',
                        message: data.message.slice(0, 80),
                        type: 'system',
                        link: '/support'
                    })
                }
            } catch (e) { }

        } catch (err) {
            console.error('send-msg error:', err.message)
        }
    })

    // Mark messages as seen when user opens/views a conversation
    socket.on('mark-seen', async (data) => {
        if (!data?.convoId || !data?.userId) return
        try {
            const user = await User.findById(data.userId)
            const isAdmin = user?.isAdmin || false

            // Mark messages from the OTHER side as seen
            const result = await Message.updateMany(
                { conversation: data.convoId, fromUser: isAdmin, status: { $ne: 'seen' } },
                { $set: { status: 'seen' } }
            )

            // Reset unread count
            if (isAdmin) {
                await Conversation.findByIdAndUpdate(data.convoId, { unreadByAdmin: 0 })
            } else {
                await Conversation.findByIdAndUpdate(data.convoId, { unreadByUser: 0 })
            }

            if (result.modifiedCount > 0) {
                // Notify sender that their messages were seen
                io.to(`convo:${data.convoId}`).emit('msgs-seen', {
                    convoId: data.convoId,
                    seenBy: data.userId
                })
                io.emit('convo-updated', { convoId: data.convoId })
            }
        } catch (err) {
            console.error('mark-seen error:', err.message)
        }
    })

    // Typing indicator
    socket.on('typing', (data) => {
        if (!data?.convoId) return
        socket.to(`convo:${data.convoId}`).emit('user-typing', {
            convoId: data.convoId,
            userId: data.userId,
            username: data.username
        })
    })

    socket.on('stop-typing', (data) => {
        if (!data?.convoId) return
        socket.to(`convo:${data.convoId}`).emit('user-stop-typing', {
            convoId: data.convoId,
            userId: data.userId
        })
    })

    // Disconnect
    socket.on('disconnect', () => {
        for (const [userId, sid] of onlineUsers.entries()) {
            if (sid === socket.id) {
                onlineUsers.delete(userId)
                activeChats.delete(userId)
                io.emit('user-offline', { userId })
                console.log(`Offline: ${userId}`)
                break
            }
        }
    })
}

// REST endpoints

const getAllConversations = async (req, res) => {
    const convos = await Conversation.find({}).populate('user', 'username image email').sort({ lastMessageAt: -1 })
    res.status(StatusCodes.OK).json({ convos })
}

const getConversationByUser = async (req, res) => {
    const convo = await Conversation.findOne({ user: req.params.user_id })
    if (!convo) return res.status(StatusCodes.NOT_FOUND).json({ msg: 'No conversation found' })
    res.status(StatusCodes.OK).json({ convo })
}

const createConversation = async (req, res) => {
    let convo = await Conversation.findOne({ user: req.userID })
    if (convo) return res.json({ msg: "Conversation already created!", convo_id: convo._id, convo })
    convo = await Conversation.create({ user: req.userID })
    res.status(StatusCodes.CREATED).json({ convo })
}

const getMessages = async (req, res) => {
    const convo = await Conversation.findOne({ _id: req.params.convo_id })
    if (!convo) return res.status(StatusCodes.NOT_FOUND).json({ msg: "No conversation found!" })
    const messages = await Message.find({ conversation: convo._id }).sort({ createdAt: 1 })
    res.status(StatusCodes.OK).json({ messages })
}

const createMessage = async (req, res) => {
    const convo = await Conversation.findOne({ _id: req.params.convo_id })
    if (!convo) return res.status(StatusCodes.NOT_FOUND).json({ msg: 'No convo found!' })
    const message = await Message.create({
        conversation: convo._id,
        fromUser: req.body.fromUser,
        message: req.body.message,
        status: 'sent'
    })
    res.status(StatusCodes.CREATED).json({ message })
}

module.exports = {
    eventHandler,
    createConversation,
    getAllConversations,
    getMessages,
    getConversationByUser,
    createMessage,
}
