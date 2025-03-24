// models/CoreConfiguration.js
const mongoose = require('mongoose');

const coreConfigurationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "roomFilter", "userSettings", "appTheme"
    type: { type: String, required: true }, // e.g., "filter", "settings", "theme"
    configData: { type: mongoose.Schema.Types.Mixed, required: true }, // Store *any* JSON object here
    active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('CoreConfiguration', coreConfigurationSchema);