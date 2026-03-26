const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { ROLES, ROLE_PERMISSIONS, getModulesForRole, getRoleLabel } = require('../config/roles');

// @desc    Get Super Admin dashboard with full system stats
// @route   GET /api/super-admin/dashboard
// @access  Private (Super Admin only)
const getSuperAdminDashboard = asyncHandler(async (req, res) => {
    // User counts by role
    const userCounts = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const countsMap = {};
    userCounts.forEach(item => {
        countsMap[item._id] = item.count;
    });

    // Recent users
    const recentUsers = await User.find()
        .select('firstName lastName email role isActive createdAt lastLogin')
        .sort({ createdAt: -1 })
        .limit(15);

    // Active vs inactive users
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    res.json({
        success: true,
        data: {
            userCounts: countsMap,
            totalUsers: userCounts.reduce((sum, item) => sum + item.count, 0),
            activeUsers,
            inactiveUsers,
            recentUsers,
            availableRoles: Object.values(ROLES).map(role => ({
                value: role,
                label: getRoleLabel(role),
                modules: getModulesForRole(role),
            })),
        },
    });
});

// @desc    Get all users with filters
// @route   GET /api/super-admin/users
// @access  Private (Super Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
    const { role, search, isActive, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    res.json({
        success: true,
        data: users,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        },
    });
});

// @desc    Create a new user (any role)
// @route   POST /api/super-admin/users
// @access  Private (Super Admin only)
const createUser = asyncHandler(async (req, res) => {
    const { email, password, role, firstName, lastName, phone } = req.body;

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
        return res.status(400).json({
            success: false,
            message: `Invalid role. Valid roles: ${Object.values(ROLES).join(', ')}`,
        });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email',
        });
    }

    const user = await User.create({
        email,
        password,
        role,
        firstName,
        lastName,
        phone,
    });

    res.status(201).json({
        success: true,
        message: `${getRoleLabel(role)} user created successfully`,
        data: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        },
    });
});

// @desc    Update user role
// @route   PUT /api/super-admin/users/:id/role
// @access  Private (Super Admin only)
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!Object.values(ROLES).includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user.id) {
        return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.json({
        success: true,
        message: `User role updated to ${getRoleLabel(role)}`,
        data: user,
    });
});

// @desc    Toggle user status (activate/deactivate)
// @route   PUT /api/super-admin/users/:id/status
// @access  Private (Super Admin only)
const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
        return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: user,
    });
});

// @desc    Delete a user
// @route   DELETE /api/super-admin/users/:id
// @access  Private (Super Admin only)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'User deleted successfully',
    });
});

// @desc    Get role permissions config
// @route   GET /api/super-admin/roles
// @access  Private (Super Admin only)
const getRolesConfig = asyncHandler(async (req, res) => {
    const rolesConfig = Object.values(ROLES).map(role => ({
        role,
        label: getRoleLabel(role),
        modules: getModulesForRole(role),
        permissions: ROLE_PERMISSIONS[role] || {},
    }));

    res.json({
        success: true,
        data: rolesConfig,
    });
});

module.exports = {
    getSuperAdminDashboard,
    getAllUsers,
    createUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    getRolesConfig,
};
