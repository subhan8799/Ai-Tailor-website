const mongoose = require('mongoose')

const ConversationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    lastMessage: String,
    lastMessageAt: Date,
    lastMessageFromUser: Boolean,
    // Unread counts stored in DB to avoid recalculating
    unreadByAdmin: { type: Number, default: 0 },
    unreadByUser: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model("Conversation", ConversationSchema)
