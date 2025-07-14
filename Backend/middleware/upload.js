import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define allowed file types and max size
const fileFilter = (req, file, cb) => {
  // Allow only specific image types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    // Reject file with custom error message
    cb(new Error('Only .jpeg, .jpg and .png files are allowed'), false);
  }
};

// Configure storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the appropriate upload path based on file type
    let uploadPath = 'uploads/';
    
    if (req.path.includes('/products')) {
      uploadPath = 'uploads/products/';
    } else if (req.path.includes('/profiles')) {
      uploadPath = 'uploads/profiles/';
    } else if (req.path.includes('/ids')) {
      uploadPath = 'uploads/ids/';
    } else if (req.path.includes('/rooms') && req.path.includes('/messages')) {
      uploadPath = 'uploads/chat/';
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create a secure filename with timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedFilename = path.basename(file.originalname).replace(/[^a-zA-Z0-9.]/g, '_');
    const fileExt = path.extname(sanitizedFilename);
    
    cb(null, uniqueSuffix + fileExt);
  },
});

// Create upload middleware with limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5 // Max 5 files at once
  }
});

export default upload; 