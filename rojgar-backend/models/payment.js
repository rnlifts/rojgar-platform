
const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    jobId: ObjectId,
    freelancerId: ObjectId,
    clientId: ObjectId,
    amount: Number,
    status: {
      type: String,
      enum: ['Escrowed', 'Released', 'Refunded'],
      default: 'Escrowed'
    },
    escrowDate: Date,
    releaseDate: Date,
    paymentType: {
      type: String,
      enum: ['Full_Payment', 'Milestone'],
      default: 'Full_Payment'
    },
    milestoneNumber: Number, // Only for milestone-based payments
    totalMilestones: Number, // Only for milestone-based payments
    releaseTrigger: {
      type: String,
      enum: ['Client_Approval', 'Auto_Approval', 'Admin_Decision'],
    }
   
}, { timestamps: true });





