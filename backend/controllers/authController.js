const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const handleApiError = require('../utils/errorHandler');

// Register user
exports.register = async (req, res) => {
    const { name, email, userId, password } = req.body;
    try {
        const user = await User.create({ name, email, userId, password });
        const token = generateToken(user._id);
        res.status(201).json({ user, token });
    } catch (error) {
        handleApiError(error, res, "Error creating user");
    }
};

// Login user
exports.login = async (req, res) => {
    const { email, userId, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ email }, { userId }] });
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id);
            res.json({ user, token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        handleApiError(error, res, "Error logging in user");
    }
};

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '5d' });
};
