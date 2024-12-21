const bcrypt = require("bcrypt");
const sendEmail = require("../utils/emailService");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Temporary storage for unverified users
const tempUsers = new Map();

// Signup Logic
exports.signup = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    if (tempUsers.has(email)) {
      tempUsers.delete(email);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 3600000;

    tempUsers.set(email, {
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
      onBoarding: false,
    });

    await sendEmail(email, "Verify Your Email - Rojgar", `Your OTP: ${otp}`);
    res.status(200).json({ message: "OTP sent to your email. Verify to complete registration." });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Signup failed. Please try again." });
  }
};

// Verify OTP Logic
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!tempUsers.has(email)) {
      return res.status(404).json({ message: "No registration process found. Please sign up again." });
    }

    const tempUser = tempUsers.get(email);

    if (tempUser.otp !== otp || tempUser.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      isVerified: true,
      onBoarding: false,
    });

    await newUser.save();
    tempUsers.delete(email);

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "OTP verification failed." });
  }
};

// Login Logic
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist." });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email before logging in." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      onBoarding: user.onBoarding,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Login failed." });
  }
};

// Set Onboarding Status
exports.setOnboarding = async (req, res) => {
  const { onboarding, interests } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save onboarding status and interests
    user.onBoarding = onboarding;
    if (interests) {
      user.interests = interests;
    }
    await user.save();

    res.status(200).json({ message: "Onboarding updated successfully" });
  } catch (error) {
    console.error("Error updating onboarding:", error);
    res.status(500).json({ message: "Failed to update onboarding status" });
  }
};
