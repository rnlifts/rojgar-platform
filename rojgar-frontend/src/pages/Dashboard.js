import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientDashboard from "./ClientDashboard";
import FreelancerDashboard from "./FreelancerDashboard";

const Dashboard = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Freelancer"); // Default role
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setEmail(decodedToken.email);
        fetchUserRole();
      } catch (error) {
        console.error("Failed to decode token:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <button
          onClick={handleRoleToggle}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-400 rounded-lg"
        >
          Switch to {role === "Freelancer" ? "Client" : "Freelancer"}
        </button>

        <div className="mt-auto">
          <p className="text-sm text-gray-400">Logged in as:</p>
          <p className="text-sm">{email}</p>
          <p className="text-sm mt-2">Current Role: {role}</p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 mt-4 bg-red-500 hover:bg-red-400 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-8 bg-gray-100">
        {role === "Client" && <ClientDashboard />}
        {role === "Freelancer" && <FreelancerDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
