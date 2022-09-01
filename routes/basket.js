

const express = require('express');

const { handelAddToBasket, getBasket, handelRemoveProduct } = require('../controllers/basketController');
const { authentication } = require('../middlewares/auth');

const router = express.Router();

// get basket: GET
// basketController
router.get("/", authentication, getBasket);

// add to basket: GET
// basketContrtoller
router.get("/add-basket/:id", authentication, handelAddToBasket);

// handel remove from basket: GET
// basketController
router.get("/remove-product/:id", authentication, handelRemoveProduct);

module.exports = router;
