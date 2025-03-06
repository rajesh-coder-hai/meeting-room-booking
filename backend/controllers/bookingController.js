const Booking = require("../models/Booking");
const Room = require("../models/Room");
// Function to check room availability
const isRoomAvailable = async (roomId, start, end) => {
    const overlappingBooking = await Booking.findOne({
        roomId,
        $or: [
            { start: { $lt: end }, end: { $gt: start } }, // Overlapping condition
        ],
    });

    return !overlappingBooking; // If no overlapping booking, room is available
};

// Book a meeting room
exports.bookRoom = async (req, res) => {
    //   console.log("booking room userid", { userid: req.user, body: req.body });

    const { roomId, start, end } = req.body;
    //check if room is available
    const available = await isRoomAvailable(roomId, start, end);
    console.log("available---", available);

    if (!available) {
        return res
            .status(400)
            .json({ error: "Room not available during the time slot." });
    }
    try {
        const booking = await Booking.create({
            ...req.body,
            user: req.user._id,
        });
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: "Error booking room", error });
    }
};

// View booked rooms for logged-in user (with date range)
exports.viewMyBookings = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const bookings = await Booking.find({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }).populate("room");
        res.json(bookings);
    } catch (error) {
        res.status(400).json({ message: "Error fetching bookings", error });
    }
};

exports.viewBookingsByDateRange = async (req, res) => {
    const { startDate, endDate, roomId } = req.query;
    try {
        const bookings = await Booking.find({
            roomId: roomId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }).populate("room");
        res.json(bookings);
    } catch (error) {
        res.status(400).json({ message: "Error fetching bookings", error });
    }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await Booking.findOneAndDelete({
            _id: id,
            user: req.user._id,
        });
        if (!booking) return res.status(404).json({ message: "You are not allowed to cancel this meeting." });
        res.json({ message: "Booking canceled" });
    } catch (error) {
        res.status(400).json({ message: "Error canceling booking", error });
    }
};

// Get all rooms
