import { jwtDecode } from "jwt-decode"; // Corrected import
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const authToken = localStorage.getItem("token");
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    if (authToken) {
      try {
        const decodedToken = jwtDecode(authToken);
        setUserName(decodedToken.name); // Set the user name from token
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, [authToken]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-blue-500 text-white">
      <h1 className="text-5xl font-bold mb-4">Welcome to Rojgar</h1>
      <p className="text-lg mb-6">
        A platform connecting freelancers with clients. Explore jobs and find opportunities!
      </p>

      {authToken ? (
        <div className="text-center">
          <h2 className="text-3xl mb-4">Welcome, {userName || "User"}!</h2>
          <Link to="/dashboard" className="bg-white text-blue-500 px-6 py-2 rounded-lg shadow-lg hover:bg-gray-200">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="flex gap-4">
          <a href="/login" className="bg-white text-blue-500 px-6 py-2 rounded-lg shadow-lg hover:bg-gray-200">
            Login
          </a>
          <a href="/signup" className="bg-white text-blue-500 px-6 py-2 rounded-lg shadow-lg hover:bg-gray-200">
            Signup
          </a>
        </div>
      )}
    </div>
  );
}

export default Home;
