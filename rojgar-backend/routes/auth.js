const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");


const router = express.Router();
const { signup, verifyOtp, login, setOnboarding, verifyToken, updateRole } = require("../controllers/authController");
const authenticate = require("../middlewares/authenticate"); // Middleware for token verification
const User = require("../models/user");

router.post("/update-role", authenticate, updateRole);

router.get("/get-user", authenticate, (req, res) => {
  const { id, email, role, name } = req.user;
  res.json({ currentRole: role, id, email, name });
});


router.get("/user/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name email role -_id");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({ 
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
});


// Signup Route
router.post("/register", signup);

// OTP Verification Route
router.post("/verify-otp", verifyOtp);

// Google OAuth login route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.redirect("http://localhost:3000/register");
      }

      const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      

      // Check onboarding status and redirect accordingly
      if (user.onBoarding) {
        res.redirect(`http://localhost:3000/dashboard?token=${token}`);
      } else {
        res.redirect(`http://localhost:3000/onboarding?token=${token}`);
      }
    } catch (error) {
      console.error("Error during token generation or onboarding check:", error.message);
      res.status(500).send("An error occurred.");
    }
  }
);

// Login Route
router.post("/login", login);

// Onboarding Route
router.post("/set-onboarding", authenticate, setOnboarding);

// Token Verification Route
router.post("/verify-token", verifyToken);

module.exports = router;
