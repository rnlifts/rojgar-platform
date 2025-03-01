const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Job", 
    required: true 
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "In_Progress", "Completed"], 
    default: "Pending" 
  },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Milestone = mongoose.model("Milestone", milestoneSchema);
module.exports = Milestone;