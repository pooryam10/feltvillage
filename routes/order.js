
const express = require('express');

const { getAddressPage, handelGetAddress, getConfirmOrder, handeConfirmOrder } = require('../controllers/orderController');
const { authentication } = require('../middlewares/auth');

const router = express.Router();

// address page: GET
// orderController
router.get("/get-address", authentication, getAddressPage);

// address page: POST
// orderController
router.post("/get-address", authentication, handelGetAddress);

// confirm page: GET
// orderController
router.get("/confirm-order", authentication, getConfirmOrder);

// handel confirm code: POST
// orderController
router.post("/confirm-order", authentication, handeConfirmOrder);

module.exports = router;