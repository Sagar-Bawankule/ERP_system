const express = require('express');
const router = express.Router();
const {
    createFeeStructure,
    getFeeStructures,
    assignFeeToStudent,
    getStudentFees,
    makePayment,
    getPaymentHistory,
    getFeeAnalytics,
    updateFeeStructure,
    getOverdueFees,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Admin only routes
router.post('/structure', authorize('admin'), createFeeStructure);
router.get('/structures', authorize('admin'), getFeeStructures);
router.put('/structure/:id', authorize('admin'), updateFeeStructure);
router.post('/assign', authorize('admin'), assignFeeToStudent);
router.get('/analytics', authorize('admin'), getFeeAnalytics);
router.get('/overdue', authorize('admin'), getOverdueFees);

// Payment routes
router.post('/payment', protect, makePayment);

// Student/Parent can view
router.get('/student/:studentId', getStudentFees);
router.get('/payments/:studentId', getPaymentHistory);

module.exports = router;
