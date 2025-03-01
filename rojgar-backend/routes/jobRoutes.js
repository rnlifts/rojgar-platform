const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const Job = require("../models/job");
const Milestone = require("../models/Milestone");
const Message = require("../models/Message");


router.get("/jobs/:id", authenticate, async (req, res) => {
  console.log('Received request for job ID:', req.params.id);
  try {
    const job = await Job.findById(req.params.id)
      .populate('clientId', 'name email');

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Error in getJobById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});


// POST route to create a job
router.post("/client/jobs", authenticate, async (req, res) => {
  const { title, description, budget, paymentType, tags } = req.body;

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
      tags: tags || [], // Assign tags or default to an empty array
    });

    await job.save();
    res.status(201).json({ message: "Job posted successfully!", job });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Failed to post job." });
  }
});

router.get("/client/jobs", authenticate, async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user._id })
      .populate({
        path: 'acceptedProposalId',
        populate: {
          path: 'freelancerId',
          select: 'name email'  // Only get necessary fields
        }
      })
      .sort({ createdAt: -1 });

    // Separate jobs by status
    const activeJobs = jobs.filter(job => 
      job.status === "In Progress" && job.acceptedProposalId
    );
    const recentJobs = jobs;

    res.status(200).json({
      success: true,
      activeJobs,
      recentJobs
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch jobs.",
      error: error.message 
    });
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

router.get("/freelancer/jobs", authenticate, async (req, res) => {
  try {
    // 1. Pagination Parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Get user's interests from their profile
    const userInterests = req.user.interests || [];
    
    // 3. Fetch all jobs for the current page
    const jobs = await Job.find({ status: "Open" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 4. Add matchedInterests count to each job
    const enhancedJobs = jobs.map(job => {
      const jobObj = job.toObject();
      // Count matching tags (case-insensitive)
      const matchedInterests = jobObj.tags.filter(tag =>
        userInterests.some(interest => 
          interest.toLowerCase() === tag.toLowerCase()
        )
      ).length;
      
      return {
        ...jobObj,
        matchedInterests
      };
    });

    // 5. Sort jobs - matched interests first
    const sortedJobs = enhancedJobs.sort((a, b) => 
      b.matchedInterests - a.matchedInterests
    );

    // 6. Get total count for pagination info
    const total = await Job.countDocuments({ status: "Open" });

    // 7. Send response with pagination details
    res.json({
      jobs: sortedJobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      message: sortedJobs.some(job => job.matchedInterests > 0) 
        ? "Some jobs match your interests!"
        : null
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});





module.exports = router;
