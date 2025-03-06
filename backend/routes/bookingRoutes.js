const express = require('express');
const { bookRoom, viewBookings, cancelBooking } = require('../controllers/bookingController');
const router = express.Router();

router.post('/book', bookRoom);
router.get('/', viewBookings);
router.delete('/:id', cancelBooking);

module.exports = router;
