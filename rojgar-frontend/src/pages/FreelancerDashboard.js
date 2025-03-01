import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import * as Yup from "yup";


const FreelancerDashboard = () => {
  const navigate = useNavigate();
  const [jobsFeed, setJobsFeed] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [view, setView] = useState("Feed");
  const [profile, setProfile] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobsFeed(1); // Start with page 1
    fetchProposals();
    fetchProfile();
  }, []);

  const fetchJobsFeed = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/freelancer/jobs?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Sort jobs based on matching interests
      const sortedJobs = [...data.jobs].sort((a, b) => {
        // Get number of matching tags for each job
        const aMatches = a.matchedInterests || 0;
        const bMatches = b.matchedInterests || 0;
        
        // Sort in descending order (more matches first)
        return bMatches - aMatches;
      });

      setJobsFeed(sortedJobs);
      setPagination(data.pagination);
      
      // Show interest-based message if provided
      if (data.message) {
        // You could use a toast notification here
        console.log(data.message);
      }
    } catch (error) {
      console.error("Error fetching jobs feed:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/proposals/freelancer", // Corrected endpoint
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProposals(data.proposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/freelancer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleProfileUpdate = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/freelancer/profile", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  const handleCreateProposal = async (jobId) => {
    navigate(`/submit-proposal/${jobId}`);
  };

  // Pagination controls component
  const PaginationControls = () => {
    const pages = Array.from({ length: pagination.pages }, (_, i) => i + 1);

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => fetchJobsFeed(pagination.page - 1)}
          disabled={pagination.page === 1}
          className={`px-3 py-1 rounded-md ${
            pagination.page === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          Previous
        </button>

        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => fetchJobsFeed(pageNum)}
            className={`px-3 py-1 rounded-md ${
              pagination.page === pageNum
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => fetchJobsFeed(pagination.page + 1)}
          disabled={pagination.page === pagination.pages}
          className={`px-3 py-1 rounded-md ${
            pagination.page === pagination.pages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-screen p-8 bg-gray-100">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-x-4">
          <button
            onClick={() => setView("Feed")}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === "Feed" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Job Feed
          </button>
          <button
            onClick={() => setView("Proposals")}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === "Proposals" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white"
            }`}
          >
            My Proposals
          </button>
          <button
            onClick={() => setView("Profile")}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === "Profile" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-lg shadow-lg h-[calc(100vh-200px)]">
        {view === "Feed" && (
          <section className="h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Job Feed</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                {jobsFeed.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobsFeed.map((job) => (
                      <div key={job._id} className="bg-gray-50 p-4 rounded-lg shadow relative">
                        {/* Matching interests badge */}
                        {job.matchedInterests > 0 && (
                          <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Ideal
                          </div>
                        )}
                        
                        {/* Job content */}
                        <div className={`${job.matchedInterests > 0 ? 'border-l-4 border-green-500 pl-3' : ''}`}>
                          <h3 className="font-bold text-lg text-blue-600">{job.title}</h3>
                          <p className="text-gray-600 mt-2">{job.description}</p>
                          <div className="mt-2">
                            <span className="font-semibold">Budget:</span> ${job.budget}
                          </div>
                          <div className="mt-2">
                            <span className="font-semibold">Payment:</span> {job.paymentType}
                          </div>
                          
                          {/* Tags with highlighted matching interests */}
                          <div className="mt-2 flex flex-wrap gap-2">
                          {job.tags.map((tag, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded ${
                                job.matchedInterests > 0 && 
                                profile?.interests?.some(
                                  interest => interest.toLowerCase() === tag.toLowerCase()
                                )
                                  ? 'bg-green-100 text-green-800 font-medium'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                          <button
                            onClick={() => handleCreateProposal(job._id)}
                            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No jobs available.</p>
                )}

                {jobsFeed.length > 0 && <PaginationControls />}

                <div className="text-center text-gray-600 mt-4">
                  Showing {((pagination.page - 1) * 10) + 1} to{" "}
                  {Math.min(pagination.page * 10, pagination.total)} of{" "}
                  {pagination.total} jobs
                </div>
              </>
            )}
          </section>
        )}

{view === "Proposals" && (
  <section className="h-full overflow-y-auto">
    <h2 className="text-2xl font-bold mb-4">My Proposals</h2>
    {proposals.length > 0 ? (
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <div key={proposal._id} className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            {/* Proposal Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl text-blue-600">{proposal.jobTitle}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                proposal.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                proposal.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                proposal.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {proposal.status}
              </span>
            </div>

            {/* Proposal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600">
                  <span className="font-semibold">Proposed Budget:</span> ${proposal.budget}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Submitted:</span>{' '}
                  {new Date(proposal.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="font-semibold">Expected Duration:</span>{' '}
                  {proposal.duration || 'Not specified'}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Payment Type:</span>{' '}
                  {proposal.paymentType || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Proposal Content */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <p className="font-semibold text-gray-700 mb-2">Cover Letter:</p>
              <p className="text-gray-600">{proposal.coverLetter}</p>
            </div>

            {/* Job Details Link */}
            <div className="flex justify-end">
              <button 
                onClick={() => window.open(`/job/${proposal.jobId}`, '_blank')}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                View Job Details →
              </button>
            </div>

            {/* Additional Actions based on Status */}
            {proposal.status === 'Accepted' && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">
                  🎉 Congratulations! Your proposal has been accepted.
                </p>
                <button
                   onClick={() => navigate(`/workspace/${proposal.jobId}?proposalId=${proposal._id}`)}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Go to Workspace
                </button>
              </div>
            )}

            {proposal.status === 'Pending' && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800">
                  ⏳ Your proposal is under review. We'll notify you when there's an update.
                </p>
              </div>
            )}

            {proposal.status === 'Rejected' && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-red-800">
                  Unfortunately, this proposal was not accepted. Keep trying!
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg mb-4">No proposals submitted yet.</p>
        <button
          onClick={() => setView("Feed")}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Browse Jobs
        </button>
      </div>
    )}
  </section>
)}

        {view === "Profile" && (
          <section className="h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            {profile ? (
              <Formik
                initialValues={{
                  name: profile.name || "",
                  bio: profile.bio || "",
                  skills: profile.skills ? profile.skills.join(", ") : "",
                }}
                validationSchema={Yup.object({
                  name: Yup.string().required("Name is required"),
                  bio: Yup.string().required("Bio is required"),
                  skills: Yup.string().required("Skills are required"),
                })}
                onSubmit={handleProfileUpdate}
              >
                <Form className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium">Name</label>
                    <Field
                      name="name"
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Enter your name"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium">Bio</label>
                    <Field
                      name="bio"
                      as="textarea"
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Tell us about yourself"
                    />
                    <ErrorMessage name="bio" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium">Skills</label>
                    <Field
                      name="skills"
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Enter skills separated by commas"
                    />
                    <ErrorMessage name="skills" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Update Profile
                  </button>
                </Form>
              </Formik>
            ) : (
              <p className="text-center text-gray-500">Loading profile...</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboard;