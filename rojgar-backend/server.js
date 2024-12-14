const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config({ path: "./.env" }); // Load .env file
require("./middlewares/passport"); // Load the Passport configuration

// Debug log to check if environment variables are loaded
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON requests
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key", // Replace with a secure secret
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1); // Exit process on failure
    });

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
