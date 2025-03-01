// models/Profile.js
const mongoose = require('mongoose');

// Create a more flexible schema that can handle varying response formats
const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  // Handle both bio and short_bio
  short_bio: String,
  bio: String,
  
  // Handle different education formats
  education: {
    type: mongoose.Schema.Types.Mixed, // This allows any structure
    required: false
  },
  
  // Skills can be string or array
  skills: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  
  // Experience as array of strings
  experience: {
    type: [String],
    default: []
  },
  
  // Additional fields that might be present
  languages: mongoose.Schema.Types.Mixed,
  additional_info: String,
  
  // Metadata
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updated_at' field before saving
profileSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Profile', profileSchema);