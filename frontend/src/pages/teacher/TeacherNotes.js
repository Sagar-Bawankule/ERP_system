import React, { useState, useEffect } from 'react';
import { FiUpload, FiFileText, FiDownload, FiTrash2, FiSearch, FiPlus, FiFile } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../student/StudentPages.css';

const TeacherNotes = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadForm, setUploadForm] = useState({
        title: '',
        subjectId: '',
        type: 'Notes',
        description: '',
        file: null
    });

    useEffect(() => {
        fetchNotes();
        fetchSubjects();
    }, []);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notes/my-notes');
            setNotes(res.data.data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Failed to load notes');
            setNotes([]);
        }
        setLoading(false);
    };

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            setSubjects(res.data.data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.title || !uploadForm.subjectId) {
            toast.error('Please fill all required fields');
            return;
        }

        if (!uploadForm.file) {
            toast.error('Please select a file to upload');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', uploadForm.title);
            formData.append('subjectId', uploadForm.subjectId);
            formData.append('type', uploadForm.type);
            formData.append('description', uploadForm.description);
            formData.append('noteFile', uploadForm.file);

            await api.post('/notes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Notes uploaded successfully!');
            setShowUploadModal(false);
            setUploadForm({ title: '', subjectId: '', type: 'Notes', description: '', file: null });
            fetchNotes();
        } catch (error) {
            console.error('Error uploading note:', error);
            toast.error(error.response?.data?.message || 'Failed to upload notes');
        }
        setSubmitting(false);
    };

    const handleDownload = async (note) => {
        try {
            // First, increment download counter
            const res = await api.get(`/notes/${note._id}/download`);

            if (res.data.success) {
                // Open the file URL in a new tab or trigger download
                const fileUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${res.data.data.downloadUrl}`;

                // Create a temporary link to trigger download
                const link = document.createElement('a');
                link.href = fileUrl;
                link.target = '_blank';
                link.download = res.data.data.filename || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success('Download started');
                // Refresh to update download count
                fetchNotes();
            }
        } catch (error) {
            console.error('Error downloading:', error);
            toast.error('Failed to download file');
        }
    };

    const handleDelete = async (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await api.delete(`/notes/${noteId}`);
                toast.success('Note deleted successfully');
                fetchNotes();
            } catch (error) {
                console.error('Error deleting note:', error);
                toast.error(error.response?.data?.message || 'Failed to delete note');
            }
        }
    };

    const filteredNotes = notes.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Notes': return '📖';
            case 'Assignment': return '📝';
            case 'Syllabus': return '📋';
            case 'Question Paper': return '📄';
            case 'Presentation': return '📊';
            case 'Lab Manual': return '🔬';
            default: return '📄';
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
            <div className="section-card" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ padding: 'var(--spacing-4)', position: 'relative' }}>
                    <FiSearch style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: 40 }}
                    />
                </div>
            </div>

            {/* Notes Grid */}
            {filteredNotes.length > 0 ? (
                <div className="materials-grid">
                    {filteredNotes.map((note) => (
                        <div key={note._id} className="material-card">
                            <div className="material-icon">
                                {getTypeIcon(note.type)}
                            </div>
                            <div className="material-content">
                                <h3>{note.title}</h3>
                                <p className="material-subject">{note.subject?.name || 'Unknown Subject'}</p>
                                <div className="material-meta">
                                    <span className="badge badge-info">{note.type}</span>
                                    <span>{formatFileSize(note.file?.size)}</span>
                                </div>
                                <div className="material-stats">
                                    <span><FiDownload /> {note.downloads || 0} downloads</span>
                                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="material-actions">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleDownload(note)}
                                >
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
            ) : (
                <div className="section-card">
                    <div className="empty-state" style={{ padding: 'var(--spacing-12)' }}>
                        <FiFileText size={48} />
                        <h3>No Notes Found</h3>
                        <p>{searchQuery ? 'No notes match your search.' : 'Upload your first study material to get started.'}</p>
                    </div>
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
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject *</label>
                                <select
                                    className="form-select"
                                    value={uploadForm.subjectId}
                                    onChange={(e) => setUploadForm({ ...uploadForm, subjectId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(subject => (
                                        <option key={subject._id} value={subject._id}>
                                            {subject.code} - {subject.name}
                                        </option>
                                    ))}
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
                                    <option value="Question Paper">Question Paper</option>
                                    <option value="Presentation">Presentation</option>
                                    <option value="Lab Manual">Lab Manual</option>
                                    <option value="Other">Other</option>
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
                                <label className="form-label">File * (PDF, DOC, PPT, etc.)</label>
                                <div style={{
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--spacing-6)',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: 'var(--bg-secondary)'
                                }}>
                                    <input
                                        type="file"
                                        id="file-input"
                                        style={{ display: 'none' }}
                                        onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                                    />
                                    <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                                        {uploadForm.file ? (
                                            <div>
                                                <FiFile size={32} style={{ color: 'var(--primary-color)' }} />
                                                <p style={{ marginTop: 'var(--spacing-2)', fontWeight: 500 }}>{uploadForm.file.name}</p>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    {formatFileSize(uploadForm.file.size)}
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <FiUpload size={32} style={{ color: 'var(--text-muted)' }} />
                                                <p style={{ marginTop: 'var(--spacing-2)', color: 'var(--text-muted)' }}>
                                                    Click to select a file
                                                </p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    <FiUpload /> {submitting ? 'Uploading...' : 'Upload'}
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
