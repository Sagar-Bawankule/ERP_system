import React, { useState, useEffect } from 'react';
import { FiUpload, FiFileText, FiDownload, FiTrash2, FiSearch, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../student/StudentPages.css';

const TeacherNotes = () => {
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadForm, setUploadForm] = useState({
        title: '',
        subject: '',
        type: 'Notes',
        description: '',
        file: null
    });

    useEffect(() => {
        loadDemoData();
    }, []);

    const loadDemoData = () => {
        setNotes([
            { _id: '1', title: 'DBMS Unit 1 - Introduction', subject: 'Database Management', type: 'Notes', uploadedAt: new Date(), downloads: 45, fileSize: '2.5 MB' },
            { _id: '2', title: 'SQL Queries Practice', subject: 'Database Management', type: 'Assignment', uploadedAt: new Date(), downloads: 32, fileSize: '1.2 MB' },
            { _id: '3', title: 'OS Unit 2 - Process Management', subject: 'Operating Systems', type: 'Notes', uploadedAt: new Date(), downloads: 28, fileSize: '3.1 MB' },
            { _id: '4', title: 'CN Lab Manual', subject: 'Computer Networks', type: 'Notes', uploadedAt: new Date(), downloads: 56, fileSize: '5.4 MB' },
        ]);
        setLoading(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.title || !uploadForm.subject) {
            toast.error('Please fill all required fields');
            return;
        }

        // API call would go here
        const newNote = {
            _id: Date.now().toString(),
            ...uploadForm,
            uploadedAt: new Date(),
            downloads: 0,
            fileSize: '1.0 MB'
        };
        setNotes([newNote, ...notes]);
        setShowUploadModal(false);
        setUploadForm({ title: '', subject: '', type: 'Notes', description: '', file: null });
        toast.success('Notes uploaded successfully!');
    };

    const handleDelete = async (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            setNotes(notes.filter(n => n._id !== noteId));
            toast.success('Note deleted successfully');
        }
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Notes': return '📖';
            case 'Assignment': return '📝';
            case 'Syllabus': return '📋';
            default: return '📄';
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading notes...</p>
            </div>
        );
    }

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Upload Notes</h1>
                    <p>Upload and manage study materials for students</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                    <FiPlus /> Upload New
                </button>
            </div>

            {/* Search */}
            <div className="search-container" style={{ marginBottom: 'var(--spacing-6)' }}>
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    className="form-input"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: 'var(--spacing-10)' }}
                />
            </div>

            {/* Notes Grid */}
            <div className="materials-grid">
                {filteredNotes.map((note) => (
                    <div key={note._id} className="material-card">
                        <div className="material-icon">
                            {getTypeIcon(note.type)}
                        </div>
                        <div className="material-content">
                            <h3>{note.title}</h3>
                            <p className="material-subject">{note.subject}</p>
                            <div className="material-meta">
                                <span className="badge badge-info">{note.type}</span>
                                <span>{note.fileSize}</span>
                            </div>
                            <div className="material-stats">
                                <span><FiDownload /> {note.downloads} downloads</span>
                                <span>{new Date(note.uploadedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="material-actions">
                            <button className="btn btn-secondary btn-sm">
                                <FiDownload /> Download
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleDelete(note._id)}
                                style={{ color: 'var(--error-color)' }}
                            >
                                <FiTrash2 /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredNotes.length === 0 && (
                <div className="empty-state">
                    <FiFileText size={48} />
                    <h3>No notes found</h3>
                    <p>Upload your first study material</p>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><FiUpload /> Upload Notes</h2>
                            <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpload}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    placeholder="Enter note title"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject *</label>
                                <select
                                    className="form-select"
                                    value={uploadForm.subject}
                                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                                >
                                    <option value="">Select Subject</option>
                                    <option value="Database Management">Database Management</option>
                                    <option value="Operating Systems">Operating Systems</option>
                                    <option value="Computer Networks">Computer Networks</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select
                                    className="form-select"
                                    value={uploadForm.type}
                                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                                >
                                    <option value="Notes">Notes</option>
                                    <option value="Assignment">Assignment</option>
                                    <option value="Syllabus">Syllabus</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                    placeholder="Brief description..."
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">File</label>
                                <input
                                    type="file"
                                    className="form-input"
                                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <FiUpload /> Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherNotes;
