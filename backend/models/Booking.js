const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", // Assuming you have a Room model
      required: true,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    teamName: {
      type: String,
      trim: true,
      default: null, // Optional field
    },
    description: {
      type: String,
      trim: true,
      default: null, // Optional field
    },
    extendedProps: {
      type: mongoose.Schema.Types.Mixed, // Allows any object structure
      default: {},
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    attendees: {
      type: mongoose.Schema.Types.Array,
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);


const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
