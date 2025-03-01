import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-white p-4 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Workspace</h2>
      <div className="space-y-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`w-full p-2 rounded-lg ${
            activeTab === "overview" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`w-full p-2 rounded-lg ${
            activeTab === "chat" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`w-full p-2 rounded-lg ${
            activeTab === "tasks" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`w-full p-2 rounded-lg ${
            activeTab === "files" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          Files
        </button>
      </div>
    </div>
  );
};

export default Sidebar;