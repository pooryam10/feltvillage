
const express = require('express');

const {
    getDashboard,
    getAddProduct,
    handelCreateProduct,
    getShowProducts,
    handelDeleteProduct,
    getEditProducts,
    handelEditProduct,
    getDiscountedProducts,
    getUnCompletOrdersPage,
    getSingleOrderPage,
    getCompletOrdersPage,
    handelCompleteOrder,
    handelDeleteOrder,
    getUsers,
    handelDeleteUser
} = require('../controllers/adminController');
const { adminAuthentication } = require('../middlewares/auth');

const router = express.Router();

// dashboard page: GET
// adminController
router.get("/", adminAuthentication, getDashboard);

// add product page: GET
// adminController
router.get("/add-product", adminAuthentication, getAddProduct);

// add product page: POST
// adminController
router.post("/add-product", adminAuthentication, handelCreateProduct);

// show product page: GET
// adminController
router.get("/show-products/:kind", adminAuthentication, getShowProducts);

// handel delete product: GET
// adminController
router.get("/delete-product/:id", adminAuthentication, handelDeleteProduct);

// handel edit product: GET
// adminController
router.get("/edit-product/:id", adminAuthentication, getEditProducts);

// handel edit product: POST
// adminController
router.post("/edit-product/:id", adminAuthentication, handelEditProduct);

// show discounted products: GET
// adminController
router.get("/discounted-products", adminAuthentication, getDiscountedProducts);

// get uncomplete orders page: GET
// adminController
router.get("/uncomplet-orders", adminAuthentication, getUnCompletOrdersPage);

// get complete orders page: GET
// adminController
router.get("/completed-orders", adminAuthentication, getCompletOrdersPage);

// get order page: GET
// adminController
router.get("/single-order/:id", adminAuthentication, getSingleOrderPage);

// handel complete order: GET
// adminController
router.get("/complete-order/:id", adminAuthentication, handelCompleteOrder);

// handel delet order: GET
// adminController
router.get("/delete-order/:id", adminAuthentication, handelDeleteOrder);

// all users page: GET
// adminController
router.get("/all-users", adminAuthentication, getUsers);

// handel delet user: GET
// adminController
router.get("/delete-user/:id", adminAuthentication, handelDeleteUser);

module.exports = router;