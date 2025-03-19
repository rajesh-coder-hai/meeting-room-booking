const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    microsoftId: { type: String, required: true, unique: true },
    displayName: { type: String },
    refreshToken: { type: String },
    isAdministrator: { type: Boolean, default: false },
    email: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
