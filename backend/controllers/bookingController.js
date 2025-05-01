const Booking = require("../models/Booking");
const { createCalenderEventWithBooking } = require("./msgraphUtilController");
const Room = require("../models/Room");
const handleApiError = require("../utils/errorHandler");
const moment = require("moment"); // Import moment
// const handleApiError = require('../utils/errorHandler'); // Assuming you have this utility
const mongoose = require("mongoose");

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
    if (n === 1) return "st";
    if (n === 2) return "nd";
    if (n === 3) return "rd";
    return "th"; // For numbers other than 1, 2, 3
  };

  // Handle positive floor numbers
  return `${Math.abs(floorNumber)}${suffix(Math.abs(floorNumber))} floor`;
}

// Book a meeting room
exports.bookRoom = async (req, res) => {
  const token = req.accessToken;
  const {
    roomId,
    startDateTime,
    endDateTime,
    subject,
    attendees,
    isAllDay,
    description,
    teamName,
  } = req.body;
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
    //just book the room
    if (!attendees.length) {
      const bookingResponse = await Booking.create({
        ...req.body,
        user: req.user._id,
      });
      return res.status(201).json({
        message: "Room booked successfully",
        data: bookingResponse,
      });
    }
    //create calender event
    const eventResponse = await createCalenderEventWithBooking(
      {
        userId: req.user.microsoftId,
        subject,
        startDateTime,
        endDateTime,
        attendees,
        accessToken: token,
        location: `CONF - ${room.roomName} ${floorName}`,
        isAllDay,
      },
      res
    );

    let finalResponse = {
      ...eventResponse,
      ...bookingResponse,
    };
    console.log("calender event data booking controller", finalResponse);
    res.status(201).json({
      message: "Room booked successfully",
      data: finalResponse,
    });
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
  // Renamed function for clarity
  const { identifier, roomId } = req.query; // Get identifier and roomId

  // --- Input Validation ---
  if (!roomId || !identifier) {
    return res.status(400).json({
      message: "Missing required query parameters: roomId and identifier",
    });
  }

  // Validate roomId format (optional but recommended)
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({ message: "Invalid roomId format" });
  }

  const normalizedIdentifier = identifier.toLowerCase(); // Normalize to lowercase
  const allowedIdentifiers = ["day", "week", "month"];

  if (!allowedIdentifiers.includes(normalizedIdentifier)) {
    return res
      .status(400)
      .json({ message: "Invalid identifier. Use 'day', 'week', or 'month'." });
  }

  try {
    // --- Calculate Date Range using Moment.js (UTC) ---
    const now = moment.utc(); // Get current time in UTC
    let startDate, endDate;

    switch (normalizedIdentifier) {
      case "day":
        startDate = now.clone().startOf("day").toDate(); // Start of today UTC
        endDate = now.clone().startOf("day").add(1, "day").toDate(); // Start of tomorrow UTC
        break;
      case "week":
        // Common default: Week starts on Sunday.
        // For ISO week (starts Monday), use .startOf('isoWeek') and .add(1, 'week')
        startDate = now.clone().startOf("week").toDate(); // Start of current week (Sunday) UTC
        endDate = now.clone().startOf("week").add(1, "week").toDate(); // Start of next week (Sunday) UTC
        break;
      case "month":
        startDate = now.clone().startOf("month").toDate(); // Start of current month UTC
        endDate = now.clone().startOf("month").add(1, "month").toDate(); // Start of next month UTC
        break;
      // Default case is handled by initial validation
    }

    console.log(
      `Querying Bookings - Room: ${roomId}, Identifier: ${normalizedIdentifier}, Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`
    );

    // --- Database Query ---
    const queryCriteria = {
      roomId: roomId, // Filter by the specific room
      startDateTime: { $lt: endDate }, // Booking starts *before* the calculated range ends
      endDateTime: { $gt: startDate }, // Booking ends *after* the calculated range starts
    };

    console.log(
      "Executing Mongoose Find Query:",
      JSON.stringify(queryCriteria, null, 2)
    );

    const bookings = await Booking.find(queryCriteria)
      .sort({ startDateTime: 1 }) // Sort by start time
      // .populate("user", "displayName email") // Optional: populate user details
      .lean(); // Use lean for performance

    console.log(`Found ${bookings.length} bookings.`);

    res.status(200).json(bookings); // Send the results
  } catch (error) {
    console.log(
      `Error fetching bookings for identifier '${identifier}':`,
      error
    );
    handleApiError(
      error,
      res,
      `Error fetching bookings for identifier '${identifier}'`
    );
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
