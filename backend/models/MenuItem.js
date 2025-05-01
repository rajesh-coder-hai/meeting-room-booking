// models/MenuItem.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const menuItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      // Optional: URL to the image
      type: String,
      trim: true,
    },
    category: {
      // e.g., 'Beverage', 'Snack', 'Hot Food'
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      // To control visibility in the user menu
      type: Boolean,
      default: true,
      index: true, // Index for faster querying of active items
    },
    customizableOptions: {
      sweetness: {
        // Example customization
        type: Boolean,
        default: false, // Set to true if this item offers sweetness levels
      },
      // Add other customization flags here if needed, e.g., 'size', 'milkType'
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model("MenuItem", menuItemSchema);
