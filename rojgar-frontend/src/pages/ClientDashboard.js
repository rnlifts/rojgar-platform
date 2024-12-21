import React from "react";

const ClientDashboard = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Hiring Dashboard</h2>
      <p>Here you can post jobs, view applications, and hire freelancers.</p>
      {/* Add more UI and logic for client-specific actions */}
      <button className="px-4 py-2 bg-green-500 text-white rounded">Post a Job</button>
    </div>
  );
};

export default ClientDashboard;
