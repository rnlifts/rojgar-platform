import axios from "axios"; // For API requests
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import categoriesData from "../Data/freelancingCategories.json"; // Import JSON file

const OnBoarding = () => {
  const [categories, setCategories] = useState([]); // Categories loaded from JSON
  const [currentStep, setCurrentStep] = useState(0); // Track current category
  const [selectedInterests, setSelectedInterests] = useState([]); // Store selected interests
  const [customInterest, setCustomInterest] = useState(""); // Custom interest input
  const [showModal, setShowModal] = useState(false); // Toggle for custom interest modal
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    // Load categories from JSON
    setCategories(categoriesData);
  }, []);

  const handleInterestSelection = (interest) => {
    // Toggle interest selection
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleCustomInterestAdd = () => {
    if (customInterest.trim() !== "" && !selectedInterests.includes(customInterest)) {
      setSelectedInterests([...selectedInterests, customInterest.trim()]);
      setCustomInterest("");
      setShowModal(false); // Close modal after adding interest
    }
  };

  const handleNext = async () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // API call to set onboarding to true
      try {
        const token = localStorage.getItem("token"); // Get user token
        await axios.post(
          "http://localhost:5000/api/auth/set-onboarding", // Replace with your backend endpoint
          {
            onboarding: true,
            interests: selectedInterests, // Optional: Save user interests
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass token for authentication
            },
          }
        );

        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("Error updating onboarding status:", error);
        alert("Something went wrong. Please try again.");
      }
    }
  };

  const handleSkip = async () => {
    // API call to set onboarding to true
    try {
      const token = localStorage.getItem("token"); // Get user token
      await axios.post(
        "http://localhost:5000/api/auth/set-onboarding", // Replace with your backend endpoint
        {
          onboarding: true,
          interests: selectedInterests, // Optional: Save user interests
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token for authentication
          },
        }
      );

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (categories.length === 0) {
    return <div>Loading...</div>; // Show a loading state until categories are loaded
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Progress Bar */}
      <div className="w-full max-w-lg mb-4">
        <div className="h-2 bg-gray-300 rounded-lg overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${((currentStep + 1) / categories.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 text-center mt-2">
          Step {currentStep + 1} of {categories.length}
        </p>
      </div>

      <h1 className="text-2xl font-bold mb-4">Onboarding - Step {currentStep + 1}</h1>
      <h2 className="text-lg mb-6">{categories[currentStep].category} Interests</h2>

      <div className="grid grid-cols-2 gap-4">
        {categories[currentStep].skills.map((interest) => (
          <button
            key={interest}
            onClick={() => handleInterestSelection(interest)}
            className={`px-4 py-2 rounded-lg ${
              selectedInterests.includes(interest)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {interest}
          </button>
        ))}
      </div>

      {/* Custom Interest Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Add Custom Interest</h2>
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Type your interest"
              className="px-4 py-2 border rounded-lg w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomInterestAdd}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mb-4"
        >
          Add Custom Interest
        </button>
      </div>

      <div className="mt-6 flex justify-between w-full max-w-md">
        {currentStep < categories.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Finish
          </button>
        )}

        <button
          onClick={handleSkip}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default OnBoarding;
