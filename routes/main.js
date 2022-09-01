
const express = require('express');

const { getMainPage } = require('../controllers/mainController');

const router = express.Router();

// main page route: GET
// mainController
router.get("/", getMainPage);

module.exports = router;