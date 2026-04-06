import React, { useState, useEffect, useCallback } from 'react';
import { FiFileText, FiDownload, FiBook, FiSearch } from 'react-icons/fi';
import { noteService } from '../../services/api';
import { toast } from 'react-toastify';
import './StudentPages.css';

const StudentNotes = () => {
    const backendBaseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');

    const fetchNotes = useCallback(async () => {
        try {
            const res = await noteService.getAll();
            setNotes(res.data.data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
            setNotes([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleDownload = async (noteId) => {
        try {
            const res = await noteService.download(noteId);
            if (!res.data?.success) {
                toast.error('Download failed');
                return;
            }

            const { downloadUrl, filename } = res.data.data;
            const link = document.createElement('a');
            link.href = `${backendBaseUrl}${downloadUrl}`;
            link.target = '_blank';
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            fetchNotes();
        } catch (error) {
            console.error('Error downloading note:', error);
            toast.error(error.response?.data?.message || 'Failed to download file');
        }
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All' || note.type === filterType;
        return matchesSearch && matchesType;
    });

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'Notes': return 'notes';
            case 'Assignment': return 'assignment';
            case 'Syllabus': return 'syllabus';
            default: return 'notes';
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading study materials...</p>
            </div>
        );
    }

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Study Materials</h1>
                    <p>Access notes, assignments, and learning resources</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="section-card" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ padding: 'var(--spacing-4) var(--spacing-6)', display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: 40 }}
                        />
                    </div>
                    <select
                        className="form-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ width: 150 }}
                    >
                        <option value="All">All Types</option>
                        <option value="Notes">Notes</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Syllabus">Syllabus</option>
                        <option value="Question Paper">Question Paper</option>
                    </select>
                </div>
            </div>

            {/* Notes Grid */}
            {filteredNotes.length > 0 ? (
                <div className="notes-grid">
                    {filteredNotes.map((note) => (
                        <div key={note._id} className="note-card">
                            <div className="note-card-header">
                                <span className={`note-type-badge ${getTypeBadgeClass(note.type)}`}>
                                    <FiFileText size={12} />
                                    {note.type}
                                </span>
                                <h3>{note.title}</h3>
                                <p>{note.subject?.name} ({note.subject?.code})</p>
                            </div>
                            <div className="note-card-body">
                                <div className="note-meta">
                                    <span>
                                        By {note.uploadedBy?.user?.firstName} {note.uploadedBy?.user?.lastName}
                                    </span>
                                    <span>
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="note-card-footer">
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                                    <FiDownload style={{ marginRight: 4 }} />
                                    {note.downloads} downloads
                                </span>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleDownload(note._id)}
                                >
                                    <FiDownload /> Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <FiBook size={48} />
                    <h3>No materials found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    );
};

export default StudentNotes;
