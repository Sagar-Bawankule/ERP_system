const { asyncHandler } = require('../middleware/errorHandler');
const fetch = require('node-fetch');

// Helper function to clean markdown formatting
function cleanMarkdownFormatting(text) {
    return text
        // First pass - remove markdown syntax
        .replace(/\*{1,3}([^*\n]*?)\*{1,3}/g, '$1')
        .replace(/_{1,2}([^_\n]*?)_{1,2}/g, '$1')
        .replace(/`([^`\n]*?)`/g, '$1')
        .replace(/#{1,6}\s*/g, '')
        
        // Second pass - handle bullet points and lists
        .replace(/^\s*[\*\-\+]\s+/gm, '- ')
        .replace(/\*\s+/g, '- ')
        
        // Third pass - remove any remaining asterisks or markdown characters
        .replace(/\*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links [text](url)
        
        // Clean up spacing
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n\s*\n+/g, '\n\n')
        .trim();
}

// System context for the chatbot
const SYSTEM_CONTEXT = `You are a helpful assistant for Samarth College of Engineering & Management ERP System. 
Answer questions about:
- Student portal: attendance, marks, fees, study materials, leave applications, scholarships
- Teacher portal: marking attendance, uploading notes, entering marks
- Parent portal: monitoring ward's attendance, fees, marks
- Admin dashboard: student management, fees, analytics
- The college has 7 departments: Computer Engineering, Mechanical Engineering, Civil Engineering, Electrical Engineering, Electronics Engineering, Information Technology, Artificial Intelligence and Machine Learning
- The college has 2500+ students, 95% placement rate, 15+ years of excellence
Keep answers short, friendly and helpful. If asked something unrelated to the college/ERP, politely redirect.

CRITICAL FORMATTING RULES:
- Use plain text only, no markdown formatting
- Use simple dashes (-) for lists, not asterisks
- Do not use **bold**, *italic*, or any markdown syntax
- Write in a natural, conversational style`;

function getLocalFallbackResponse(userMessage = '') {
    const text = userMessage.toLowerCase();

    if (text.includes('attendance') || text.includes('hajeri')) {
        return 'To check attendance: Student -> Attendance page. Teachers mark attendance from Teacher Portal -> Attendance. If attendance is not visible, refresh once and select the current month.';
    }

    if (text.includes('marks') || text.includes('result')) {
        return 'Marks are available in Student -> Marks & Results. Parents can check ward marks from Parent -> Academic Performance. Teachers enter marks from Teacher -> Marks Entry.';
    }

    if (text.includes('fees') || text.includes('payment')) {
        return 'For fees, open Student/Parent -> Fees. You can view paid, pending, and due details there. For corrections, contact the admin/accountant desk.';
    }

    if (text.includes('note') || text.includes('study material') || text.includes('download')) {
        return 'Study materials are available in Student -> Study Materials. If download fails, please try again after refresh. Teachers can upload from Teacher -> Upload Notes.';
    }

    if (text.includes('leave') || text.includes('application')) {
        return 'Students can apply leave from Student -> Leave. Parents can track leave status from Parent -> Leave. Admin reviews and approves/rejects requests.';
    }

    if (text.includes('meeting') || text.includes('virtual class')) {
        return 'Virtual class links are available under Virtual Classes/Meetings section. Teachers can create meetings from Teacher -> Virtual Classes.';
    }

    return 'I can help with ERP features like attendance, marks, fees, study materials, leave, meetings, and admin workflows. Please tell me what you want to do.';
}

// @desc    Send message to chatbot
// @route   POST /api/chatbot/chat
// @access  Public (rate limited)
const sendChatMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Message is required'
        });
    }

    // Validate message length
    if (message.length > 1000) {
        return res.status(400).json({
            success: false,
            message: 'Message is too long. Please keep it under 1000 characters.'
        });
    }

    // If API key is missing, serve local fallback response
    if (!process.env.GEMINI_API_KEY) {
        return res.json({
            success: true,
            data: {
                message: getLocalFallbackResponse(message),
                timestamp: new Date(),
                source: 'local-fallback'
            }
        });
    }

    try {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: SYSTEM_CONTEXT },
                        { text: `User question: ${message}` }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.8,
                maxOutputTokens: 500,
            }
        };

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API error:', response.status, errorData);

            return res.json({
                success: true,
                data: {
                    message: getLocalFallbackResponse(message),
                    timestamp: new Date(),
                    source: 'local-fallback'
                }
            });
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            let botResponse = data.candidates[0].content.parts[0].text;
            
            // Simple but effective cleaning - remove all asterisks and common markdown
            botResponse = botResponse
                .replace(/\*/g, '')                    // Remove ALL asterisks
                .replace(/_{1,2}/g, '')               // Remove underscores
                .replace(/`/g, '')                    // Remove backticks
                .replace(/#+\s*/g, '')               // Remove headers
                .replace(/\s+/g, ' ')                // Normalize spaces
                .replace(/\n\s*\n\s*\n+/g, '\n\n')  // Clean line breaks
                .trim();
            
            res.json({
                success: true,
                data: {
                    message: botResponse,
                    timestamp: new Date()
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    message: getLocalFallbackResponse(message),
                    timestamp: new Date(),
                    source: 'local-fallback'
                }
            });
        }

    } catch (error) {
        console.error('Chatbot error:', error);
        res.json({
            success: true,
            data: {
                message: getLocalFallbackResponse(message),
                timestamp: new Date(),
                source: 'local-fallback'
            }
        });
    }
});

module.exports = {
    sendChatMessage
};
