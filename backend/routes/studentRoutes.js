const express = require('express');
const router = express.Router();
const {
    getAllStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    getAcademicHistory,
    updateAcademicHistory,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Admin only routes
router.post('/', authorize('admin'), createStudent);
router.delete('/:id', authorize('admin'), deleteStudent);
router.post('/:id/academic-history', authorize('admin'), updateAcademicHistory);

// Admin and Teacher routes
router.get('/', authorize('admin', 'teacher'), getAllStudents);
router.get('/class/:department/:semester/:section', authorize('admin', 'teacher'), getStudentsByClass);

// All authenticated users
router.get('/:id', getStudent);
router.put('/:id', authorize('admin', 'student'), updateStudent);
router.get('/:id/academic-history', getAcademicHistory);

module.exports = router;
