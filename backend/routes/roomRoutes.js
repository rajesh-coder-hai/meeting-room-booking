const express = require('express');
const { getRooms, addRoom, bulkUploadRooms, updateRoom, deleteRoom } = require('../controllers/roomController');
const router = express.Router();

router.get('/', getRooms);
router.post('/', addRoom); // Route to add a new room
router.put('/:id', updateRoom); // Route to update a room
router.delete('/:id', deleteRoom); // Route to delete a room


// Route to bulk upload rooms: array of room objects
router.post('/bulk-upload', bulkUploadRooms);
module.exports = router;
