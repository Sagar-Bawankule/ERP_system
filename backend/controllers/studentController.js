const Student = require('../models/Student');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
const getAllStudents = asyncHandler(async (req, res) => {
    const { department, semester, section, search, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (section) query.section = section;

    const students = await Student.find(query)
        .populate('user', 'firstName lastName email phone profileImage')
        .populate('enrolledSubjects', 'name code')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ rollNumber: 1 });

    const total = await Student.countDocuments(query);

    res.json({
        success: true,
        data: students,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id)
        .populate('user', 'firstName lastName email phone profileImage address')
        .populate('enrolledSubjects')
        .populate('parentGuardian');

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
        });
    }

    res.json({
        success: true,
        data: student,
    });
});

// @desc    Create student profile
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = asyncHandler(async (req, res) => {
    const {
        email, password, firstName, lastName, phone,
        rollNumber, department, course, semester, section,
        batch, dateOfBirth, gender, category, bloodGroup,
    } = req.body;

    // Check if roll number exists
    const rollExists = await Student.findOne({ rollNumber });
    if (rollExists) {
        return res.status(400).json({
            success: false,
            message: 'Roll number already exists',
        });
    }

    // Generate password if not provided
    // Default pattern: rollNumber@123 (e.g., CE2024001@123)
    const generatedPassword = password || `${rollNumber}@123`;

    // Create user first
    const user = await User.create({
        email,
        password: generatedPassword,
        role: 'student',
        firstName,
        lastName,
        phone,
    });

    // Create student profile
    const student = await Student.create({
        user: user._id,
        rollNumber,
        department,
        course,
        semester,
        section,
        batch,
        dateOfBirth,
        gender,
        category,
        bloodGroup,
    });

    // Link student to user
    user.studentProfile = student._id;
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student,
        credentials: {
            email: email,
            password: generatedPassword,
            note: 'Please share these credentials with the student. They should change their password after first login.'
        }
    });
});

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private (Admin, Student-own)
const updateStudent = asyncHandler(async (req, res) => {
    let student = await Student.findById(req.params.id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
        });
    }

    // Check authorization
    if (req.user.role === 'student' && student.user.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this profile',
        });
    }

    const allowedUpdates = ['semester', 'section', 'bloodGroup', 'aadharNumber', 'enrolledSubjects'];

    // Admin can update more fields
    if (req.user.role === 'admin') {
        allowedUpdates.push('department', 'course', 'batch', 'category', 'isActive');
    }

    const updates = {};
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }

    student = await Student.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    }).populate('user', 'firstName lastName email');

    res.json({
        success: true,
        message: 'Student updated successfully',
        data: student,
    });
});

// @desc    Delete/Deactivate student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
        });
    }

    // Soft delete
    student.isActive = false;
    await student.save();

    // Deactivate user account
    await User.findByIdAndUpdate(student.user, { isActive: false });

    res.json({
        success: true,
        message: 'Student deactivated successfully',
    });
});

// @desc    Get students by class
// @route   GET /api/students/class/:department/:semester/:section
// @access  Private (Teacher, Admin)
const getStudentsByClass = asyncHandler(async (req, res) => {
    const { department, semester, section } = req.params;

    const students = await Student.find({
        department,
        semester: parseInt(semester),
        section: section || 'A',
        isActive: true,
    })
        .populate('user', 'firstName lastName email phone profileImage')
        .sort({ rollNumber: 1 });

    res.json({
        success: true,
        count: students.length,
        data: students,
    });
});

// @desc    Get student academic history
// @route   GET /api/students/:id/academic-history
// @access  Private
const getAcademicHistory = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
        });
    }

    res.json({
        success: true,
        data: student.academicHistory,
    });
});

// @desc    Update student academic history
// @route   POST /api/students/:id/academic-history
// @access  Private (Admin)
const updateAcademicHistory = asyncHandler(async (req, res) => {
    const { year, semester, sgpa, cgpa, remarks } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
        });
    }

    student.academicHistory.push({ year, semester, sgpa, cgpa, remarks });
    await student.save();

    res.json({
        success: true,
        message: 'Academic history updated',
        data: student.academicHistory,
    });
});

module.exports = {
    getAllStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    getAcademicHistory,
    updateAcademicHistory,
};
