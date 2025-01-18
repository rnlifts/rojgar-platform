import axios from "axios";
import DOMPurify from "dompurify";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import QuillEditor from "./QuillEditor";

const ClientDashboard = () => {
  const [activeJobs, setActiveJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [view, setView] = useState("RecentJobs"); // Default view
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/client/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", data);

      if (data.activeJobs) {
        setActiveJobs(data.activeJobs.filter((job) => job.status === "In Progress"));
      } else {
        console.error("Error: 'activeJobs' is missing in the API response.");
        setActiveJobs([]);
      }

      if (data.recentJobs) {
        setRecentJobs(data.recentJobs);
      } else {
        console.error("Error: 'recentJobs' is missing in the API response.");
        setRecentJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setActiveJobs([]);
      setRecentJobs([]);
    }
  };

  const handleCancelJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/client/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Job cancelled successfully!");
      fetchJobs(); // Refresh jobs after deletion
    } catch (error) {
      console.error("Error cancelling job:", error);
      alert("Failed to cancel job.");
    }
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const handleJobSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");

      // Sanitize the description before saving
      const sanitizedDescription = DOMPurify.sanitize(values.description);

      const payload = {
        ...values,
        description: sanitizedDescription,
      };

      await axios.post("http://localhost:5000/api/client/jobs", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Job posted successfully!");
      fetchJobs(); // Refresh jobs
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job.");
    }
  };

  return (
    <div className="w-full h-full p-8 bg-gray-100 border-l border-gray-300">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-x-4">
          <button
            onClick={() => setView("PostJob")}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === "PostJob" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Post Job
          </button>
          <button
            onClick={() => setView("ActiveJobs")}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === "ActiveJobs" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Active Jobs
          </button>
          <button
            onClick={() => setView("RecentJobs")}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === "RecentJobs" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Recent Jobs
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-lg shadow-lg h-[80vh] overflow-y-auto">
        {view === "PostJob" && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Post a Job</h2>
            <Formik
              initialValues={{
                title: "",
                description: "",
                budget: "",
                paymentType: "Full Payment",
              }}
              validationSchema={Yup.object({
                title: Yup.string().required("Title is required"),
                budget: Yup.number().positive("Must be a positive number").required("Budget is required"),
                paymentType: Yup.string().oneOf(["Full Payment", "Milestone-Based"], "Invalid payment type").required(),
                description: Yup.string().required("Job description is required"),
              })}
              onSubmit={handleJobSubmit}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-6 bg-gray-50 p-6 shadow-md rounded-lg">
                  <div>
                    <label className="block text-gray-700 font-medium">Job Title</label>
                    <Field
                      name="title"
                      placeholder="Enter job title"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium">Job Description</label>
                    <QuillEditor value={values.description} onChange={(value) => setFieldValue("description", value)} />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium">Budget</label>
                    <Field
                      name="budget"
                      type="number"
                      placeholder="Enter budget (in USD)"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="budget" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium">Payment Type</label>
                    <Field
                      as="select"
                      name="paymentType"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Full Payment">Full Payment</option>
                      <option value="Milestone-Based">Milestone-Based</option>
                    </Field>
                    <ErrorMessage name="paymentType" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                  >
                    Post Job
                  </button>
                </Form>
              )}
            </Formik>
          </section>
        )}

        {view === "RecentJobs" && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Jobs</h2>
            {recentJobs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentJobs.map(({ _id, ...job }) => (
                  <div key={_id} className="p-4 bg-gray-50 shadow-md rounded-lg border border-gray-200">
                    <h3 className="font-bold text-blue-600">{job.title}</h3>
                    <p className="text-gray-700">
                      <strong>Budget:</strong> ${job.budget}
                    </p>
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={() => handleViewDetails(job)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleCancelJob(_id)}
                        className={`px-2 py-1 rounded text-sm ${
                          job.status === "Open" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={job.status !== "Open"}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No recent jobs found.</p>
            )}
          </section>
        )}

        {/* Modal for Full Details */}
        {modalVisible && selectedJob && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 h-3/4 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{selectedJob.title}</h2>
              <div
                className="text-gray-700 mb-4"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedJob.description) }}
              />
              <p className="text-gray-700 mb-4">
                <strong>Budget:</strong> ${selectedJob.budget}
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Status:</strong> {selectedJob.status}
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Payment Type:</strong> {selectedJob.paymentType}
              </p>
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
