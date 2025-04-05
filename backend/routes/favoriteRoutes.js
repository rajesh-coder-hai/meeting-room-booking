// routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');


// POST /api/favorites - Create a new favorite list
router.post('/', favoriteController.createFavorite);

// GET /api/favorites - Get all favorite lists for the logged-in user
router.get('/', favoriteController.getAllFavorites);

// GET /api/favorites/:id - Get a specific favorite list by ID
router.get('/:id', favoriteController.getFavoriteById);

// PUT /api/favorites/:id - Update a favorite list
router.put('/:id', favoriteController.updateFavorite);

// DELETE /api/favorites/:id - Delete a favorite list
router.delete('/:id', favoriteController.deleteFavorite);

module.exports = router;