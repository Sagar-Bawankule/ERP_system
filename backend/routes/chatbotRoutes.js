const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { sendChatMessage } = require('../controllers/chatbotController');

// Rate limiting for chatbot - prevent abuse
const chatbotRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests. Please wait a minute before sending another message.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limit for repeated messages
const strictRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per 15 minutes
    message: {
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all chatbot routes
router.use(strictRateLimit);
router.use(chatbotRateLimit);

// @route   POST /api/chatbot/chat
// @desc    Send message to chatbot
// @access  Public (rate limited)
router.post('/chat', sendChatMessage);

module.exports = router;