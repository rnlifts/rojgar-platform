const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  role: {
    type: String,
    enum: ["Freelancer", "Client"],
    default: "Freelancer",
  },
  onBoarding: { type: Boolean, default: false },
  interests: { type: [String], default: [] }, // Array of predefined and custom interests
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
