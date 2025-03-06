const express = require('express');
const { bookRoom, viewMyBookings, cancelBooking, viewBookingsByDateRange } = require('../controllers/bookingController');
const router = express.Router();

router.post('/book', bookRoom);
router.get('/', viewMyBookings);
router.get('/byDateRange', viewBookingsByDateRange);
router.delete('/:id', cancelBooking);

module.exports = router;
