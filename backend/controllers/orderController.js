// controllers/orderController.js
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const notificationService = require("../services/notificationService"); // Import the service
const mongoose = require("mongoose"); // Needed for transaction

const orderController = {
  /**
   * @desc    Place a new order
   * @route   POST /api/orders
   * @access  Private (Authenticated Users)
   */
  placeOrder: async (req, res) => {
    const session = await mongoose.startSession(); // Start a transaction session
    session.startTransaction();
    try {
      const { cartItems, deliveryInfo } = req.body;
      const userId = req.user._id; // Assuming authMiddleware attaches user object with _id

      // Basic Validation
      if (!cartItems || cartItems.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Cart is empty." });
      }
      if (
        !deliveryInfo ||
        !deliveryInfo.deliveryLocationType ||
        !deliveryInfo.deliveryLocationDetails
      ) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Delivery information is required." });
      }
      if (
        !["meeting_room", "canteen"].includes(deliveryInfo.deliveryLocationType)
      ) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Invalid delivery location type." });
      }

      let calculatedTotalPrice = 0;
      const orderItems = [];

      // Fetch item details and validate cart server-side
      for (const item of cartItems) {
        const menuItem = await MenuItem.findById(item.menuItemId).session(
          session
        ); // Run query within session

        if (!menuItem) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({
            message: `Menu item with ID ${item.menuItemId} not found.`,
          });
        }
        if (!menuItem.isActive) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `Menu item '${menuItem.name}' is currently unavailable.`,
          });
        }

        // Validate sweetness option if provided
        let sweetnessOption = null;
        if (
          menuItem.customizableOptions?.sweetness &&
          item.selectedOptions?.sweetness
        ) {
          if (
            ["no_sugar", "low_sweet", "normal_sweet"].includes(
              item.selectedOptions.sweetness
            )
          ) {
            sweetnessOption = item.selectedOptions.sweetness;
          } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              message: `Invalid sweetness option for ${menuItem.name}.`,
            });
          }
        } else if (
          item.selectedOptions?.sweetness &&
          !menuItem.customizableOptions?.sweetness
        ) {
          // User provided sweetness for an item that doesn't support it
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `${menuItem.name} does not support sweetness customization.`,
          });
        }

        const itemPrice = menuItem.price;
        calculatedTotalPrice += itemPrice * item.quantity;

        orderItems.push({
          menuItem: menuItem._id,
          quantity: item.quantity,
          priceAtOrderTime: itemPrice,
          selectedOptions: {
            sweetness: sweetnessOption,
            // Add other options here if needed
          },
        });
      }

      // Create the order
      const newOrder = new Order({
        user: userId,
        items: orderItems,
        totalPrice: calculatedTotalPrice,
        deliveryLocationType: deliveryInfo.deliveryLocationType,
        deliveryLocationDetails: deliveryInfo.deliveryLocationDetails,
        // status defaults to 'pending'
      });

      const savedOrder = await newOrder.save({ session }); // Save within the transaction

      // If order saved successfully, commit transaction
      await session.commitTransaction();
      session.endSession();

      // --- Trigger Notifications Asynchronously (Fire and Forget) ---
      // We fetch the order again with populated items for the notification content
      const populatedOrder = await Order.findById(savedOrder._id).populate(
        "items.menuItem",
        "name"
      );
      if (populatedOrder.deliveryLocationType === "meeting_room") {
        notificationService
          .sendOrderNotifications(populatedOrder, req.user)
          .catch((err) =>
            console.error(
              `Notification background task failed for Order ${savedOrder._id}:`,
              err
            )
          ); // Log errors from the async task
      }
      // ---------------------------------------------------------

      res.status(201).json(savedOrder); // Respond to client immediately
    } catch (error) {
      // If any error occurred, abort the transaction
      await session.abortTransaction();
      session.endSession();

      console.error("Error placing order:", error);
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: "Order validation failed", errors: error.errors });
      }
      res.status(500).json({ message: "Server error while placing order." });
    }
  },

  /**
   * @desc    Get order history for the logged-in user
   * @route   GET /api/orders/my-history
   * @access  Private (Authenticated Users)
   */
  getMyOrderHistory: async (req, res) => {
    try {
      const userId = req.user._id;
      const orders = await Order.find({ user: userId })
        .populate("items.menuItem", "name imageUrl") // Populate item name and image
        .sort({ orderTime: -1 }); // Show newest first

      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching user order history:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching order history." });
    }
  },

  /**
   * @desc    Get all orders (for Admin/Caterer view)
   * @route   GET /api/orders/all
   * @access  Private (Admin)
   */
  getAllOrders: async (req, res) => {
    try {
      // Add filtering/pagination later if needed (e.g., based on req.query.status)
      const orders = await Order.find()
        .populate("user", "name email") // Populate user's name/email (adjust fields based on your User model)
        .populate("items.menuItem", "name") // Populate item names
        .sort({ orderTime: -1 }); // Show newest first

      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching all orders." });
    }
  },
};

module.exports = orderController;
