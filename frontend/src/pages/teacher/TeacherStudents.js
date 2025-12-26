import React, { useState, useEffect } from 'react';
import { FiUser, FiSearch, FiMail, FiPhone, FiCalendar, FiEye } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../student/StudentPages.css';

const TeacherStudents = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        loadDemoData();
    }, []);

    const loadDemoData = () => {
        setStudents([
            { _id: '1', rollNumber: 'CE2024001', name: 'Rahul Kumar', email: 'rahul@example.com', phone: '9876543210', department: 'Computer Engineering', semester: 5, section: 'A', attendance: 85, cgpa: 8.2 },
            { _id: '2', rollNumber: 'CE2024002', name: 'Priya Singh', email: 'priya@example.com', phone: '9876543211', department: 'Computer Engineering', semester: 5, section: 'A', attendance: 92, cgpa: 9.1 },
            { _id: '3', rollNumber: 'CE2024003', name: 'Amit Jadhav', email: 'amit@example.com', phone: '9876543212', department: 'Computer Engineering', semester: 5, section: 'A', attendance: 78, cgpa: 7.5 },
            { _id: '4', rollNumber: 'CE2024004', name: 'Sneha Patil', email: 'sneha@example.com', phone: '9876543213', department: 'Computer Engineering', semester: 5, section: 'A', attendance: 88, cgpa: 8.8 },
            { _id: '5', rollNumber: 'CE2024005', name: 'Vikram Sharma', email: 'vikram@example.com', phone: '9876543214', department: 'Computer Engineering', semester: 5, section: 'A', attendance: 95, cgpa: 9.4 },
        ]);
        setLoading(false);
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getAttendanceClass = (attendance) => {
        if (attendance >= 85) return 'badge-success';
        if (attendance >= 75) return 'badge-warning';
        return 'badge-error';
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading students...</p>
            </div>
        );
    }

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>My Students</h1>
                    <p>View and manage students in your classes</p>
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
                        <label className="form-label">Class</label>
                        <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            <option value="">All Classes</option>
                            <option value="CE-5-A">Computer Engineering - Sem 5 - A</option>
                            <option value="CE-5-B">Computer Engineering - Sem 5 - B</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div className="summary-card">
                    <div className="summary-icon total">
                        <FiUser />
                    </div>
                    <div className="summary-content">
                        <h3>{filteredStudents.length}</h3>
                        <p>Total Students</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon present">
                        <FiCalendar />
                    </div>
                    <div className="summary-content">
                        <h3>{(filteredStudents.reduce((acc, s) => acc + s.attendance, 0) / filteredStudents.length).toFixed(1)}%</h3>
                        <p>Avg Attendance</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon percentage">
                        <FiUser />
                    </div>
                    <div className="summary-content">
                        <h3>{(filteredStudents.reduce((acc, s) => acc + s.cgpa, 0) / filteredStudents.length).toFixed(2)}</h3>
                        <p>Avg CGPA</p>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="section-card">
                <div className="section-header">
                    <h2><FiUser style={{ marginRight: 8 }} /> Student List</h2>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Attendance</th>
                                <th>CGPA</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student._id}>
                                    <td><strong>{student.rollNumber}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontWeight: 600 }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            {student.name}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMail size={12} /> {student.email}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}><FiPhone size={12} /> {student.phone}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getAttendanceClass(student.attendance)}`}>
                                            {student.attendance}%
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{student.cgpa}</strong>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setSelectedStudent(student)}
                                        >
                                            <FiEye /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Student Details</h2>
                            <button className="modal-close" onClick={() => setSelectedStudent(null)}>×</button>
                        </div>
                        <div style={{ padding: 'var(--spacing-6)' }}>
                            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontSize: '2rem', fontWeight: 600, margin: '0 auto var(--spacing-3)' }}>
                                    {selectedStudent.name.charAt(0)}
                                </div>
                                <h3>{selectedStudent.name}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>{selectedStudent.rollNumber}</p>
                            </div>
                            <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Email</p>
                                    <p>{selectedStudent.email}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Phone</p>
                                    <p>{selectedStudent.phone}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Department</p>
                                    <p>{selectedStudent.department}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Semester</p>
                                    <p>{selectedStudent.semester} - Section {selectedStudent.section}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Attendance</p>
                                    <span className={`badge ${getAttendanceClass(selectedStudent.attendance)}`}>
                                        {selectedStudent.attendance}%
                                    </span>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CGPA</p>
                                    <p><strong>{selectedStudent.cgpa}</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudents;
