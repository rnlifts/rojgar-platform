// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// Helper function to normalize data
const normalizeProfileData = (data) => {
  const normalized = { ...data };
  
  // Ensure we have both bio fields (one might be empty)
  if (data.short_bio && !data.bio) {
    normalized.bio = data.short_bio;
  } else if (data.bio && !data.short_bio) {
    normalized.short_bio = data.bio;
  }
  
  // Ensure experience is always an array
  if (data.experience && !Array.isArray(data.experience)) {
    normalized.experience = [data.experience];
  }
  
  // Ensure skills is always present in some form
  if (!data.skills) {
    normalized.skills = "";
  }
  
  return normalized;
};

// Save parsed CV data to database
router.post('/save', async (req, res) => {
  try {
    console.log('Original request body:', JSON.stringify(req.body, null, 2));
    
    // Extract CV data from request - handle both formats
    const cvData = req.body.cvData || req.body;
    console.log('Extracted CV data:', JSON.stringify(cvData, null, 2));
    
    // Normalize the data structure to handle variations
    const normalizedData = normalizeProfileData(cvData);
    console.log('Normalized data:', JSON.stringify(normalizedData, null, 2));
    
    // Create new Profile document
    const newProfile = new Profile(normalizedData);
    
    // Save to database
    const savedProfile = await newProfile.save();
    
    console.log('Successfully saved profile:', savedProfile._id);
    
    res.status(201).json({
      success: true,
      data: savedProfile
    });

  } catch (error) {
    console.error('Error saving CV data:', error);
    
    // Check for validation errors and provide detailed error messages
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save CV data'
    });
  }
});

// Get all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ created_at: -1 });
    
    res.json({
      success: true,
      count: profiles.length,
      data: profiles
    });

  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch profiles'
    });
  }
});

// Get single profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch profile'
    });
  }
});

// Update profile
router.put('/:id', async (req, res) => {
  try {
    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: updatedProfile
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile'
    });
  }
});

module.exports = router;