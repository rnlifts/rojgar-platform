const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authenticate');

// All routes are protected
router.use(protect);

// Create a new project
router.post('/', projectController.createProject);

// Get project by ID
router.get('/:projectId', projectController.getProject);

// Get all projects for a user
router.get('/user/projects', projectController.getUserProjects);

// Update project status
router.patch('/:projectId/status', projectController.updateProjectStatus);

module.exports = router;