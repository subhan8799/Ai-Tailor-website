const mongoose = require('mongoose')

const WishlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productType: { type: String, enum: ['Suit', 'Fabric'], required: true },
    product: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'productType' },
    timestamp: { type: Date, default: Date.now }
})

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['order', 'gift', 'system', 'promo'], default: 'system' },
    read: { type: Boolean, default: false },
    link: { type: String },
    timestamp: { type: Date, default: Date.now }
})

const Wishlist = mongoose.model('Wishlist', WishlistSchema)
const Notification = mongoose.model('Notification', NotificationSchema)

module.exports = { Wishlist, Notification }
