// models/Order.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Sub-schema for items within an order
const orderItemSchema = new Schema(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem", // Reference to the MenuItem ordered
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtOrderTime: {
      // Store price to avoid issues if MenuItem price changes later
      type: Number,
      required: true,
    },
    selectedOptions: {
      // Store selected customizations
      sweetness: {
        type: String, // e.g., 'no_sugar', 'low_sweet', 'normal_sweet'
        enum: ["no_sugar", "low_sweet", "normal_sweet", null], // Allow null if not applicable
      },
      // Add other selected options corresponding to customizableOptions in MenuItem
    },
  },
  { _id: false }
); // Don't create a separate _id for sub-documents unless needed

const orderSchema = new Schema(
  {
    user: {
      // Changed from userId to user for clarity, linking to your User model
      type: Schema.Types.ObjectId,
      ref: "User", // Assuming your User model is named 'User'
      required: true,
      index: true,
    },
    orderTime: {
      type: Date,
      default: Date.now,
    },
    items: [orderItemSchema], // Array of ordered items using the sub-schema
    totalPrice: {
      type: Number,
      required: true,
    },
    deliveryLocationType: {
      type: String,
      required: true,
      enum: ["meeting_room", "canteen"],
    },
    deliveryLocationDetails: {
      // Stores Meeting Room ID or 'Canteen'
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
      default: "pending",
      index: true, // Index for querying orders by status
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model("Order", orderSchema);
