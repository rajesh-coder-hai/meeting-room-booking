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
    start: {
      type: String, // Storing as string, but ideally should be Date
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    teamName: {
      type: String,
      trim: true,
      default: null, // Optional field
    },
    extendedProps: {
      type: mongoose.Schema.Types.Mixed, // Allows any object structure
      default: {},
    },
    allDay: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);


const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
