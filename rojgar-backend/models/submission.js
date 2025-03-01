
const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({

    jobId: ObjectId,
    freelancerId: ObjectId,
    clientId: ObjectId,
    submissionDate: Date,
    content: String,
    files: [String], // Array of file URLs
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Revision_Requested', 'Disputed'],
      default: 'Pending'
    },
    clientReviewDeadline: Date, // 3 days from submission
    revisionComments: String,
    disputeReason: String,
    adminReviewStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Revision_Needed'],
      default: 'Pending'
    }
  }, { timestamps: true });


module.exports = mongoose.model('Submission', submissionSchema);
