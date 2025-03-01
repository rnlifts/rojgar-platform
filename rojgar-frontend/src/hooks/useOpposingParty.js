// src/hooks/useOpposingParty.js
import axios from 'axios';
import { useEffect, useState } from 'react';

export const useOpposingParty = (proposal) => {
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [opposingParty, setOpposingParty] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/get-user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setUserRole(response.data.currentRole);
        setCurrentUserId(response.data.id);

        if (proposal) {
          const opposingPartyData = response.data.currentRole === "Client" 
            ? proposal.freelancerId 
            : proposal.clientId;
          setOpposingParty(opposingPartyData);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Failed to load user details");
      }
    };

    fetchUserDetails();
  }, [proposal]);

  return { userRole, currentUserId, opposingParty, error };
};