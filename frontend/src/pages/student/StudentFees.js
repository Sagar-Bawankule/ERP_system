import React, { useState, useEffect, useCallback } from 'react';
import { FiDollarSign, FiCreditCard, FiDownload, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { feeService } from '../../services/api';
import './StudentPages.css';

const StudentFees = () => {
    const [loading, setLoading] = useState(true);
    const [fees, setFees] = useState([]);
    const [summary, setSummary] = useState({ total: 0, paid: 0, due: 0 });
    const [error, setError] = useState(null);

    const fetchFees = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Use the new /my-fees endpoint which auto-assigns fees if needed
            const res = await feeService.getMyFees();
            const feesData = res.data.data || [];

            // Map fee data to include structure name
            const formattedFees = feesData.map(fee => ({
                ...fee,
                name: fee.feeStructure?.name || fee.name || 'Fee',
            }));
            setFees(formattedFees);

            // Use summary from backend response
            const calcSummary = {
                total: res.data.summary?.totalAmount || feesData.reduce((sum, f) => sum + (f.totalAmount || 0), 0),
                paid: res.data.summary?.paidAmount || feesData.reduce((sum, f) => sum + (f.paidAmount || 0), 0),
                due: res.data.summary?.dueAmount || feesData.reduce((sum, f) => sum + (f.dueAmount || 0), 0),
            };
            setSummary(calcSummary);
        } catch (error) {
            console.error('Error fetching fees:', error);
            setError('Unable to load fee information. Please try again later.');
            setFees([]);
            setSummary({ total: 0, paid: 0, due: 0 });
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFees();
    }, [fetchFees]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Paid': return 'paid';
            case 'Pending': return 'pending';
            case 'Overdue': return 'overdue';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading fees...</p>
            </div>
        );
    }

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Fee Payment</h1>
                    <p>View and pay your fees online</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-icon total">
                        <FiDollarSign />
                    </div>
                    <div className="summary-content">
                        <h3>₹{summary.total?.toLocaleString()}</h3>
                        <p>Total Fees</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon present">
                        <FiCreditCard />
                    </div>
                    <div className="summary-content">
                        <h3>₹{summary.paid?.toLocaleString()}</h3>
                        <p>Paid</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon absent">
                        <FiDollarSign />
                    </div>
                    <div className="summary-content">
                        <h3>₹{summary.due?.toLocaleString()}</h3>
                        <p>Due Amount</p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="section-card" style={{ marginBottom: 'var(--spacing-6)', padding: 'var(--spacing-4)', background: 'var(--error-bg)', borderLeft: '4px solid var(--error-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--error-color)' }}>
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Fee Cards */}
            {fees.length > 0 ? (
                <div className="fee-cards-grid">
                    {fees.map((fee) => (
                        <div key={fee._id} className={`fee-card ${getStatusClass(fee.status)}`}>
                            <div className="fee-card-header">
                                <div>
                                    <h3>{fee.name}</h3>
                                    <p>Academic Year: {fee.academicYear}</p>
                                </div>
                                <span className={`badge badge-${fee.status === 'Paid' ? 'success' : fee.status === 'Overdue' ? 'error' : 'warning'}`}>
                                    {fee.status}
                                </span>
                            </div>
                            <div className="fee-card-body">
                                <div className="fee-amount-row">
                                    <span>Total Amount</span>
                                    <span>₹{fee.totalAmount?.toLocaleString()}</span>
                                </div>
                                <div className="fee-amount-row">
                                    <span>Paid Amount</span>
                                    <span className="text-success">₹{fee.paidAmount?.toLocaleString()}</span>
                                </div>
                                <div className="fee-amount-row total">
                                    <span>Due Amount</span>
                                    <span className={fee.dueAmount > 0 ? 'text-error' : ''}>
                                        ₹{fee.dueAmount?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="fee-card-footer">
                                <div className="due-date">
                                    <FiCalendar style={{ marginRight: 4 }} />
                                    Due: {new Date(fee.dueDate).toLocaleDateString()}
                                </div>
                                {fee.status === 'Paid' ? (
                                    <button className="btn btn-secondary btn-sm">
                                        <FiDownload /> Receipt
                                    </button>
                                ) : (
                                    <button className="btn btn-primary btn-sm">
                                        Pay Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : !error && (
                <div className="section-card">
                    <div className="empty-state" style={{ padding: 'var(--spacing-12)', textAlign: 'center' }}>
                        <FiDollarSign size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-4)' }} />
                        <h3>No Fees Assigned</h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            No fee structures have been assigned to your account yet. 
                            Please contact the administration office if you believe this is an error.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentFees;
