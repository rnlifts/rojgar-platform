import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const Overview = () => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get("proposalId");

  const [jobDetails, setJobDetails] = useState(null);
  const [proposalDetails, setProposalDetails] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingProposal, setLoadingProposal] = useState(true);
  const [errorJob, setErrorJob] = useState(null);
  const [errorProposal, setErrorProposal] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [opposingPartyDetails, setOpposingPartyDetails] = useState(null);

  // Fetch user details
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/api/auth/get-user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUserDetails({
            name: res.data.name,
            email: res.data.email,
            role: res.data.currentRole,
            id: res.data.id
          });
        })
        .catch((err) => {
          console.error("Failed to fetch user details:", err);
        });
    }
  }, []);

  // Fetch job details
  useEffect(() => {
    if (jobId) {
      axios
        .get(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          if (res.data.success) {
            setJobDetails(res.data.job);
          } else {
            setErrorJob("Job not found.");
          }
        })
        .catch((err) => {
          setErrorJob("Error fetching job details.");
        })
        .finally(() => {
          setLoadingJob(false);
        });
    }
  }, [jobId]);

  // Fetch proposal details
  useEffect(() => {
    if (proposalId) {
      axios
        .get(`http://localhost:5000/api/proposals/${proposalId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          if (res.data.success) {
            setProposalDetails(res.data.proposal);
          } else {
            setErrorProposal("Proposal not found.");
          }
        })
        .catch((err) => {
          setErrorProposal("Error fetching proposal details.");
        })
        .finally(() => {
          setLoadingProposal(false);
        });
    }
  }, [proposalId]);

  useEffect(() => {
    const fetchOpposingParty = async () => {
      if (!proposalDetails || !userDetails) return;
  
      // Get the ID string from the opposing party object
      const opposingPartyId = userDetails.role === "Client" 
        ? proposalDetails.freelancerId._id || proposalDetails.freelancerId
        : proposalDetails.clientId._id || proposalDetails.clientId;
  
      console.log("Opposing Party ID:", opposingPartyId);
  
      if (!opposingPartyId) {
        console.error("No opposing party ID found");
        return;
      }
  
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/user/${opposingPartyId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        
        if (response.data.user) {
          setOpposingPartyDetails(response.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch opposing party details:", err);
      }
    };
  
    fetchOpposingParty();
  }, [proposalDetails, userDetails]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Overview</h2>
      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Job Details Section */}
        <div className="md:w-1/2 p-4 border rounded">
          <h3 className="text-xl font-semibold mb-2">Job Details</h3>
          {loadingJob ? (
            <p>Loading job details...</p>
          ) : errorJob ? (
            <p className="text-red-500">{errorJob}</p>
          ) : jobDetails ? (
            <div>
              <p className="text-2xl font-bold text-gray-800">{jobDetails.title}</p>
              <p className="text-gray-600 mt-2">{jobDetails.description}</p>
              <p className="font-semibold mt-2">Budget: ${jobDetails.budget}</p>
              <p className="mt-2">Status: {jobDetails.status}</p>
            </div>
          ) : (
            <p>No job details available.</p>
          )}
        </div>

        {/* Proposal Details Section */}
        <div className="md:w-1/2 p-4 border rounded mt-6 md:mt-0">
          <h3 className="text-xl font-semibold mb-2">Proposal Details</h3>
          {loadingProposal ? (
            <p>Loading proposal details...</p>
          ) : errorProposal ? (
            <p className="text-red-500">{errorProposal}</p>
          ) : proposalDetails ? (
            <div>
              <p className="text-2xl font-bold text-gray-800">
                Bid: ${proposalDetails.bidAmount}
              </p>
              <p className="text-gray-600 mt-2">
                Cover Letter: {proposalDetails.coverLetter}
              </p>
              <p className="font-semibold mt-2">Status: {proposalDetails.status}</p>
            </div>
          ) : (
            <p>No proposal details available.</p>
          )}
        </div>
      </div>

      {/* Parties Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Parties Involved</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current User */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Your Details ({userDetails?.role})</h4>
            {userDetails ? (
              <div>
                <p>Name: {userDetails.name}</p>
                <p>Email: {userDetails.email}</p>
                
              </div>
            ) : (
              <p>Loading user details...</p>
            )}
          </div>

          {/* Opposing Party */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">
              {userDetails?.role === "Client" ? "Freelancer" : "Client"} Details
            </h4>
            {opposingPartyDetails ? (
              <div>
                <p>Name: {opposingPartyDetails.name}</p>
                <p>Email: {opposingPartyDetails.email}</p>
                
              </div>
            ) : (
              <p>Loading opposing party details...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;