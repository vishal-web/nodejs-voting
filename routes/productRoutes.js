const express = require('express');
const router = express.Router();

const product_controller = require('../controllers/productController');

router.get('/create', product_controller.create);
router.get('/list', product_controller.product);
router.post('/create', product_controller.addProduct);

module.exports.router = router;