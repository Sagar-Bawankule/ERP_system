import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../student/StudentPages.css';

const AdminLeaves = () => {
    const [loading, setLoading] = useState(true);
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState('Pending');

    useEffect(() => {
        fetchLeaves();
    }, [filter]);

    const fetchLeaves = async () => {
        try {
            const res = await api.get(`/leave?status=${filter}`);
            setLeaves(res.data.data || []);
        } catch (error) {
            console.error('Error fetching leaves:', error);
            // Demo data
            setLeaves([
                { _id: '1', leaveType: 'Sick Leave', fromDate: '2024-12-23', toDate: '2024-12-23', numberOfDays: 1, reason: 'Testing leave', status: 'Pending', applicant: { firstName: 'Rahul', lastName: 'Kumar' }, applicantType: 'Student', createdAt: new Date() },
            ]);
        }
        setLoading(false);
    };

    const handleReview = async (leaveId, status) => {
        try {
            await api.put(`/leave/${leaveId}/review`, { status, reviewRemarks: `${status} by admin` });
            toast.success(`Leave ${status.toLowerCase()} successfully`);
            fetchLeaves();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update leave');
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Approved': return 'badge-success';
            case 'Rejected': return 'badge-error';
            default: return 'badge-warning';
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading leave applications...</p>
            </div>
        );
    }

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Leave Applications</h1>
                    <p>Review and approve leave applications</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ marginBottom: 'var(--spacing-6)', display: 'flex', gap: 'var(--spacing-2)' }}>
                {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => (
                    <button
                        key={tab}
                        className={`btn ${filter === tab || (tab === 'All' && filter === '') ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter(tab === 'All' ? '' : tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Leave List */}
            <div className="section-card">
                <div className="section-header">
                    <h2><FiCalendar style={{ marginRight: 8 }} /> Applications ({leaves.length})</h2>
                </div>
                {leaves.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Type</th>
                                    <th>Duration</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((leave) => (
                                    <tr key={leave._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                                                <FiUser />
                                                <div>
                                                    <strong>{leave.applicant?.firstName} {leave.applicant?.lastName}</strong>
                                                    <br />
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{leave.applicantType}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{leave.leaveType}</td>
                                        <td>
                                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                            <br />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{leave.numberOfDays} day(s)</span>
                                        </td>
                                        <td style={{ maxWidth: 200 }}>{leave.reason}</td>
                                        <td>
                                            <span className={`badge ${getStatusClass(leave.status)}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td>
                                            {leave.status === 'Pending' ? (
                                                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleReview(leave._id, 'Approved')}
                                                    >
                                                        <FiCheck /> Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleReview(leave._id, 'Rejected')}
                                                        style={{ color: 'var(--error-color)' }}
                                                    >
                                                        <FiX /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <FiCalendar size={48} />
                        <h3>No leave applications</h3>
                        <p>No {filter.toLowerCase()} leave applications found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLeaves;
