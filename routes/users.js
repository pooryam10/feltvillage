
const express = require('express');

const { getRegisterPage, getLoginPage, handelRegister, handelLogin, getProfile } = require('../controllers/userController');
const { authentication } = require('../middlewares/auth');

const router = express.Router();

// register page: GET
// usersController
router.get("/register", getRegisterPage);

// register page: POST
// post for register person
// usersController
router.post("/register", handelRegister);

// login page: GET
// usersController
router.get("/login", getLoginPage);

// login page: POST
// usersController
router.post("/login", handelLogin);

// profile page: GET
// usersController
router.get("/profile", authentication, getProfile);

module.exports = router;