const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isAuthenticated, adminOnlyAccess } = require('../middleware/authMiddleware');

const { storage } = require('../configs/upload-config');
const multer = require('multer');
const upload = multer({ storage });

// Upload image
router.post('/upload', [isAuthenticated, adminOnlyAccess, upload.single('image')], (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const path = req.file.path?.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
    res.json({ path });
});

// Get all collection names
router.get('/collections', [isAuthenticated, adminOnlyAccess], async (req, res) => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const result = [];
    for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        result.push({ name: col.name, count });
    }
    res.json({ collections: result });
});

// Get all documents in a collection
router.get('/collection/:name', [isAuthenticated, adminOnlyAccess], async (req, res) => {
    try {
        const docs = await mongoose.connection.db.collection(req.params.name).find({}).limit(500).toArray();
        res.json({ documents: docs, count: docs.length });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Get single document
router.get('/collection/:name/:id', [isAuthenticated, adminOnlyAccess], async (req, res) => {
    try {
        const doc = await mongoose.connection.db.collection(req.params.name)
            .findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        res.json({ document: doc });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Create document
router.post('/collection/:name', [isAuthenticated, adminOnlyAccess], async (req, res) => {
    try {
        const result = await mongoose.connection.db.collection(req.params.name).insertOne(req.body);
        res.status(201).json({ insertedId: result.insertedId });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Update document
router.patch('/collection/:name/:id', [isAuthenticated, adminOnlyAccess], async (req, res) => {
    try {
        const update = { ...req.body };
        delete update._id;
        // Convert numeric strings to numbers
        for (const key of Object.keys(update)) {
            if (!isNaN(update[key]) && update[key] !== '' && update[key] !== true && update[key] !== false) {
                update[key] = Number(update[key]);
            }
            if (update[key] === 'true') update[key] = true;
            if (update[key] === 'false') update[key] = false;
        }
        await mongoose.connection.db.collection(req.params.name)
            .updateOne({ _id: new mongoose.Types.ObjectId(req.params.id) }, { $set: update });
        res.json({ msg: 'Updated' });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

// Delete document
router.delete('/collection/:name/:id', [isAuthenticated, adminOnlyAccess], async (req, res) => {
    try {
        await mongoose.connection.db.collection(req.params.name)
            .deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        res.json({ msg: 'Deleted' });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
});

module.exports = router;
