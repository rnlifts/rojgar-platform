import React, { useEffect } from "react";

const Dashboard = () => {
  useEffect(() => {
    // Check if a token exists in the URL
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (token) {
      console.log("Token found in URL:", token); // Debug log for the token

      // Store the token in localStorage
      try {
        localStorage.setItem("authToken", token);
        console.log("Token successfully stored in localStorage:", localStorage.getItem("authToken"));

        // Optional: Clean up the URL to remove the token
        window.history.replaceState(null, "", window.location.pathname);
      } catch (error) {
        console.error("Error saving token in localStorage:", error);
      }
        } else {
            // If no token is in the URL, check localStorage
            const storedToken = localStorage.getItem("authToken");
            console.log("Dashboard: Stored Token in localStorage:", storedToken);

            if (!storedToken) {
                console.log("Dashboard: No token found. Redirecting to login...");
                // Redirect to login
               
                    window.location.href = "/login";
             
            }
        }

        // Debugging localStorage
        console.log("Dashboard: LocalStorage content after execution:", JSON.stringify(localStorage));
    }, []);

    return <div>Welcome to your Dashboard!</div>;
};

export default Dashboard;
