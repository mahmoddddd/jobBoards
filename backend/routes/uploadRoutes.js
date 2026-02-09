const express = require('express');
const router = express.Router();
const { uploadCV, uploadImage } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// @desc    Upload CV (PDF)
// @route   POST /api/upload/cv
// @access  Private
router.post('/cv', protect, uploadCV.single('cv'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'يرجى رفع ملف'
      });
    }

    res.json({
      success: true,
      message: 'تم رفع الملف بنجاح',
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في رفع الملف',
      error: error.message
    });
  }
});

// @desc    Upload Image (logo, avatar)
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, uploadImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'يرجى رفع صورة'
      });
    }

    res.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في رفع الصورة',
      error: error.message
    });
  }
});

module.exports = router;
