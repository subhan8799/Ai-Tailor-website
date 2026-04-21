const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const { isAuthenticated, adminOnlyAccess } = require('../middleware/authMiddleware');
const { storage } = require('../configs/upload-config');
const multer = require('multer');
const upload = multer({ storage });

// ===== REVIEWS =====
router.get('/reviews', async (req, res) => {
    const reviews = await Review.find({}).populate('user', 'username image').sort({ timestamp: -1 });
    res.json({ reviews });
});

router.post('/reviews', [isAuthenticated, upload.array('images', 5)], async (req, res) => {
    const images = req.files?.map(f => f.path?.startsWith('http') ? f.path : `/uploads/${f.filename}`) || [];
    const review = await Review.create({
        user: req.userID,
        order: req.body.order || undefined,
        rating: req.body.rating,
        fabricRating: req.body.fabricRating,
        fitRating: req.body.fitRating,
        stitchingRating: req.body.stitchingRating,
        comment: req.body.comment,
        images
    });
    res.status(201).json({ review });
});

router.delete('/reviews/:id', isAuthenticated, async (req, res) => {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
});

// ===== APPOINTMENTS =====
router.get('/appointments', isAuthenticated, async (req, res) => {
    const query = req.query.all === 'true' ? {} : { user: req.userID };
    const appointments = await Appointment.find(query).populate('user', 'username email').sort({ date: 1 });
    res.json({ appointments });
});

router.post('/appointments', isAuthenticated, async (req, res) => {
    const appointment = await Appointment.create({ user: req.userID, ...req.body });
    res.status(201).json({ appointment });
});

router.patch('/appointments/:id', isAuthenticated, async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ appointment });
});

router.delete('/appointments/:id', isAuthenticated, async (req, res) => {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
});

// ===== ANALYTICS (Admin) =====
router.get('/analytics', [isAuthenticated, adminOnlyAccess], async (req, res) => {
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    
    const [users, fabrics, suits, orders, reviews, appointments] = await Promise.all([
        db.collection('users').countDocuments(),
        db.collection('fabrics').countDocuments(),
        db.collection('suits').countDocuments(),
        db.collection('orderitems').find({}).toArray(),
        db.collection('reviews').find({}).toArray(),
        db.collection('appointments').countDocuments(),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + (o.price || 0), 0);
    const ordersByStatus = {};
    orders.forEach(o => { ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1; });
    
    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : 0;

    // Orders by month (last 6 months)
    const monthlyOrders = {};
    orders.forEach(o => {
        const d = new Date(o.timestamp);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyOrders[key] = (monthlyOrders[key] || 0) + 1;
    });

    res.json({
        users, fabrics, suits, orders: orders.length, reviews: reviews.length, appointments,
        totalRevenue, ordersByStatus, avgRating, monthlyOrders
    });
});

module.exports = router;
