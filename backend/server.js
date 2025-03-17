const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport'); 
const authRoutes = require('./routes/auth'); 
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const msGraphUtil = require('./routes/msGraphutil');

const bookingRoutes = require('./routes/bookingRoutes');
const { protect } = require('./middlewares/authMiddleware');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}));

// Session middleware (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true } // Use this in production with HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); // Use persistent login sessions
app.use('/auth', authRoutes);



// Use routes correctly
app.use('/api/rooms', roomRoutes);
app.use('/api/users',protect, userRoutes);
app.use('/api/ms-graph-util',protect, msGraphUtil);

app.use('/api/bookings',protect, bookingRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.DB_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.log('DB Connection Error:', err));
