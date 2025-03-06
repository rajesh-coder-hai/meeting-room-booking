const mongoose = require('mongoose');

// Define the Room Schema
const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
  },
  floorNo: {
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  projector: {
    type: Boolean,
    default: false,
  },
  tvScreen: {
    type: Boolean,
    default: false,
  },
  whiteboard: {
    type: Boolean,
    default: false,
  },
  extensionNumber: {
    type: String,
    required: false,
  }
}, {
  // Enforcing uniqueness on roomName + floorNo combination
  collation: { locale: 'en', strength: 2 },
  timestamps: true,
});

// Create a unique index on roomName and floorNo
roomSchema.index({ roomName: 1, floorNo: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
