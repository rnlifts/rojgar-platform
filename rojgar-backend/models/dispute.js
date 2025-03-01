const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
    jobId: ObjectId,
    submissionId: ObjectId,
    clientId: ObjectId,
    freelancerId: ObjectId,
    reason: String,
    description: String,
    status: {
      type: String,
      enum: ['Open', 'Under_Review', 'Resolved'],
      default: 'Open'
    },
    adminDecision: {
      decision: {
        type: String,
        enum: ['Approve_Work', 'Request_Revision', 'Refund_Client']
      },
      comments: String,
      decidedBy: ObjectId,
      decidedAt: Date
    },
    createdAt: Date,
    resolvedAt: Date
}, { timestamps: true });



module.exports = mongoose.model('Dispute', disputeSchema);