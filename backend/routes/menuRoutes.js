// routes/menuRoutes.js
const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController"); // Import the controller
// --- Admin Menu Routes ---
router.post("/", menuController.createMenuItem);
router.get("/admin", menuController.getMenuItemsAdmin);
router.put("/:id", menuController.updateMenuItem);
router.delete("/:id", menuController.deleteMenuItem);

// --- User Menu Route ---
router.get("/", menuController.getMenuItemsUser); // Get active menu items

module.exports = router;
