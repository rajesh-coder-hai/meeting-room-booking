const Booking = require("../models/Booking");
const { createCalenderEventWithBooking } = require("./msgraphUtilController");
const Room = require("../models/Room");
const handleApiError = require("../utils/errorHandler");

// Function to check room availability
const isRoomAvailable = async (roomId, start, end, meetingId = null) => {
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

function getFloorName(floorNumber) {
    if (floorNumber === 0) {
        return "Ground";
    }
    if (floorNumber === -1) {
        return "Lower ground";
    }

    // Determine the suffix for the floor number
    const suffix = (n) => {
        if (n === 1) return 'st';
        if (n === 2) return 'nd';
        if (n === 3) return 'rd';
        return 'th'; // For numbers other than 1, 2, 3
    };

    // Handle positive floor numbers
    return `${Math.abs(floorNumber)}${suffix(Math.abs(floorNumber))} floor`;
}

// Book a meeting room
exports.bookRoom = async (req, res) => {
    const token = req.accessToken
    const { roomId, startDateTime, endDateTime, subject, attendees, isAllDay, description, teamName } = req.body;
    //check if room is available
    const available = await isRoomAvailable(roomId, startDateTime, endDateTime);
    // console.log("ms token---", token);

    if (!available) {
        return res
            .status(400)
            .json({ error: "Room not available during the time slot." });
    }

    const room = await Room.findById(roomId);
    const floorName = getFloorName(room.floorNo);
    try {

        //create calender event
        const eventResponse = await createCalenderEventWithBooking({
            userId: req.user.microsoftId,
            subject,
            startDateTime,
            endDateTime,
            attendees,
            accessToken: token,
            location: `CONF - ${room.roomName} ${floorName}`,
            isAllDay,
        }, res);

        const bookingResponse = await Booking.create({
            ...req.body,
            user: req.user._id,
        });

        console.log("calender event data booking controller", bookingResponse);
        res.status(201).json(eventResponse);
    } catch (error) {
        handleApiError(error, res, "Fail to book room");
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
        handleApiError(error, res, "Error fetching bookings");
    }
};

exports.viewBookingsByDateRange = async (req, res) => {
    const { startDate, endDate, roomId } = req.query;

    try {
        if (!startDate || !endDate || !roomId) {
            return res
                .status(400)
                .json({ message: "Missing required query parameters" });
        }

        const bookings = await Booking.find({
            roomId,
            $or: [
                {
                    start: { $lte: startDate },
                    end: { $gte: endDate },
                },
            ],
        }).populate("roomId");

        res.json(bookings);
    } catch (error) {
        handleApiError(error, res, "Error fetching bookings by date range");
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
        if (!booking)
            return res
                .status(404)
                .json({ message: "You are not allowed to cancel this meeting." });
        res.json({ message: "Booking canceled" });
    } catch (error) {
        handleApiError(error, res, "Error canceling booking");
    }
};

// update booking by id
exports.updateBookingById = async (req, res) => {
    const { id: bookingId } = req.params;
    try {
        const {
            roomId: { _id: myRoomId },
            start,
            end,
        } = req.body;
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
        if (!booking)
            return res
                .status(404)
                .json({ message: "You are not allowed to update this meeting." });
        res.json(booking);
    } catch (error) {
        handleApiError(error, res, "Error updating booking");
    }
};
