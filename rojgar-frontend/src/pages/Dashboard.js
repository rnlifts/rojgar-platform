import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Ensure correct import
import React, { useEffect, useState } from "react";
import ClientDashboard from "./ClientDashboard"; // Import Client component
import FreelancerDashboard from "./FreelancerDashboard"; // Import Freelancer component

const Dashboard = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Freelancer"); // Default role

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setEmail(decodedToken.email); // Extract email from the token
        fetchUserRole(); // Fetch the role dynamically from the backend
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/auth/get-user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRole(response.data.currentRole);
    } catch (error) {
      console.error("Failed to fetch role:", error);
    }
  };

  const handleRoleToggle = async () => {
    const newRole = role === "Freelancer" ? "Client" : "Freelancer";

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/auth/update-role",
        { newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRole(response.data.currentRole);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white flex flex-col items-start p-4">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <button
          onClick={handleRoleToggle}
          className="w-full text-left px-4 py-2 mt-4 bg-green-500 hover:bg-green-400 rounded-lg"
        >
          Switch to {role === "Freelancer" ? "Client" : "Freelancer"}
        </button>
        <div className="mt-auto w-full">
          <p className="text-sm text-gray-400">Logged in as:</p>
          <p className="text-sm">{email}</p>
          <p className="text-sm mt-2">Current Role: {role}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {role === "Freelancer" && <FreelancerDashboard />}
          {role === "Client" && <ClientDashboard />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
