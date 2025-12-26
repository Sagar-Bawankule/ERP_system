const express = require('express');
const router = express.Router();
const {
    getAllTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    assignSubjects,
    assignClass,
    getTeachersByDepartment,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Admin only routes
router.post('/', authorize('admin'), createTeacher);
router.delete('/:id', authorize('admin'), deleteTeacher);
router.post('/:id/subjects', authorize('admin'), assignSubjects);
router.post('/:id/classes', authorize('admin'), assignClass);

// Admin routes
router.get('/', authorize('admin'), getAllTeachers);

// All authenticated users
router.get('/department/:department', getTeachersByDepartment);
router.get('/:id', getTeacher);
router.put('/:id', authorize('admin', 'teacher'), updateTeacher);

module.exports = router;
