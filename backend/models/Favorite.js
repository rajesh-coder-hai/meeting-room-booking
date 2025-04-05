// models/Favorite.js
const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
    id: { type: String, required: [true, 'Attendee Microsoft Graph ID is required'] }, // Microsoft Graph User ID (GUID)
    mail: { type: String, required: [true, 'Attendee email is required'] },
    displayName: { type: String, required: [true, 'Attendee display name is required'] },
}, { _id: false }); // Don't create separate _id for subdocuments unless needed

const favoriteSchema = new mongoose.Schema({
    // Reference to the user who owns this list
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assumes your User model is named 'User'
        required: true,
        index: true // Add index for faster lookups by user
    },
    // User-defined name for the list
    name: {
        type: String,
        required: [true, 'Favorite list name is required'],
        trim: true
    },
    // Array storing the details of users in this list
    attendees: {
        type: [attendeeSchema],
        validate: [v => Array.isArray(v) && v.length > 0, 'Attendees list cannot be empty'] // Ensure at least one attendee
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Ensure a user cannot have two favorite lists with the same name
favoriteSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);