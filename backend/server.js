const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const msGraphUtil = require("./routes/msGraphutil");
const bookingRoutes = require("./routes/bookingRoutes");
const configRoutes = require("./routes/configRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const { protect } = require("./middlewares/authMiddleware");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");

require("dotenv").config();

const app = express();
app.use(express.json());
// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173", // Your local frontend
  "https://d369a6nc9a1eio.cloudfront.net", // Add your custom domain here too if you set one up, e.g.:'https://roomsync.yourdomain.com'
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow requests from whitelisted origins
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true } // Use this in production with HTTPS
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); // Use persistent login sessions
app.use("/auth", authRoutes);

// Use routes correctly
app.use("/api/rooms", roomRoutes);
app.use("/api/users", protect, userRoutes);
app.use("/api/ms-graph-util", protect, msGraphUtil);

app.use("/api/bookings", protect, bookingRoutes);

//common config
app.use("/api/configs", protect, configRoutes);

// Mount the favorite routes - requests to /api/favorites will be handled here
app.use("/api/favorites", protect, favoriteRoutes);

//order, menu items routes
app.use("/api/menu", protect, menuRoutes);
app.use("/api/orders", protect, orderRoutes);

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

// Start the server
const PORT = process.env.PORT || 5000;

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    console.log(`Connecting to MongoDB Atlas...`);
    await mongoose.connect(process.env.MONGO_ATLAS_URI, clientOptions); // Use the variable name from your .env file

    // Optional: Ping command to confirm connection (can be removed after testing)
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB Atlas!"
    );

    // *** Start the Express server ONLY AFTER successful DB connection ***
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    // Log the error if connection fails
    console.error("DB Connection Error:", error);
    process.exit(1); // Exit the process if DB connection fails
  }
}

run();
