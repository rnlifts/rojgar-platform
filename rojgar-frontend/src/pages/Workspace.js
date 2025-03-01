import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import Chat from "../components/workspaceComponents/Chat";
import Files from "../components/workspaceComponents/Files";
import Overview from "../components/workspaceComponents/Overview";
import Sidebar from "../components/workspaceComponents/Sidebar";
import Tasks_Client from "../components/workspaceComponents/Tasks_client";
import Tasks_Freelancer from "../components/workspaceComponents/Tasks_freelancer";

const Workspace = () => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get("proposalId");
  const [proposal, setProposal] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [opposingPartyDetails, setOpposingPartyDetails] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        jwtDecode(token);
        fetchUserDetails(token);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!proposalId) return;
      try {
        const response = await axios.get(
          `http://localhost:5000/api/proposals/${proposalId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setProposal(response.data.proposal);
      } catch (error) {
        console.error("Failed to fetch proposal:", error);
      }
    };
    fetchProposal();
  }, [proposalId]);

  const fetchUserDetails = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/get-user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { currentRole, id, name, email } = response.data;
      setUserRole(currentRole);
      setUserId(id);
      setUserName(name);
      setUserEmail(email);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  // Fetch opposing party details after proposal and userRole are set
  useEffect(() => {
    const fetchOpposingPartyDetails = async () => {
      if (proposal && userRole) {
        // Determine opposing party ID based on user role
        const opposingPartyId = userRole === "Client" ? proposal.freelancerId : proposal.clientId;
        if (!opposingPartyId) return;
        try {
          const response = await axios.get(
            `http://localhost:5000/api/auth/user/${opposingPartyId}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          setOpposingPartyDetails(response.data.user);
        } catch (error) {
          console.error("Failed to fetch opposing party details:", error);
        }
      }
    };
    fetchOpposingPartyDetails();
  }, [proposal, userRole]);

  // Dummy data for UI preview
  const project = {
    title: "Website Development",
    description: "Develop a fully functional website for a client using MERN stack.",
    budget: 1500,
  };

  const [messages, setMessages] = useState([
    { sender: "Client", content: "Hey, let's discuss the project scope." },
    { sender: "Freelancer", content: "Sure! I have a few questions." },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const [tasks, setTasks] = useState([
    { task: "Set up project repository" },
    { task: "Design homepage UI" },
  ]);
  const [taskInput, setTaskInput] = useState("");

  const [files, setFiles] = useState([
    { filename: "Project_Requirements.pdf", url: "#" },
    { filename: "Wireframe.png", url: "#" },
  ]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { sender: "You", content: newMessage }]);
    setNewMessage("");
  };

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks([...tasks, { task: taskInput }]);
    setTaskInput("");
  };

  const uploadFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFiles([...files, { filename: file.name, url: "#" }]);
  };

  const [activeTab, setActiveTab] = useState("overview");
  console.log("Proposal:", proposal); 
  console.log("clientId:", proposal?.clientId);
  console.log("freelancerId:", proposal?.freelancerId);
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <p className="text-sm text-gray-600">Role: {userRole}</p>
            <p className="text-sm text-gray-600">User ID: {userId}</p>
          </div>

          {activeTab === "overview" && (
            <Overview 
              project={project}
              currentUser={{
                name: userName,
                email: userEmail,
                role: userRole
              }}
              opposingParty={opposingPartyDetails} // Passing the full details here
            />
          )}
        {activeTab === "chat" && (
  <Chat
    proposal={proposal}
    jobId={jobId}
  />
)}
        {activeTab === "tasks" && userRole === "Client" && (
            <Tasks_Client
              tasks={tasks}
              addTask={addTask}
              taskInput={taskInput}
              setTaskInput={setTaskInput}
              proposal={proposal}
              jobId={jobId}

            />
          )}
          
          {activeTab === "tasks" && userRole === "Freelancer" && (
            <Tasks_Freelancer
              tasks={tasks}
              addTask={addTask}
              taskInput={taskInput}
              setTaskInput={setTaskInput}
              proposal={proposal}
              jobId={jobId}
            />
          )}
          {activeTab === "files" && (
  <Files 
  jobId={jobId}
  proposal={proposal}
  opposingPartyDetails={opposingPartyDetails}
 
  />
)}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
