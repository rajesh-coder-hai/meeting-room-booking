const express = require('express');
const router = express.Router();
const passport = require('../config/passport'); // 
const jwt = require('jsonwebtoken');

// Route to initiate Microsoft login
router.get('/microsoft', passport.authenticate('microsoft'));

// Callback route (Microsoft redirects here after authentication)
router.get('/microsoft/callback',
    passport.authenticate('microsoft', {
        failureRedirect: '/login', // Redirect on failure
        //  successRedirect: 'http://localhost:3000/rooms'
    }),
    (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication failed" });
        }
        const token = jwt.sign(
            { userId: req.user.microsoftId, 
                accessToken: req.user.accessToken
             },  // Payload
            process.env.JWT_SECRET,   // Secret key
            { expiresIn: '1d' }       // Expiry time
        );
        res.redirect(`${process.env.CLIENT_URL}/rooms?token=${token}&refreshToken=${req.user.refreshToken}`);
    }
);

// Logout Route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }

        req.session.destroy(() => {
            res.redirect(`https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/logout?post_logout_redirect_uri=${process.env.CLIENT_URL}`);
        });
    });
});

module.exports = router;