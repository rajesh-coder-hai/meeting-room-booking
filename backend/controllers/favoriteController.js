const Favorite = require("../models/Favorite");
const handleApiError = require("../utils/errorHandler");

// --- Create a new Favorite List ---
exports.createFavorite = async (req, res) => {
    try {
        const { name, attendees } = req.body;
        const userId = req.user._id; // Assumes req.user is populated by authentication middleware

        // Basic validation (Mongoose validation will also run)
        if (!name || !attendees) {
            return res.status(400).json({ message: 'Name and attendees are required' });
        }
        if (!Array.isArray(attendees) || attendees.length === 0) {
            return res.status(400).json({ message: 'Attendees must be a non-empty array' });
        }
        // You might add more specific attendee validation here if needed

        // Check for duplicate name for this user
        const existingFavorite = await Favorite.findOne({ userId, name });
        if (existingFavorite) {
            return res.status(409).json({ message: `Favorite list with name "${name}" already exists.` }); // 409 Conflict
        }


        const newFavorite = new Favorite({ userId, name, attendees });
        const savedFavorite = await newFavorite.save();

        res.status(201).json(savedFavorite); // 201 Created

    } catch (error) {
        // Handle potential validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        // Handle duplicate key error (from the unique index)
        if (error.code === 11000) {
            return res.status(409).json({ message: `Favorite list with name "${req.body.name}" already exists.` });
        }
        handleApiError(error, res, 'Error creating favorite list');
    }
};

// --- Get all Favorite Lists for the logged-in user ---
exports.getAllFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const favorites = await Favorite.find({ userId }).sort({ name: 1 }); // Sort alphabetically
        res.status(200).json(favorites);
    } catch (error) {
        handleApiError(error, res, 'Error fetching favorite lists');
    }
};

// --- Get a specific Favorite List by ID ---
exports.getFavoriteById = async (req, res) => {
    try {
        const favoriteId = req.params.id;
        const userId = req.user.id;

        const favorite = await Favorite.findOne({ _id: favoriteId, userId }); // Combine find and auth check

        if (!favorite) {
            // Use 404 even if it exists but belongs to another user, for security
            return res.status(404).json({ message: 'Favorite list not found' });
        }

        res.status(200).json(favorite);

    } catch (error) {
        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid favorite list ID format' });
        }
        handleApiError(error, res, 'Error fetching favorite list');
    }
};

// --- Update a Favorite List ---
exports.updateFavorite = async (req, res) => {
    try {
        const favoriteId = req.params.id;
        const userId = req.user.id;
        const { name, attendees } = req.body;

        // Basic validation
        if (!name || !attendees) {
            return res.status(400).json({ message: 'Name and attendees are required' });
        }
        if (!Array.isArray(attendees) || attendees.length === 0) {
            return res.status(400).json({ message: 'Attendees must be a non-empty array' });
        }
        // Check for duplicate name (excluding the current favorite being updated)
        const existingFavorite = await Favorite.findOne({ userId, name, _id: { $ne: favoriteId } });
        if (existingFavorite) {
            return res.status(409).json({ message: `Another favorite list with name "${name}" already exists.` });
        }


        // Find, authorize, update, and return in one go
        const updatedFavorite = await Favorite.findOneAndUpdate(
            { _id: favoriteId, userId }, // Find by ID and ensure ownership
            { $set: { name, attendees } }, // Update these fields
            { new: true, runValidators: true } // Options: return updated doc, run schema validations
        );

        if (!updatedFavorite) {
            // If not found or user doesn't own it
            return res.status(404).json({ message: 'Favorite list not found or you do not have permission to update it' });
        }

        res.status(200).json(updatedFavorite);

    } catch (error) {
        // Handle potential validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        // Handle duplicate key error (from the unique index)
        if (error.code === 11000) {
            return res.status(409).json({ message: `Another favorite list with name "${req.body.name}" already exists.` });
        }
        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid favorite list ID format' });
        }
        handleApiError(error, res, 'Error updating favorite list');
    }
};

// --- Delete a Favorite List ---
exports.deleteFavorite = async (req, res) => {
    try {
        const favoriteId = req.params.id;
        const userId = req.user.id;

        const result = await Favorite.findOneAndDelete({ _id: favoriteId, userId }); // Find by ID and ensure ownership

        if (!result) {
            // If not found or user doesn't own it
            return res.status(404).json({ message: 'Favorite list not found or you do not have permission to delete it' });
        }

        res.status(200).json({ message: 'Favorite list deleted successfully' });

    } catch (error) {
        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid favorite list ID format' });
        }
        handleApiError(error, res, 'Error deleting favorite list');
    }
};