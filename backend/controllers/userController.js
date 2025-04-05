// const User = require('../models/User');

const handleApiError = require("../utils/errorHandler");

exports.userProfile = async (req, res) => {
    try {
        console.log('req.user:', req.user);
        res.json(req.user);
    } catch (error) {
        console.error(error);
        handleApiError(error, res, "error fetching user profile");
    }
}