import axios from 'axios';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';



const ProposalSubmission = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/jobs/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJob(data.job);
    } catch (error) {
      console.error("Error fetching job details:", error);
      setError(error.response?.data?.message || "Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login to submit a proposal");
        navigate('/login');
        return;
      }
  
      console.log('Submitting proposal with values:', values); // Debug log
      
      const response = await axios.post(
        `http://localhost:5000/api/proposals/${jobId}`, 
        {
          coverLetter: values.coverLetter,
          bidAmount: values.bidAmount
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
  
      console.log('Proposal submission response:', response); // Debug log
      
      if (response.data) {
        alert("Proposal submitted successfully!");
        navigate('/Dashboard');
      }
    } catch (error) {
      console.error("Error submitting proposal - Full error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        localStorage.removeItem("token");
        navigate('/login');
      } else if (error.response?.data?.message) {
        alert(`Failed to submit proposal: ${error.response.data.message}`);
      } else {
        alert("Failed to submit proposal. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/Dashboard')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate('/Dashboard')}
          className="text-blue-500 hover:text-blue-700 mb-4 flex items-center"
        >
          <span>← Back to Dashboard</span>
        </button>
        
        {/* Job Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">{job?.title}</h1>
          <p className="text-gray-600 mb-4">{job?.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="font-semibold">Budget:</span> ${job?.budget}
            </div>
            <div>
              <span className="font-semibold">Payment Type:</span> {job?.paymentType}
            </div>
          </div>

          <div className="mb-4">
            <span className="font-semibold">Required Skills:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {job?.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Proposal Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-6">Submit Your Proposal</h2>
          
          <Formik
            initialValues={{
              coverLetter: "",
              bidAmount: job?.budget || ""
            }}
            validationSchema={Yup.object({
              coverLetter: Yup.string()
                .required("Cover letter is required")
                .min(50, "Cover letter must be at least 50 characters"),
              bidAmount: Yup.number()
                .required("Bid amount is required")
                .positive("Bid amount must be positive")
            })}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Bid Amount ($)
                  </label>
                  <Field
                    type="number"
                    name="bidAmount"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="bidAmount"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Cover Letter
                  </label>
                  <Field
                    as="textarea"
                    name="coverLetter"
                    rows="8"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Explain why you're the best fit for this job..."
                  />
                  <ErrorMessage
                    name="coverLetter"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ProposalSubmission;