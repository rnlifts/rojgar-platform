import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  useEffect(() => {
    // Check for token in the URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      localStorage.setItem("token", token); // Save token to localStorage
      queryParams.delete("token");
      window.history.replaceState({}, document.title, location.pathname); // Clean up the URL
    } else {
      setRedirectToLogin(true); // No token in URL, redirect to login
    }
    setTokenProcessed(true); // Mark token as processed
  }, [location]);

  const storedToken = localStorage.getItem("token");

  if (redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  if (!tokenProcessed) {
    // Wait until token is processed
    return <div>Loading...</div>;
  }

  if (!storedToken) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children; // Render the child component if authenticated
};

export default ProtectedRoute;
