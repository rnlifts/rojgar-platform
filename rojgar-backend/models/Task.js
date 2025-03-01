const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long']
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: [true, 'Proposal ID is required']
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client ID is required']
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'under_review', 'revision_needed', 'completed'],
    default: 'pending'
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  paymentStatus: {
    type: Boolean,
    default: false
  },
  revisionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  runValidators: true
});

module.exports = mongoose.model('Task', taskSchema);