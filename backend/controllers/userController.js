// const User = require('../models/User');

exports.userProfile = async (req, res) => {
    try {
        console.log('req.user:', req.user);
        res.json(req.user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}