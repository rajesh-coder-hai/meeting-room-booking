// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');

// const SECRET_KEY = process.env.JWT_SECRET;

// get User profile
exports.userProfile = async (req, res) => {
    try {
        // const user = await User.findById(req.user.id
        // );
        console.log('req.user:', req.user);
        res.json(req.user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}