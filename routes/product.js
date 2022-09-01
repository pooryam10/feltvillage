
const express = require('express');

const { getProducts, getSingleProduct } = require('../controllers/productsController');

const router = express.Router();

router.get("/:kind", getProducts);

// single product: GET
// productController
router.get("/single-product/:id", getSingleProduct);



module.exports = router;