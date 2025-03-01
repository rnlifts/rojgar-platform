const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");  // Add this import
const authenticate = require("../middlewares/authenticate");
const Proposal = require("../models/proposal");
const Job = require("../models/job");

router.post("/:jobId", authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, bidAmount } = req.body;
    const freelancerId = req.user._id;

    // Input validation
    if (!coverLetter || !bidAmount) {
      return res.status(400).json({
        success: false,
        message: "Cover letter and bid amount are required"
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

      // Check if job is already filled
    if (job.status !== "Open") {
    return res.status(400).json({
      success: false,
      message: "This job is no longer accepting proposals"
    });
    }

    // Check for existing proposal using the Proposal model directly
    const existingProposal = await Proposal.findOne({
      jobId: jobId,
      freelancerId: freelancerId
    });

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a proposal for this job"
      });
    }

    // Create new proposal
    const newProposal = new Proposal({
      jobId,
      freelancerId,
      clientId: job.clientId,
      coverLetter,
      bidAmount: Number(bidAmount),
      status: "Pending"
    });

    const savedProposal = await newProposal.save();

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      proposal: savedProposal
    });

  } catch (error) {
    console.error("Server error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit proposal",
      error: error.message
    });
  }
});
// ... existing code ...

// Get all proposals for a client
router.get("/client", authenticate, async (req, res) => {
  try {
    const clientId = req.user._id;
    
    const proposals = await Proposal.find({ clientId })
      .populate('freelancerId', 'name email')
      .populate('jobId', 'title budget status');  // Added status to populated fields

    res.json({
      success: true,
      proposals
    });
  } catch (error) {
    console.error("Server error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch proposals",
      error: error.message
    });
  }
});
// Add this before your PATCH route in proposalRoutes.js
router.options("/:proposalId/:action", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Handle proposal actions (accept/reject)
router.patch("/:proposalId/:action", authenticate, async (req, res) => {
try {
  const { proposalId, action } = req.params;
  const clientId = req.user._id;

  // Verify the proposal exists and populate job details
  const proposal = await Proposal.findOne({
    _id: proposalId
  }).populate('jobId');

  if (!proposal) {
    return res.status(404).json({
      success: false,
      message: "Proposal not found"
    });
  }

  // Check if the job belongs to the client
  if (proposal.jobId.clientId.toString() !== clientId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: You can only act on proposals for your own jobs"
    });
  }

  // Check if job is still open
  if (proposal.jobId.status !== "Open") {
    return res.status(400).json({
      success: false,
      message: `Cannot ${action} proposal: Job is no longer open`
    });
  }

  // Validate action
  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Invalid action. Must be 'accept' or 'reject'"
    });
  }

  // Check if proposal is still pending
  if (proposal.status !== "Pending") {
    return res.status(400).json({
      success: false,
      message: `Cannot ${action} proposal: Proposal is already ${proposal.status.toLowerCase()}`
    });
  }

  // Update proposal status
  proposal.status = action === "accept" ? "Accepted" : "Rejected";
  await proposal.save();

  // If accepting the proposal
  if (action === "accept") {
    // Update job status and store accepted proposal ID
    await Job.findByIdAndUpdate(proposal.jobId._id, { 
      status: "In Progress",
      acceptedProposalId: proposalId
    });
    
    // Reject all other pending proposals for this job
    await Proposal.updateMany(
      {
        jobId: proposal.jobId._id,
        _id: { $ne: proposalId },
        status: "Pending"
      },
      { status: "Rejected" }
    );
  }

  // Fetch updated proposal with populated fields
  const updatedProposal = await Proposal.findById(proposalId)
    .populate('freelancerId', 'name email')
    .populate('jobId', 'title budget status');

  res.json({
    success: true,
    message: `Proposal ${action}ed successfully`,
    proposal: updatedProposal
  });

} catch (error) {
  console.error("Server error details:", error);
  res.status(500).json({
    success: false,
    message: `Failed to ${req.params.action} proposal`,
    error: error.message
  });
}
});
 // Add this route
 router.get("/freelancer", authenticate, async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancerId: req.user._id })
      .populate('jobId', 'title budget paymentType')
      .sort({ createdAt: -1 });

      const transformedProposals = proposals.map(proposal => ({
        _id: proposal._id,
        jobId: proposal.jobId ? proposal.jobId._id : null,
        jobTitle: proposal.jobId ? proposal.jobId.title : "Job not found",
        status: proposal.status,
        budget: proposal.bidAmount,
        createdAt: proposal.createdAt,
        coverLetter: proposal.coverLetter,
        paymentType: proposal.jobId ? proposal.jobId.paymentType : "N/A"
      }));
      

    res.json({ proposals: transformedProposals });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Error fetching proposals' });
  }
});



// Get all accepted proposals for a client or freelancer
router.get("/accepted-proposals", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const isClient = req.user.role === "client";  // Assuming user has a 'role' field

    // Query based on user type: client or freelancer
    let filter = { status: "Accepted" };
    
    if (isClient) {
      // If the user is a client, fetch proposals where the client is the employer
      filter.clientId = userId;
    } else {
      // If the user is a freelancer, fetch proposals where the freelancer is the proposer
      filter.freelancerId = userId;
    }

    const acceptedProposals = await Proposal.find(filter)
      .populate('freelancerId', 'name email')
      .populate('jobId', 'title budget paymentType status');

    // Transforming the data as needed
    const transformedProposals = acceptedProposals.map(proposal => ({
      _id: proposal._id,
      jobId: proposal.jobId._id,
      jobTitle: proposal.jobId.title,
      freelancerName: proposal.freelancerId.name,
      status: proposal.status,
      bidAmount: proposal.bidAmount,
      paymentType: proposal.jobId.paymentType,
      jobStatus: proposal.jobId.status,
      coverLetter: proposal.coverLetter
    }));

    res.json({
      success: true,
      proposals: transformedProposals
    });
  } catch (error) {
    console.error('Error fetching accepted proposals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accepted proposals',
      error: error.message
    });
  }
});


router.get("/:proposalId", authenticate, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.proposalId)
      .populate('freelancerId', 'name email role _id')  // Added _id
      .populate('clientId', 'name email role _id')      // Added _id
      .populate('jobId', 'title budget status');
      
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found" });
    }
    
    res.status(200).json({ success: true, proposal });
  } catch (error) {
    console.error("Error fetching proposal details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
});




  module.exports = router;