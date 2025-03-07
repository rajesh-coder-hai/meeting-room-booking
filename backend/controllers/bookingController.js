const Booking = require("../models/Booking");
// const Room = require("../models/Room");

// Function to check room availability
const isRoomAvailable = async (roomId, start, end, meetingId=null) => {
    const overlappingBooking = await Booking.findOne({
        roomId,
        $or: [
            { start: { $lt: end }, end: { $gt: start } }, // Overlapping condition
        ],
    });
if (overlappingBooking && overlappingBooking._id.toString() === meetingId) {
    return true; // Room is not available
}
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
        if (!startDate || !endDate || !roomId) {
            return res.status(400).json({ message: "Missing required query parameters" });
        }

        const bookings = await Booking.find({
            roomId,
            $or: [
                {
                    start: { $lte: endDate },
                    end: { $gte: startDate }
                },
            ],
        }).populate("roomId");

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Internal server error", error });
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

// update booking by id
exports.updateBookingById = async (req, res) => {
    const { id: bookingId } = req.params;
    try {
        const { roomId: { _id: myRoomId }, start, end } = req.body;
        //check if room is available
        const available = await isRoomAvailable(myRoomId, start, end, bookingId);
        console.log("available---", available);

        if (!available) {
            return res
                .status(400)
                .json({ error: "Room not available during the time slot." });
        }

        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: "You are not allowed to update this meeting." });
        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: "Error updating booking", error });
    }
};
