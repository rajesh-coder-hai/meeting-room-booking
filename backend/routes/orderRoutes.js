// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController"); // Import

// --- User Order Routes ---
router.post("/", orderController.placeOrder);
router.get("/my-history", orderController.getMyOrderHistory);

// --- Admin/Caterer Order Route ---
router.get("/all", orderController.getAllOrders);

module.exports = router;
