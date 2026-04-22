const express = require('express');
const router = express.Router();
const multer = require('multer');

const userController = require('../controllers/UserController');

const authMid = require('../middleware/authMiddleware');
const { storage } = require('../configs/upload-config');

const upload = multer({ storage });

// Base router: /api/v1/test

router.route('/').all(authMid.isAuthenticated, authMid.adminOnlyAccess)
    .get(userController.getAllUsers)       // Needs a middleware to check if it's an Admin request
router.route('/:id').all(authMid.isAuthenticated, authMid.userAccess)
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)
router.route('/:id/image').all(authMid.isAuthenticated, authMid.userAccess)
    .patch(upload.single('image'), userController.updateUserImage)
router.route('/update-admin/:id')
    .patch(authMid.isAuthenticated, userController.updateAdmin)
module.exports = router