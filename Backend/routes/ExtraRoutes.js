const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Wishlist, Notification } = require('../models/Extra');
const { isAuthenticated } = require('../middleware/authMiddleware');

// ===== WISHLIST =====
router.get('/wishlist', isAuthenticated, async (req, res) => {
    try {
        const items = await Wishlist.find({ user: req.userID }).populate('product');
        res.json({ items });
    } catch (err) { res.status(400).json({ msg: err.message }); }
});

router.post('/wishlist', isAuthenticated, async (req, res) => {
    try {
        const exists = await Wishlist.findOne({ user: req.userID, product: req.body.product_id });
        if (exists) return res.status(400).json({ msg: 'Already in wishlist' });
        const item = await Wishlist.create({
            user: req.userID,
            productType: req.body.product_type,
            product: req.body.product_id
        });
        res.status(201).json({ item });
    } catch (err) { res.status(400).json({ msg: err.message }); }
});

router.delete('/wishlist/:id', isAuthenticated, async (req, res) => {
    await Wishlist.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Removed' });
});

// ===== NOTIFICATIONS =====
router.get('/notifications', isAuthenticated, async (req, res) => {
    const notifications = await Notification.find({ user: req.userID }).sort({ timestamp: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.userID, read: false });
    res.json({ notifications, unread });
});

router.patch('/notifications/read-all', isAuthenticated, async (req, res) => {
    await Notification.updateMany({ user: req.userID }, { read: true });
    res.json({ msg: 'All marked as read' });
});

router.patch('/notifications/:id', isAuthenticated, async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ msg: 'Marked as read' });
});

router.post('/notifications', isAuthenticated, async (req, res) => {
    try {
        const n = await Notification.create({
            user: req.body.user,
            title: req.body.title,
            message: req.body.message,
            type: req.body.type || 'system',
            link: req.body.link
        });
        res.status(201).json({ notification: n });
    } catch (err) { res.status(400).json({ msg: err.message }); }
});

// ===== GLOBAL SEARCH =====
router.get('/search', async (req, res) => {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json({ results: [] });
    const regex = new RegExp(q, 'i');
    try {
        const db = mongoose.connection.db;
        const [fabrics, suits, users] = await Promise.all([
            db.collection('fabrics').find({ $or: [{ name: regex }, { color: regex }] }).limit(10).toArray(),
            db.collection('suits').find({ $or: [{ type: regex }] }).limit(10).toArray(),
            db.collection('users').find({ $or: [{ username: regex }, { name: regex }, { email: regex }] }).limit(5).toArray(),
        ]);
        const results = [
            ...fabrics.map(f => ({ type: 'Fabric', name: `${f.name} - ${f.color}`, price: f.price, id: f._id, link: `/fabrics?search=${encodeURIComponent(f.name)}`, image: f.image })),
            ...suits.map(s => ({ type: 'Suit', name: (s.type || '').replace('_', ' '), price: s.price, id: s._id, link: `/readymade-suit?search=${encodeURIComponent(s.type || '')}`, image: s.image })),
            ...users.map(u => ({ type: 'User', name: u.username || u.name, id: u._id, link: '/admin' })),
        ];
        res.json({ results, total: results.length });
    } catch (err) { res.json({ results: [] }); }
});

module.exports = router;
