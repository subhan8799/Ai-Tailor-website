const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    fromUser: {
        type: Boolean,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    // sent -> delivered -> seen
    status: {
        type: String,
        enum: ['sent', 'delivered', 'seen'],
        default: 'sent'
    }
}, { timestamps: true })

// Compound index for fast queries
MessageSchema.index({ conversation: 1, status: 1 })
MessageSchema.index({ conversation: 1, createdAt: 1 })

module.exports = mongoose.model("Message", MessageSchema)
