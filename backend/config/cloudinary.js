const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for CVs
const cvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'job-board/cvs',
    resource_type: 'raw', // For PDFs
    allowed_formats: ['pdf'],
    public_id: (req, file) => `cv_${Date.now()}_${Math.round(Math.random() * 1E9)}`
  }
});

// Configure storage for images (logos, avatars)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'job-board/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// File filter for PDFs only
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('يرجى رفع ملف PDF فقط'), false);
  }
};

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('يرجى رفع صورة فقط'), false);
  }
};

// Multer upload instances
exports.uploadCV = multer({
  storage: cvStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

exports.uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

// Delete file from cloudinary
exports.deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting file from cloudinary:', error);
  }
};

module.exports.cloudinary = cloudinary;
