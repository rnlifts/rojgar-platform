const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const Job = require("../models/job");

// POST route to create a job
router.post("/client/jobs", authenticate, async (req, res) => {
  console.log("Request body:", req.body); // Check the incoming request body
  console.log("User ID from token:", req.user); // Check the authenticated user

  const { title, description, budget, paymentType } = req.body;

  if (!title || !description || !budget || !paymentType) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const job = new Job({
      clientId: req.user._id,
      title,
      description,
      budget,
      paymentType,
    });
    await job.save();
    res.status(201).json({ message: "Job posted successfully!", job });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Failed to post job." });
  }
});

// GET route to fetch jobs
router.get("/client/jobs", authenticate, async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user._id });
    const recentJobs = jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log("Recent Jobs:", recentJobs); // Debug log
    res.status(200).json({
      activeJobs: jobs.filter((job) => job.status === "Open"),
      completedJobs: jobs.filter((job) => job.status === "Completed"),
      recentJobs: recentJobs.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs." });
  }
});

// DELETE route to cancel (delete) a job
router.delete("/client/jobs/:jobId", authenticate, async (req, res) => {
  const { jobId } = req.params;

  try {
    // Find the job by ID and check if it belongs to the authenticated client
    const job = await Job.findOne({ _id: jobId, clientId: req.user._id });

    if (!job) {
      return res.status(404).json({ message: "Job not found or you are not authorized to cancel this job." });
    }

    // Delete the job
    await Job.deleteOne({ _id: jobId });
    res.status(200).json({ message: "Job canceled successfully!" });
  } catch (error) {
    console.error("Error canceling job:", error);
    res.status(500).json({ message: "Failed to cancel job." });
  }
});

module.exports = router;
