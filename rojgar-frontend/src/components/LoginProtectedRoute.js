import React from "react";
import { Navigate } from "react-router-dom";

function LoginProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
}

export default LoginProtectedRoute;
