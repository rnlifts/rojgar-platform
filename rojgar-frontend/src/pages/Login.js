import axios from "axios";
import googleLogo from '../logo/google.png';

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Save the token in localStorage
      localStorage.setItem("token", response.data.token);

      // Check onboarding status
      if (response.data.onBoarding === false) {
        toast.success("Login successful! Redirecting to onboarding...");
        setTimeout(() => navigate("/OnBoarding"), 2000); // Redirect to onboarding page
      } else {
        toast.success("Login successful! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 2000); // Redirect to dashboard
      }
    } catch (error) {
      // Show error toast message
      toast.error(error.response?.data?.message || "An error occurred during login.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to Rojgar</h2>
        <form onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg">
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account? <a href="/signup" className="text-blue-500 underline">Sign up</a>
        </p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => (window.location.href = "http://localhost:5000/api/auth/google")}
            className="flex items-center bg-gray-500 text-white py-2 px-4 rounded-lg"
          >
           <img src={googleLogo} alt="Google logo" className="h-5 w-5 mr-2" />

            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
