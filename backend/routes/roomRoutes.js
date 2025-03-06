const express = require('express');
const { getRooms, addRoom, bulkUploadRooms } = require('../controllers/roomController');
const router = express.Router();

router.get('/', getRooms);
router.post('/', addRoom); // Assuming admin functionality
// Route to bulk upload rooms
router.post('/bulk-upload', bulkUploadRooms);
module.exports = router;
