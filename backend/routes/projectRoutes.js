const express = require('express');
const router = express.Router();
const {
  createProject,
  updateProject,
  getProject,
  getProjects,
  getMyProjects,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// Public
router.get('/', getProjects);

// Protected (before /:id)
router.get('/my-projects', protect, getMyProjects);
router.post('/', protect, createProject);

// Public
router.get('/:id', getProject);

// Protected
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
