import React, { useEffect } from "react";

const Dashboard = () => {
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (token) {
      try {
        localStorage.setItem("token", token);
        window.history.replaceState(null, "", window.location.pathname);
        window.location.href = "/Dashbaord";
      } catch (error) {
        console.error("Error saving token in localStorage:", error);
      }
    } else {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        window.location.href = "/login";
      }
    }
  }, []);

  return <div>CHECKING SECURITY</div>;
};

export default Dashboard;
