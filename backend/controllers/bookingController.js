const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Book a meeting room
exports.bookRoom = async (req, res) => {
    const { roomId, date, startTime, endTime } = req.body;
    try {
        const booking = await Booking.create({
            user: req.user._id,
            room: roomId,
            date,
            startTime,
            endTime
        });
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: 'Error booking room', error });
    }
};

// View booked rooms for logged-in user (with date range)
exports.viewBookings = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const bookings = await Booking.find({
            user: req.user._id,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).populate('room');
        res.json(bookings);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching bookings', error });
    }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await Booking.findOneAndDelete({ _id: id, user: req.user._id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json({ message: 'Booking canceled' });
    } catch (error) {
        res.status(400).json({ message: 'Error canceling booking', error });
    }
};

// Get all rooms
