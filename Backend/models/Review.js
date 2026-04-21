const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' },
    rating: { type: Number, min: 1, max: 5, required: true },
    fabricRating: { type: Number, min: 1, max: 5 },
    fitRating: { type: Number, min: 1, max: 5 },
    stitchingRating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    images: [{ type: String }],
    timestamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Review', ReviewSchema)
