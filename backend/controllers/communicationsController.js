const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all communications
// @route   GET /api/communications
// @access  Private (Receptionist, Admin)
const getCommunications = asyncHandler(async (req, res) => {
    // Return demo data since this feature was removed from UI
    res.json({
        success: true,
        data: [],
        message: 'Communications feature is currently disabled'
    });
});

// @desc    Create new communication
// @route   POST /api/communications
// @access  Private (Receptionist, Admin)
const createCommunication = asyncHandler(async (req, res) => {
    // Return success response for demo purposes
    res.status(201).json({
        success: true,
        data: {
            _id: Date.now().toString(),
            ...req.body,
            status: 'sent',
            sentAt: new Date(),
        },
        message: 'Communication sent successfully (demo)'
    });
});

module.exports = {
    getCommunications,
    createCommunication,
};