const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middlewares/authenticate');

// Get messages for a specific proposal
router.get('/proposal/:proposalId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ proposalId: req.params.proposalId })
      .sort({ timestamp: 1 });
    console.log('Found messages:', messages); // Add this for debugging
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;