import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Track loading state

    useEffect(() => {
        console.log("ProtectedRoute useEffect triggered");

        const token = localStorage.getItem("authToken");
        console.log("ProtectedRoute: Token in localStorage:", token);

        if (token) {
            setIsAuthenticated(true);
        } else {
            console.log("No token found in ProtectedRoute.");
        }

        setLoading(false); // End loading
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Show a loading message while checking authentication
    }

    if (!isAuthenticated) {
        console.log("Redirecting to login...");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
