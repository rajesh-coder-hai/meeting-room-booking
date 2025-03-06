const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User'); // Import your User model

require('dotenv').config(); // Load environment variables

passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_VALUE,
    callbackURL: "http://localhost:5000/auth/microsoft/callback", // Match your Redirect URI
    scope: ["user.read"],
    authorizationURL: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`, // ✅ Correct
    tokenURL: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // console.log('**** Profile:', profile);
        
        // 1. Find or Create User
        let user = await User.findOne({ microsoftId: profile.id });

        if (!user) {
            user = new User({
                microsoftId: profile.id,
                displayName: profile.displayName,
                email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null, // Handle potential missing email
                // Add other fields as needed from the profile
            });
            await user.save();
        }

        // 2. Call `done` to signal success
        return done(null, user); // Pass the user object to the next middleware

    } catch (err) {
        return done(err); // Pass any errors to Passport
    }
}));

// Serialize user (store user ID in session)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user (retrieve user from ID)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;