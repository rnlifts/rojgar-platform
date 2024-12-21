import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      localStorage.setItem("token", token); // Save token to localStorage
      queryParams.delete("token");
      window.history.replaceState({}, document.title, location.pathname); // Clean up the URL
    }

    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      axios
        .post("http://localhost:5000/api/auth/verify-token", { token: storedToken })
        .then((response) => {
          if (response.data.valid) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
        });
    } else {
      setIsAuthenticated(false);
    }
  }, [location]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show loading while verifying
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children; // Render the child component if authenticated
};

export default ProtectedRoute;
