import React, { useState, useEffect } from 'react';
import { FiAward, FiSearch, FiPlus, FiEdit2, FiTrash2, FiUsers, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../student/StudentPages.css';

const AdminScholarships = () => {
    const [loading, setLoading] = useState(true);
    const [scholarships, setScholarships] = useState([]);
    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('scholarships');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', amount: '', eligibilityCriteria: '', applicationDeadline: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/scholarships');
            setScholarships(res.data.data || []);
        } catch (error) {
            // Demo data
            setScholarships([
                { _id: '1', name: 'Merit Scholarship', description: 'For students with CGPA above 9.0', amount: 25000, eligibilityCriteria: 'CGPA > 9.0', applicationDeadline: '2024-12-31', applicantCount: 15, status: 'Active' },
                { _id: '2', name: 'Need-Based Scholarship', description: 'Financial assistance for deserving students', amount: 15000, eligibilityCriteria: 'Family income < 3 LPA', applicationDeadline: '2024-12-31', applicantCount: 28, status: 'Active' },
                { _id: '3', name: 'Sports Excellence Award', description: 'For outstanding sports achievements', amount: 20000, eligibilityCriteria: 'State/National level participation', applicationDeadline: '2024-12-31', applicantCount: 8, status: 'Active' },
            ]);
            setApplications([
                { _id: '1', student: { rollNumber: 'CE2024001', user: { firstName: 'Rahul', lastName: 'Kumar' } }, scholarship: { name: 'Merit Scholarship' }, status: 'Pending', appliedAt: new Date() },
                { _id: '2', student: { rollNumber: 'CE2024002', user: { firstName: 'Priya', lastName: 'Singh' } }, scholarship: { name: 'Need-Based Scholarship' }, status: 'Approved', appliedAt: new Date() },
            ]);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newScholarship = {
            _id: Date.now().toString(),
            ...formData,
            amount: parseInt(formData.amount),
            applicantCount: 0,
            status: 'Active'
        };
        setScholarships([...scholarships, newScholarship]);
        setShowModal(false);
        setFormData({ name: '', description: '', amount: '', eligibilityCriteria: '', applicationDeadline: '' });
        toast.success('Scholarship created successfully!');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this scholarship?')) {
            setScholarships(scholarships.filter(s => s._id !== id));
            toast.success('Scholarship deleted successfully');
        }
    };

    const handleApplicationStatus = async (appId, status) => {
        setApplications(applications.map(app =>
            app._id === appId ? { ...app, status } : app
        ));
        toast.success(`Application ${status.toLowerCase()}`);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Approved': return 'badge-success';
            case 'Rejected': return 'badge-error';
            case 'Pending': return 'badge-warning';
            default: return 'badge-info';
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading scholarships...</p>
            </div>
        );
    }

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Scholarship Management</h1>
                    <p>Create and manage scholarship programs</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Add Scholarship
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--spacing-6)' }}>
                <button
                    className={`tab ${activeTab === 'scholarships' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scholarships')}
                >
                    <FiAward /> Scholarships ({scholarships.length})
                </button>
                <button
                    className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('applications')}
                >
                    <FiUsers /> Applications ({applications.length})
                </button>
            </div>

            {activeTab === 'scholarships' ? (
                <div className="section-card">
                    <div className="section-header">
                        <h2>Available Scholarships</h2>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Amount</th>
                                    <th>Eligibility</th>
                                    <th>Deadline</th>
                                    <th>Applicants</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scholarships.map((scholarship) => (
                                    <tr key={scholarship._id}>
                                        <td>
                                            <strong>{scholarship.name}</strong>
                                            <br />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{scholarship.description}</span>
                                        </td>
                                        <td style={{ color: 'var(--success-color)', fontWeight: 600 }}>₹{scholarship.amount?.toLocaleString()}</td>
                                        <td>{scholarship.eligibilityCriteria}</td>
                                        <td>{new Date(scholarship.applicationDeadline).toLocaleDateString()}</td>
                                        <td>{scholarship.applicantCount}</td>
                                        <td><span className="badge badge-success">{scholarship.status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                                <button className="btn btn-secondary btn-sm"><FiEdit2 /></button>
                                                <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(scholarship._id)} style={{ color: 'var(--error-color)' }}><FiTrash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="section-card">
                    <div className="section-header">
                        <h2>Scholarship Applications</h2>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Scholarship</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app._id}>
                                        <td>
                                            <strong>{app.student?.user?.firstName} {app.student?.user?.lastName}</strong>
                                            <br />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.student?.rollNumber}</span>
                                        </td>
                                        <td>{app.scholarship?.name}</td>
                                        <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                        <td><span className={`badge ${getStatusClass(app.status)}`}>{app.status}</span></td>
                                        <td>
                                            {app.status === 'Pending' && (
                                                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleApplicationStatus(app._id, 'Approved')}>Approve</button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleApplicationStatus(app._id, 'Rejected')} style={{ color: 'var(--error-color)' }}>Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Scholarship Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><FiAward /> Add New Scholarship</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Scholarship Name *</label>
                                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Amount (₹) *</label>
                                    <input type="number" className="form-input" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Application Deadline *</label>
                                    <input type="date" className="form-input" value={formData.applicationDeadline} onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Eligibility Criteria</label>
                                <textarea className="form-input" rows={2} value={formData.eligibilityCriteria} onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })} placeholder="e.g., CGPA > 8.0, Income < 5 LPA" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Scholarship</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminScholarships;
