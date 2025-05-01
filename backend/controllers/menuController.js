// controllers/menuController.js

const MenuItem = require("../models/MenuItem"); // Adjust path as needed

const menuController = {
  /**
   * @desc    Create a new menu item
   * @route   POST /api/menu
   * @access  Private (Admin)
   */
  createMenuItem: async (req, res) => {
    try {
      // Add validation here if needed (e.g., using express-validator)
      if (!req.user?.isAdministrator) {
        return res
          .status(403)
          .json({
            message: "You do not have permission to create menu items.",
          });
      }
      const {
        name,
        description,
        price,
        imageUrl,
        category,
        isActive,
        customizableOptions,
      } = req.body;

      // Basic check for required fields
      if (!name || !price || !category) {
        return res
          .status(400)
          .json({ message: "Name, price, and category are required." });
      }

      const newItem = new MenuItem({
        name,
        description,
        price,
        imageUrl, // Handle image upload logic separately if storing files
        category,
        isActive, // Default is true if not provided
        customizableOptions, // Ensure frontend sends the correct structure
      });

      const savedItem = await newItem.save();
      res.status(201).json(savedItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      // Check for Mongoose validation error
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: "Validation failed", errors: error.errors });
      }
      res
        .status(500)
        .json({ message: "Server error while creating menu item." });
    }
  },

  /**
   * @desc    Get all menu items (for Admin view)
   * @route   GET /api/menu/admin
   * @access  Private (Admin)
   */
  getMenuItemsAdmin: async (req, res) => {
    try {
      // Fetch all items, sort by category then name for consistency
      if (!req.user?.isAdministrator) {
        return res.status(403).json({
          message: "You do not have permission to access menu items.",
        });
      }
      const items = await MenuItem.find().sort({ category: 1, name: 1 });
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching admin menu items:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching menu items." });
    }
  },

  /**
   * @desc    Update a menu item by ID
   * @route   PUT /api/menu/:id
   * @access  Private (Admin)
   */
  updateMenuItem: async (req, res) => {
    try {
      if (!req.user?.isAdministrator) {
        return res.status(403).json({
          message: "You do not have permission to access menu items.",
        });
      }
      const { id } = req.params;
      const updateData = req.body;

      // Ensure price is not negative if provided
      if (updateData.price !== undefined && updateData.price < 0) {
        return res.status(400).json({ message: "Price cannot be negative." });
      }

      const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on update
      });

      if (!updatedItem) {
        return res.status(404).json({ message: "Menu item not found." });
      }

      res.status(200).json(updatedItem);
    } catch (error) {
      console.error(`Error updating menu item ${req.params.id}:`, error);
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: "Validation failed", errors: error.errors });
      }
      if (error.kind === "ObjectId") {
        return res
          .status(400)
          .json({ message: "Invalid Menu item ID format." });
      }
      res
        .status(500)
        .json({ message: "Server error while updating menu item." });
    }
  },

  /**
   * @desc    Delete a menu item by ID
   * @route   DELETE /api/menu/:id
   * @access  Private (Admin)
   */
  deleteMenuItem: async (req, res) => {
    if (!req.user?.isAdministrator) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete menu items." });
    }
    // Optional: Add logic here to check if the item is in use before deletion
    // e.g., check if there are any bookings associated with this item
    try {
      const { id } = req.params;

      const deletedItem = await MenuItem.findByIdAndDelete(id);

      if (!deletedItem) {
        return res.status(404).json({ message: "Menu item not found." });
      }

      // Optional: Add logic here to delete associated image file if stored locally

      res.status(200).json({
        message: "Menu item deleted successfully.",
        id: deletedItem._id,
      });
    } catch (error) {
      console.error(`Error deleting menu item ${req.params.id}:`, error);
      if (error.kind === "ObjectId") {
        return res
          .status(400)
          .json({ message: "Invalid Menu item ID format." });
      }
      res
        .status(500)
        .json({ message: "Server error while deleting menu item." });
    }
  },

  /**
   * @desc    Get active menu items (for User view)
   * @route   GET /api/menu
   * @access  Private (Authenticated Users)
   */
  getMenuItemsUser: async (req, res) => {
    try {
      // Fetch only items marked as active
      const items = await MenuItem.find({ isActive: true }).sort({
        category: 1,
        name: 1,
      });
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching user menu items:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching menu items." });
    }
  },
};

module.exports = menuController;
