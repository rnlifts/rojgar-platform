const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Google OAuth login route
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }), // Redirect to "/" on failure
    (req, res) => {
        try {
            // Debug: Log the user object from Passport
            console.log("User from Passport:", req.user);

            // Generate JWT token
            const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
                expiresIn: "1h", // Token expires in 1 hour
            });

            // Debug: Log the generated token
            console.log("Generated Token:", token);

            // Redirect to the frontend with the token
            res.redirect(`http://localhost:3000/dashboard?token=${token}`);
        } catch (error) {
            console.error("Error during token generation or redirection:", error.message);
            res.status(500).send("An error occurred.");
        }
    }
);

module.exports = router;
