const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const authenticate = require('../middlewares/authenticate');

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = `uploads/${req.user._id}/`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// File Schema
const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  size: Number,
  mimetype: String,
  uploadedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', default: null }
});

const File = mongoose.model('File', fileSchema);

// Helper function to check if user has access to the job
async function hasJobAccess(userId, jobId) {
  try {
    const Job = mongoose.model('Job');
    const Proposal = mongoose.model('Proposal');
    
    // Check if user is the job owner
    const job = await Job.findById(jobId);
    if (job && job.clientId.toString() === userId.toString()) {
      return true;
    }
    
    // Check if user is the accepted freelancer
    const proposal = await Proposal.findOne({
      jobId: jobId,
      freelancerId: userId,
      status: 'Accepted'
    });
    
    return !!proposal;
  } catch (error) {
    console.error('Error checking job access:', error);
    return false;
  }
}

// Upload route
router.post('/upload', authenticate, upload.array('files'), async (req, res) => {
  try {
    const uploadedFiles = [];
    const userId = req.user._id;
    const jobId = req.body.jobId || null;
    const proposalId = req.body.proposalId || null;

    // If jobId is provided, verify access
    if (jobId) {
      const hasAccess = await hasJobAccess(userId, jobId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Unauthorized access to this job' });
      }
    }
    
    for (let file of req.files) {
      const newFile = new File({
        filename: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        userId,
        jobId,
        proposalId
      });
      await newFile.save();
      uploadedFiles.push(newFile);
    }
    
    res.json({ 
      success: true,
      message: 'Files uploaded successfully', 
      files: uploadedFiles 
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error uploading files',
      error: error.message 
    });
  }
});

// Get files route
router.get('/files', authenticate, async (req, res) => {
  try {
    const filter = {};
    
    // If userId is provided, verify access to the job first
    if (req.query.userId) {
      if (req.query.jobId) {
        const hasAccess = await hasJobAccess(req.user._id, req.query.jobId);
        if (!hasAccess) {
          return res.status(403).json({ 
            success: false,
            message: 'Unauthorized access to this job' 
          });
        }
      }
      filter.userId = req.query.userId;
    } else {
      filter.userId = req.user._id;
    }
    
    if (req.query.jobId) {
      filter.jobId = req.query.jobId;
    }
    
    if (req.query.proposalId) {
      filter.proposalId = req.query.proposalId;
    }
    
    const files = await File.find(filter)
      .sort({ uploadedAt: -1 })
      .populate('userId', 'name email')
      .populate('jobId', 'title');

    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching files',
      error: error.message 
    });
  }
});

// Download route
router.get('/files/:id/download', authenticate, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ 
        success: false,
        message: 'File not found' 
      });
    }
    
    // Check if user has access to the file
    if (file.jobId) {
      const hasAccess = await hasJobAccess(req.user._id, file.jobId);
      if (!hasAccess && file.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false,
          message: 'Unauthorized access' 
        });
      }
    } else if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }
    
    res.download(file.path, file.filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error downloading file',
      error: error.message 
    });
  }
});
// View route
router.get('/files/:id/view', authenticate, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ 
        success: false,
        message: 'File not found' 
      });
    }
    
    // Check if user has access to the file
    if (file.jobId) {
      const hasAccess = await hasJobAccess(req.user._id, file.jobId);
      if (!hasAccess && file.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false,
          message: 'Unauthorized access' 
        });
      }
    } else if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    // Set proper content type based on file mimetype
    const contentType = file.mimetype || getMimeType(file.filename);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
    
    // Send the file
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error('Error viewing file:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error viewing file',
      error: error.message 
    });
  }
});

// Helper function to determine MIME type from filename
function getMimeType(filename) {
  const extension = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    // Add more mime types as needed
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}
// Delete route
router.delete('/files/:id', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id,
      userId: req.user._id // Only allow deletion of own files
    });
    
    if (!file) {
      return res.status(404).json({ 
        success: false,
        message: 'File not found or unauthorized' 
      });
    }
    
    // Delete file from filesystem
    fs.unlink(file.path, async (err) => {
      if (err) {
        console.error('Error deleting file from filesystem:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Error deleting file' 
        });
      }
      
      // Delete file record from database
      await File.deleteOne({ _id: req.params.id });
      res.json({ 
        success: true,
        message: 'File deleted successfully' 
      });
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting file',
      error: error.message 
    });
  }
});

module.exports = router;