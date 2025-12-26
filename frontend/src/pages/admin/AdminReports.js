import React, { useState } from 'react';
import { FiFileText, FiDownload, FiCalendar, FiUsers, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../student/StudentPages.css';

const AdminReports = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [selectedReport, setSelectedReport] = useState('');

    const reports = [
        { id: 'attendance', name: 'Attendance Report', icon: FiCalendar, description: 'Daily, weekly, and monthly attendance statistics', color: 'var(--primary-color)' },
        { id: 'students', name: 'Student Report', icon: FiUsers, description: 'Student enrollment and demographic data', color: 'var(--secondary-color)' },
        { id: 'fees', name: 'Fee Collection Report', icon: FiDollarSign, description: 'Fee collection status and pending dues', color: 'var(--success-color)' },
        { id: 'academic', name: 'Academic Report', icon: FiBarChart2, description: 'Exam results and academic performance', color: 'var(--warning-color)' },
        { id: 'scholarship', name: 'Scholarship Report', icon: FiFileText, description: 'Scholarship disbursement details', color: 'var(--info-color)' },
        { id: 'leave', name: 'Leave Report', icon: FiCalendar, description: 'Leave applications and approval statistics', color: 'var(--error-color)' },
    ];

    const handleGenerateReport = (reportId) => {
        setLoading(true);
        setSelectedReport(reportId);

        // Simulate report generation
        setTimeout(() => {
            setLoading(false);
            toast.success(`${reports.find(r => r.id === reportId)?.name} generated successfully!`);
        }, 1500);
    };

    const handleDownload = (reportId, format) => {
        toast.info(`Downloading ${reports.find(r => r.id === reportId)?.name} as ${format.toUpperCase()}...`);
    };

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Reports</h1>
                    <p>Generate and download various reports</p>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="section-card" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div className="section-header">
                    <h2><FiCalendar /> Report Period</h2>
                </div>
                <div style={{ padding: 'var(--spacing-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                    <div className="form-group">
                        <label className="form-label">From Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">To Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Quick Select</label>
                        <select className="form-select" onChange={(e) => {
                            const today = new Date();
                            const value = e.target.value;
                            if (value === 'today') {
                                setDateRange({ from: today.toISOString().split('T')[0], to: today.toISOString().split('T')[0] });
                            } else if (value === 'week') {
                                const weekAgo = new Date(today.setDate(today.getDate() - 7));
                                setDateRange({ from: weekAgo.toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] });
                            } else if (value === 'month') {
                                const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
                                setDateRange({ from: monthAgo.toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] });
                            }
                        }}>
                            <option value="">Select Period</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Report Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-4)' }}>
                {reports.map((report) => {
                    const Icon = report.icon;
                    return (
                        <div key={report.id} className="section-card">
                            <div style={{ padding: 'var(--spacing-6)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 'var(--radius-lg)',
                                        background: `${report.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: report.color,
                                        flexShrink: 0
                                    }}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ marginBottom: 'var(--spacing-1)' }}>{report.name}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{report.description}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleGenerateReport(report.id)}
                                        disabled={loading && selectedReport === report.id}
                                    >
                                        {loading && selectedReport === report.id ? 'Generating...' : 'Generate'}
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleDownload(report.id, 'pdf')}
                                    >
                                        <FiDownload /> PDF
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleDownload(report.id, 'excel')}
                                    >
                                        <FiDownload /> Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Reports */}
            <div className="section-card" style={{ marginTop: 'var(--spacing-6)' }}>
                <div className="section-header">
                    <h2><FiFileText /> Recently Generated</h2>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Report Name</th>
                                <th>Period</th>
                                <th>Generated On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Monthly Attendance Report</strong></td>
                                <td>Dec 2024</td>
                                <td>Today, 10:30 AM</td>
                                <td>
                                    <button className="btn btn-secondary btn-sm"><FiDownload /> Download</button>
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Fee Collection Report</strong></td>
                                <td>Q4 2024</td>
                                <td>Yesterday</td>
                                <td>
                                    <button className="btn btn-secondary btn-sm"><FiDownload /> Download</button>
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Academic Performance Report</strong></td>
                                <td>Semester 5</td>
                                <td>Dec 20, 2024</td>
                                <td>
                                    <button className="btn btn-secondary btn-sm"><FiDownload /> Download</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
