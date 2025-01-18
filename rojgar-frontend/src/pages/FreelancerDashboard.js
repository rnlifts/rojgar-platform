import React from "react";

const FreelancerDashboard = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Freelancer Dashboard</h2>
      <p>Manage your freelancing projects, proposals, and interests.</p>

      {/* Freelancer-Specific Actions */}
      <button className="px-4 py-2 bg-blue-500 text-white rounded mt-4">Create a Proposal</button>
      {/* More actions like viewing proposals or completed projects can be added here */}
    </div>
  );
};

export default FreelancerDashboard;
