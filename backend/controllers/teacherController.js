const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin)
const getAllTeachers = asyncHandler(async (req, res) => {
    const { department, designation, search, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (department) query.department = department;
    if (designation) query.designation = designation;

    const teachers = await Teacher.find(query)
        .populate('user', 'firstName lastName email phone profileImage')
        .populate('subjects', 'name code')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ employeeId: 1 });

    const total = await Teacher.countDocuments(query);

    res.json({
        success: true,
        data: teachers,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
const getTeacher = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id)
        .populate('user', 'firstName lastName email phone profileImage address')
        .populate('subjects')
        .populate('assignedClasses.subject');

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Teacher not found',
        });
    }

    res.json({
        success: true,
        data: teacher,
    });
});

// @desc    Create teacher profile
// @route   POST /api/teachers
// @access  Private (Admin)
const createTeacher = asyncHandler(async (req, res) => {
    const {
        email, password, firstName, lastName, phone,
        employeeId, department, designation, qualification,
        specialization, experience, joiningDate, gender,
    } = req.body;

    // Check if employee ID exists
    const empExists = await Teacher.findOne({ employeeId });
    if (empExists) {
        return res.status(400).json({
            success: false,
            message: 'Employee ID already exists',
        });
    }

    // Generate password if not provided
    // Default pattern: employeeId@123 (e.g., T2024001@123)
    const generatedPassword = password || `${employeeId}@123`;

    // Create user first
    const user = await User.create({
        email,
        password: generatedPassword,
        role: 'teacher',
        firstName,
        lastName,
        phone,
    });

    // Create teacher profile
    const teacher = await Teacher.create({
        user: user._id,
        employeeId,
        department,
        designation,
        qualification,
        specialization,
        experience,
        joiningDate,
        gender,
    });

    // Link teacher to user
    user.teacherProfile = teacher._id;
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Teacher created successfully',
        data: teacher,
        credentials: {
            email: email,
            password: generatedPassword,
            note: 'Please share these credentials with the teacher. They should change their password after first login.'
        }
    });
});

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
// @access  Private (Admin, Teacher-own)
const updateTeacher = asyncHandler(async (req, res) => {
    let teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Teacher not found',
        });
    }

    // Check authorization
    if (req.user.role === 'teacher' && teacher.user.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this profile',
        });
    }

    const allowedUpdates = ['specialization', 'qualification'];

    // Admin can update more fields
    if (req.user.role === 'admin') {
        allowedUpdates.push('department', 'designation', 'subjects', 'assignedClasses', 'salary', 'isActive');
    }

    const updates = {};
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }

    teacher = await Teacher.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    }).populate('user', 'firstName lastName email');

    res.json({
        success: true,
        message: 'Teacher updated successfully',
        data: teacher,
    });
});

// @desc    Delete/Deactivate teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
const deleteTeacher = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Teacher not found',
        });
    }

    // Soft delete
    teacher.isActive = false;
    await teacher.save();

    // Deactivate user account
    await User.findByIdAndUpdate(teacher.user, { isActive: false });

    res.json({
        success: true,
        message: 'Teacher deactivated successfully',
    });
});

// @desc    Assign subjects to teacher
// @route   POST /api/teachers/:id/subjects
// @access  Private (Admin)
const assignSubjects = asyncHandler(async (req, res) => {
    const { subjects } = req.body;

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Teacher not found',
        });
    }

    teacher.subjects = subjects;
    await teacher.save();

    res.json({
        success: true,
        message: 'Subjects assigned successfully',
        data: teacher,
    });
});

// @desc    Assign class to teacher
// @route   POST /api/teachers/:id/classes
// @access  Private (Admin)
const assignClass = asyncHandler(async (req, res) => {
    const { department, semester, section, subject } = req.body;

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Teacher not found',
        });
    }

    // Check if class already assigned
    const exists = teacher.assignedClasses.find(
        c => c.department === department && c.semester === semester && c.section === section && c.subject.toString() === subject
    );

    if (exists) {
        return res.status(400).json({
            success: false,
            message: 'Class already assigned to this teacher',
        });
    }

    teacher.assignedClasses.push({ department, semester, section, subject });
    await teacher.save();

    res.json({
        success: true,
        message: 'Class assigned successfully',
        data: teacher,
    });
});

// @desc    Get teachers by department
// @route   GET /api/teachers/department/:department
// @access  Private
const getTeachersByDepartment = asyncHandler(async (req, res) => {
    const teachers = await Teacher.find({
        department: req.params.department,
        isActive: true,
    })
        .populate('user', 'firstName lastName email phone profileImage')
        .sort({ employeeId: 1 });

    res.json({
        success: true,
        count: teachers.length,
        data: teachers,
    });
});

module.exports = {
    getAllTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    assignSubjects,
    assignClass,
    getTeachersByDepartment,
};
