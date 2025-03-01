const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parseCV } = require('../services/cvParserService');

// Multer error handling middleware
const uploadErrorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File is too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${error.message}`
    });
  }
  next(error);
};

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
}).single('cv');

// Parse CV route
router.post('/parse', (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        throw err;
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      console.log('Processing file:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      const fileType = req.file.originalname.split('.').pop().toLowerCase();
      const parsedData = await parseCV(req.file.buffer, fileType);

      res.json({
        success: true,
        data: parsedData
      });

    } catch (error) {
      console.error('Error in CV parse route:', error);
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to parse CV'
      });
    }
  });
});

module.exports = router;
