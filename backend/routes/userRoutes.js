const express = require('express');
const router = express.Router();
const { userProfile } = require('../controllers/userController');

router.get('/profile', userProfile);

module.exports = router;
