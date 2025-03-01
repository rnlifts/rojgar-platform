const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  paymentType: { type: String, enum: ["Full Payment", "Milestone-Based"], required: true },
  status: { 
    type: String, 
    enum: ["Open", "In Progress", "Completed"], 
    default: "Open" 
  },
  acceptedProposalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Proposal",
    default: null 
  },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  paymentStatus: {
    type: String,
    enum: ['Awaiting_Escrow', 'Escrowed', 'Partially_Paid', 'Completed'],
    default: 'Escrowed'
  },
  milestones: [{
    description: String,
    amount: Number,
    status: {
      type: String,
      enum: ['Pending', 'In_Progress', 'Completed'],
      default: 'Pending'
    },
    dueDate: Date
  }],
  escrowAmount: Number,
  totalPaid: Number,
  completionStatus: {
    type: String,
    enum: ['Not_Started', 'In_Progress', 'Under_Review', 'Completed', 'Disputed'],
    default: 'Not_Started'
  },
  autoApprovalDate: Date // Calculate based on submission date + 3 days
});


const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
