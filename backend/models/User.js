const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    microsoftId: { type: String, required: true, unique: true },
    displayName: { type: String },
    email: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
