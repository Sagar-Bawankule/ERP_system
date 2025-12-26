import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCreditCard, FiDownload, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { feeService } from '../../services/api';
import './StudentPages.css';

const StudentFees = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [fees, setFees] = useState([]);
    const [summary, setSummary] = useState({ total: 0, paid: 0, due: 0 });

    useEffect(() => {
        if (profile?._id) {
            fetchFees();
        } else {
            setDemoData();
        }
    }, [profile]);

    const fetchFees = async () => {
        try {
            const res = await feeService.getStudentFees(profile._id);
            const feesData = res.data.data || [];

            // Map fee data to include structure name
            const formattedFees = feesData.map(fee => ({
                ...fee,
                name: fee.feeStructure?.name || fee.name || 'Fee',
            }));
            setFees(formattedFees);

            // Calculate summary from fees (backend returns totalAmount/paidAmount/dueAmount)
            const calcSummary = {
                total: res.data.summary?.totalAmount || feesData.reduce((sum, f) => sum + (f.totalAmount || 0), 0),
                paid: res.data.summary?.paidAmount || feesData.reduce((sum, f) => sum + (f.paidAmount || 0), 0),
                due: res.data.summary?.dueAmount || feesData.reduce((sum, f) => sum + (f.dueAmount || 0), 0),
            };
            setSummary(calcSummary);
        } catch (error) {
            console.error('Error fetching fees:', error);
            setDemoData();
        }
        setLoading(false);
    };

    const setDemoData = () => {
        setFees([
            {
                _id: '1',
                name: 'Tuition Fee - Odd Semester 2024-25',
                academicYear: '2024-25',
                semester: 5,
                totalAmount: 55000,
                paidAmount: 55000,
                dueAmount: 0,
                status: 'Paid',
                dueDate: new Date('2024-08-15'),
            },
            {
                _id: '2',
                name: 'Exam Fee - Semester 5',
                academicYear: '2024-25',
                semester: 5,
                totalAmount: 2700,
                paidAmount: 0,
                dueAmount: 2700,
                status: 'Pending',
                dueDate: new Date('2024-12-31'),
            },
        ]);
        setSummary({ total: 57700, paid: 55000, due: 2700 });
        setLoading(false);
    };

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

            {/* Fee Cards */}
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
        </div>
    );
};

export default StudentFees;
