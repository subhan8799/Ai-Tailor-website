const express = require('express');
const router = express.Router();

const authMid = require('../middleware/authMiddleware')
const cartController = require('../controllers/CartController')

router.route('/')
    .get([authMid.isAuthenticated, authMid.adminOnlyAccess], cartController.getAllCartItem)
    .post(authMid.isAuthenticated, cartController.addToCart)
router.route('/user/:id')
    .get([authMid.isAuthenticated, authMid.userAccess], cartController.getUserCart)
router.route('/:item_id')
    .delete([authMid.isAuthenticated], cartController.deleteCartItem)

module.exports = router