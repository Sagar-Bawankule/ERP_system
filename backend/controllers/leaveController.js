const LeaveApplication = require('../models/LeaveApplication');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Apply for leave
// @route   POST /api/leave
// @access  Private (Student, Teacher)
const applyLeave = asyncHandler(async (req, res) => {
    const { leaveType, fromDate, toDate, reason } = req.body;

    let applicantType, profile;

    if (req.user.role === 'student') {
        applicantType = 'Student';
        profile = await Student.findOne({ user: req.user.id });
    } else if (req.user.role === 'teacher') {
        applicantType = 'Teacher';
        profile = await Teacher.findOne({ user: req.user.id });
    } else {
        return res.status(403).json({
            success: false,
            message: 'Only students and teachers can apply for leave',
        });
    }

    if (!profile) {
        return res.status(404).json({
            success: false,
            message: 'Profile not found',
        });
    }

    // Get documents from request
    const documents = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            documents.push({
                name: file.originalname,
                url: `/uploads/documents/${file.filename}`,
            });
        }
    }

    const leaveData = {
        applicant: req.user.id,
        applicantType,
        leaveType,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        reason,
        documents,
    };

    if (applicantType === 'Student') {
        leaveData.student = profile._id;
    } else {
        leaveData.teacher = profile._id;
    }

    const leave = await LeaveApplication.create(leaveData);

    res.status(201).json({
        success: true,
        message: 'Leave application submitted successfully',
        data: leave,
    });
});

// @desc    Get my leave applications
// @route   GET /api/leave/my-leaves
// @access  Private
const getMyLeaves = asyncHandler(async (req, res) => {
    const { status, year } = req.query;

    const query = { applicant: req.user.id };
    if (status) query.status = status;

    if (year) {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);
        query.fromDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const leaves = await LeaveApplication.find(query)
        .populate('reviewedBy', 'firstName lastName')
        .sort({ createdAt: -1 });

    // Calculate summary
    const summary = {
        total: leaves.length,
        pending: leaves.filter(l => l.status === 'Pending').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length,
        totalDays: leaves.filter(l => l.status === 'Approved').reduce((sum, l) => sum + l.numberOfDays, 0),
    };

    res.json({
        success: true,
        data: leaves,
        summary,
    });
});

// @desc    Get all leave applications
// @route   GET /api/leave
// @access  Private (Admin)
const getAllLeaves = asyncHandler(async (req, res) => {
    const { status, applicantType, department, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (applicantType) query.applicantType = applicantType;

    const leaves = await LeaveApplication.find(query)
        .populate('applicant', 'firstName lastName email role')
        .populate('student', 'rollNumber department semester')
        .populate('teacher', 'employeeId department designation')
        .populate('reviewedBy', 'firstName lastName')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const total = await LeaveApplication.countDocuments(query);

    res.json({
        success: true,
        data: leaves,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

// @desc    Get pending leave applications
// @route   GET /api/leave/pending
// @access  Private (Admin)
const getPendingLeaves = asyncHandler(async (req, res) => {
    const leaves = await LeaveApplication.find({ status: 'Pending' })
        .populate('applicant', 'firstName lastName email role')
        .populate('student', 'rollNumber department semester')
        .populate('teacher', 'employeeId department designation')
        .sort({ createdAt: 1 });

    res.json({
        success: true,
        count: leaves.length,
        data: leaves,
    });
});

// @desc    Review leave application
// @route   PUT /api/leave/:id/review
// @access  Private (Admin)
const reviewLeave = asyncHandler(async (req, res) => {
    const { status, reviewRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be Approved or Rejected',
        });
    }

    const leave = await LeaveApplication.findById(req.params.id);

    if (!leave) {
        return res.status(404).json({
            success: false,
            message: 'Leave application not found',
        });
    }

    if (leave.status !== 'Pending') {
        return res.status(400).json({
            success: false,
            message: 'Leave application has already been reviewed',
        });
    }

    leave.status = status;
    leave.reviewRemarks = reviewRemarks;
    leave.reviewedBy = req.user.id;
    leave.reviewDate = new Date();

    await leave.save();

    // Notify applicant
    await Notification.create({
        recipient: leave.applicant,
        title: `Leave Application ${status}`,
        message: `Your leave application from ${leave.fromDate.toLocaleDateString()} to ${leave.toDate.toLocaleDateString()} has been ${status.toLowerCase()}. ${reviewRemarks || ''}`,
        type: 'leave',
    });

    // Notify parent if student
    if (leave.applicantType === 'Student' && leave.student) {
        const student = await Student.findById(leave.student).populate('parentGuardian');
        if (student && student.parentGuardian) {
            const parent = await require('../models/Parent').findById(student.parentGuardian);
            if (parent) {
                await Notification.create({
                    recipient: parent.user,
                    recipientRole: 'parent',
                    title: `Ward's Leave ${status}`,
                    message: `Your ward's leave application has been ${status.toLowerCase()}.`,
                    type: 'leave',
                });
            }
        }
    }

    res.json({
        success: true,
        message: `Leave application ${status.toLowerCase()} successfully`,
        data: leave,
    });
});

// @desc    Cancel leave application
// @route   PUT /api/leave/:id/cancel
// @access  Private (Applicant)
const cancelLeave = asyncHandler(async (req, res) => {
    const leave = await LeaveApplication.findById(req.params.id);

    if (!leave) {
        return res.status(404).json({
            success: false,
            message: 'Leave application not found',
        });
    }

    if (leave.applicant.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to cancel this application',
        });
    }

    if (leave.status !== 'Pending') {
        return res.status(400).json({
            success: false,
            message: 'Only pending applications can be cancelled',
        });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.json({
        success: true,
        message: 'Leave application cancelled successfully',
        data: leave,
    });
});

// @desc    Get leave analytics
// @route   GET /api/leave/analytics
// @access  Private (Admin)
const getLeaveAnalytics = asyncHandler(async (req, res) => {
    const { year, month } = req.query;

    // Status distribution
    const statusDistribution = await LeaveApplication.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    // Leave type distribution
    const typeDistribution = await LeaveApplication.aggregate([
        {
            $group: {
                _id: '$leaveType',
                count: { $sum: 1 },
            },
        },
    ]);

    // Monthly trend
    const monthlyTrend = await LeaveApplication.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$fromDate' } },
                count: { $sum: 1 },
                approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    res.json({
        success: true,
        data: {
            statusDistribution,
            typeDistribution,
            monthlyTrend,
        },
    });
});

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    getPendingLeaves,
    reviewLeave,
    cancelLeave,
    getLeaveAnalytics,
};
