const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    description: {
        type: String,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    semester: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['Notes', 'Assignment', 'Question Paper', 'Reference', 'Presentation', 'Lab Manual', 'Other'],
        default: 'Notes',
    },
    file: {
        name: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number },
        mimeType: { type: String },
    },
    tags: [{
        type: String,
    }],
    unit: {
        type: Number,
        min: 1,
        max: 6,
    },
    isVisible: {
        type: Boolean,
        default: true,
    },
    downloads: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Index for faster queries
noteSchema.index({ subject: 1, department: 1, semester: 1 });
noteSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);
