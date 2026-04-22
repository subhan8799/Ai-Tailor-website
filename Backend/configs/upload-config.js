const cloudinary = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';

// Create uploads directory if it doesn't exist
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = isCloudinaryConfigured
    ? new CloudinaryStorage({ cloudinary, params: { folder: 'Fabrics' } })
    : multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => {
            const filename = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
            cb(null, filename);
        }
    });

module.exports = { storage, isCloudinaryConfigured };
