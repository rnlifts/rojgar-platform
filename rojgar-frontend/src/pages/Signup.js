import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", otp: "" });
  const navigate = useNavigate();

  // Handle input changes for all fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form validation
  const validateForm = () => {
    if (formData.name.trim().length < 3) {
      toast.error("Name must be at least 3 characters long.");
      return false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
  
    // Updated regex to allow special characters
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error(
        "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return false;
    }
  
    return true;
  };
  

  const validateOtp = () => {
    if (!/^\d{6}$/.test(formData.otp)) {
      toast.error("OTP must be a 6-digit number.");
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", formData);
      toast.success(response.data.message);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during signup.");
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      toast.success(response.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up for Rojgar</h2>
        {step === 1 ? (
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Create a password"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg mb-4">
              Sign Up
            </button>

            <div className="flex justify-center items-center mb-4">
              <div className="w-full h-px bg-gray-300"></div>
              <span className="px-2 text-gray-500">OR</span>
              <div className="w-full h-px bg-gray-300"></div>
            </div>

            <button
              onClick={() => (window.location.href = "http://localhost:5000/api/auth/google")}
              className="flex items-center justify-center w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google logo"
                className="h-5 w-5 mr-2"
              />
              Continue with Google
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerification}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter the OTP sent to your email"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg">
              Verify OTP
            </button>
          </form>
        )}
        <p className="mt-4 text-center">
          Already have an account? <a href="/login" className="text-blue-500 underline">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
