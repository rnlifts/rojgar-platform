// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authenticate = require('../middlewares/authenticate');

// routes/taskRoutes.js
const mongoose = require('mongoose');

router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      jobId,
      proposalId,
      freelancerId,
      deadline
    } = req.body;

    console.log('Received task creation data:', req.body);

    // Create new task with proper ObjectId conversion
    const newTask = new Task({
      title,
      description,
      jobId: new mongoose.Types.ObjectId(jobId),
      proposalId: new mongoose.Types.ObjectId(proposalId),
      clientId: req.user._id,
      freelancerId: new mongoose.Types.ObjectId(freelancerId),
      deadline: new Date(deadline),
    });

    console.log('Prepared task for saving:', newTask);

    // Save the task
    const savedTask = await newTask.save();

    console.log('Saved task:', savedTask);

    res.status(201).json({
      success: true,
      task: savedTask
    });
  } catch (error) {
    console.error('Detailed Error creating task:', error);
    
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    // Handle ObjectId conversion errors
    if (error.name === 'TypeError' || error.name === 'BSONError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        errorDetails: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating task',
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    });
  }
});
// Get tasks for a job
router.get('/job/:jobId', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({
      jobId: req.params.jobId,
      $or: [
        { clientId: req.user._id },
        { freelancerId: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
});

// Update task status
router.patch('/:taskId/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify user has permission
    if (task.clientId.toString() !== req.user._id.toString() && 
        task.freelancerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    task.status = status;
    task.updatedAt = Date.now();
    await task.save();

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task'
    });
  }
});

module.exports = router;