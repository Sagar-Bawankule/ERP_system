import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiSearch, FiDownload, FiCheck, FiX, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../student/StudentPages.css';

const AdminFees = () => {
    const [loading, setLoading] = useState(true);
    const [fees, setFees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState({ total: 0, collected: 0, pending: 0 });

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const res = await api.get('/fees');
            setFees(res.data.data || []);
        } catch (error) {
            console.error('Error fetching fees:', error);
            // Demo data
            setFees([
                { _id: '1', student: { rollNumber: 'CE2024001', user: { firstName: 'Rahul', lastName: 'Kumar' } }, feeType: 'Tuition Fee', amount: 55000, paidAmount: 55000, status: 'Paid', dueDate: '2024-08-15' },
                { _id: '2', student: { rollNumber: 'CE2024002', user: { firstName: 'Priya', lastName: 'Singh' } }, feeType: 'Tuition Fee', amount: 55000, paidAmount: 30000, status: 'Partially Paid', dueDate: '2024-08-15' },
                { _id: '3', student: { rollNumber: 'CE2024003', user: { firstName: 'Amit', lastName: 'Jadhav' } }, feeType: 'Tuition Fee', amount: 55000, paidAmount: 0, status: 'Pending', dueDate: '2024-08-15' },
                { _id: '4', student: { rollNumber: 'ME2024001', user: { firstName: 'Sneha', lastName: 'Patil' } }, feeType: 'Hostel Fee', amount: 45000, paidAmount: 45000, status: 'Paid', dueDate: '2024-09-01' },
            ]);
        }
        setLoading(false);
    };

    useEffect(() => {
        const total = fees.reduce((acc, f) => acc + f.amount, 0);
        const collected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
        setStats({ total, collected, pending: total - collected });
    }, [fees]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Paid': return 'badge-success';
            case 'Partially Paid': return 'badge-warning';
            case 'Pending': return 'badge-error';
            default: return 'badge-info';
        }
    };

    const filteredFees = fees.filter(fee => {
        const studentName = `${fee.student?.user?.firstName || ''} ${fee.student?.user?.lastName || ''}`.toLowerCase();
        const matchesSearch = studentName.includes(searchQuery.toLowerCase()) ||
            fee.student?.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || fee.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (amount) => `₹${amount?.toLocaleString() || 0}`;

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading fee records...</p>
            </div>
        );
    }

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Fee Management</h1>
                    <p>Track and manage student fee payments</p>
                </div>
                <button className="btn btn-primary">
                    <FiDownload /> Export Report
                </button>
            </div>

            {/* Stats */}
            <div className="summary-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div className="summary-card">
                    <div className="summary-icon total">
                        <FiDollarSign />
                    </div>
                    <div className="summary-content">
                        <h3>{formatCurrency(stats.total)}</h3>
                        <p>Total Fees</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon present">
                        <FiCheck />
                    </div>
                    <div className="summary-content">
                        <h3>{formatCurrency(stats.collected)}</h3>
                        <p>Collected</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon absent">
                        <FiX />
                    </div>
                    <div className="summary-content">
                        <h3>{formatCurrency(stats.pending)}</h3>
                        <p>Pending</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon percentage">
                        <FiTrendingUp />
                    </div>
                    <div className="summary-content">
                        <h3>{stats.total > 0 ? ((stats.collected / stats.total) * 100).toFixed(1) : 0}%</h3>
                        <p>Collection Rate</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="section-card" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ padding: 'var(--spacing-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">Search</label>
                        <div style={{ position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name or roll number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: 40 }}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Fee Records Table */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Fee Records ({filteredFees.length})</h2>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Student Name</th>
                                <th>Fee Type</th>
                                <th>Total Amount</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFees.map((fee) => (
                                <tr key={fee._id}>
                                    <td><strong>{fee.student?.rollNumber}</strong></td>
                                    <td>{fee.student?.user?.firstName} {fee.student?.user?.lastName}</td>
                                    <td>{fee.feeType}</td>
                                    <td>{formatCurrency(fee.amount)}</td>
                                    <td style={{ color: 'var(--success-color)' }}>{formatCurrency(fee.paidAmount)}</td>
                                    <td style={{ color: 'var(--error-color)' }}>{formatCurrency(fee.amount - fee.paidAmount)}</td>
                                    <td>
                                        <span className={`badge ${getStatusClass(fee.status)}`}>
                                            {fee.status}
                                        </span>
                                    </td>
                                    <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFees;
