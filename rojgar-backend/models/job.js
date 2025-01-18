const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  paymentType: { type: String, enum: ["Full Payment", "Milestone-Based"], required: true },
  status: { type: String, enum: ["Open", "In Progress", "Completed"], default: "Open" },
  createdAt: { type: Date, default: Date.now },
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
