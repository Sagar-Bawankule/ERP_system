import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiSave, FiCalendar, FiUsers, FiBook } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../student/StudentPages.css';

const TeacherAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loadingAssignments, setLoadingAssignments] = useState(true);

    // Fetch teacher's teaching assignments on mount
    useEffect(() => {
        fetchMyAssignments();
    }, []);

    // Fetch students when assignment is selected
    useEffect(() => {
        if (selectedAssignment) {
            fetchStudentsForAssignment(selectedAssignment._id);
        } else {
            setStudents([]);
            setAttendanceData({});
        }
    }, [selectedAssignment]);

    const fetchMyAssignments = async () => {
        setLoadingAssignments(true);
        try {
            const res = await api.get('/teaching-assignments/my-assignments');
            setAssignments(res.data.data || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            toast.error('Failed to load your teaching assignments');
        }
        setLoadingAssignments(false);
    };

    const fetchStudentsForAssignment = async (assignmentId) => {
        setLoading(true);
        try {
            const res = await api.get(`/teaching-assignments/${assignmentId}/students`);
            const studentList = res.data.data || [];
            setStudents(studentList);

            // Initialize all as present by default
            const initialAttendance = {};
            studentList.forEach(student => {
                initialAttendance[student._id] = 'Present';
            });
            setAttendanceData(initialAttendance);

            // Check if attendance already marked for this date
            if (studentList.length > 0 && res.data.assignment) {
                await checkExistingAttendance(res.data.assignment);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students');
            setStudents([]);
        }
        setLoading(false);
    };

    const checkExistingAttendance = async (assignmentInfo) => {
        try {
            const classInfo = assignmentInfo.class;
            if (!classInfo) return;

            const res = await api.get('/attendance/class', {
                params: {
                    department: classInfo.department,
                    semester: classInfo.semester,
                    section: classInfo.section,
                    subjectId: assignmentInfo.subject?._id,
                    date: selectedDate
                }
            });

            if (res.data.data && res.data.data.length > 0) {
                // Load existing attendance
                const existing = {};
                res.data.data.forEach(record => {
                    const studentId = record.student?._id || record.student;
                    existing[studentId] = record.status;
                });
                setAttendanceData(prev => ({ ...prev, ...existing }));
                toast.info('Existing attendance loaded for this date');
            }
        } catch (error) {
            console.error('Error checking existing attendance:', error);
        }
    };

    const toggleAttendance = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
        }));
    };

    const markAllPresent = () => {
        const newData = {};
        students.forEach(s => { newData[s._id] = 'Present'; });
        setAttendanceData(newData);
        toast.success('All students marked present');
    };

    const markAllAbsent = () => {
        const newData = {};
        students.forEach(s => { newData[s._id] = 'Absent'; });
        setAttendanceData(newData);
        toast.info('All students marked absent');
    };

    const handleSubmit = async () => {
        if (!selectedAssignment) {
            toast.error('Please select a teaching assignment');
            return;
        }

        if (students.length === 0) {
            toast.error('No students to mark attendance');
            return;
        }

        setSubmitting(true);
        try {
            const attendanceList = students.map(student => ({
                studentId: student._id,
                status: attendanceData[student._id] || 'Present',
                remarks: ''
            }));

            await api.post('/attendance/mark', {
                assignmentId: selectedAssignment._id,
                date: selectedDate,
                attendanceData: attendanceList,
                lectureNumber: 1
            });

            toast.success('Attendance submitted successfully!');
        } catch (error) {
            console.error('Error submitting attendance:', error);
            toast.error(error.response?.data?.message || 'Failed to submit attendance');
        }
        setSubmitting(false);
    };

    const presentCount = Object.values(attendanceData).filter(s => s === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(s => s === 'Absent').length;

    // Handle assignment selection
    const handleAssignmentSelect = (assignmentId) => {
        const assignment = assignments.find(a => a._id === assignmentId);
        setSelectedAssignment(assignment || null);
    };

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Mark Attendance</h1>
                    <p>Mark daily attendance for your assigned classes</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting || students.length === 0}
                >
                    <FiSave /> {submitting ? 'Saving...' : 'Submit Attendance'}
                </button>
            </div>

            {/* Teaching Assignment Selection */}
            <div className="section-card" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ padding: 'var(--spacing-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
                    <div className="form-group">
                        <label className="form-label">
                            <FiBook style={{ marginRight: '8px' }} />
                            Teaching Assignment *
                        </label>
                        {loadingAssignments ? (
                            <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                Loading assignments...
                            </div>
                        ) : (
                            <select
                                className="form-select"
                                value={selectedAssignment?._id || ''}
                                onChange={(e) => handleAssignmentSelect(e.target.value)}
                            >
                                <option value="">Select Teaching Assignment</option>
                                {assignments.map(assignment => (
                                    <option key={assignment._id} value={assignment._id}>
                                        {assignment.subjectId?.code || 'N/A'} - {assignment.subjectId?.name || 'N/A'}
                                        ({assignment.classId?.department || 'N/A'} - Sem {assignment.classId?.semester || assignment.semester}, Sec {assignment.classId?.section || 'N/A'})
                                    </option>
                                ))}
                            </select>
                        )}
                        {assignments.length === 0 && !loadingAssignments && (
                            <small style={{ color: 'var(--warning-color)', marginTop: '4px', display: 'block' }}>
                                No teaching assignments found. Please contact admin.
                            </small>
                        )}
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <FiCalendar style={{ marginRight: '8px' }} />
                            Date
                        </label>
                        <input
                            type="date"
                            className="form-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Auto-resolved class info */}
                {selectedAssignment && (
                    <div style={{
                        padding: 'var(--spacing-4) var(--spacing-6)',
                        background: 'var(--primary-color-light)',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        gap: 'var(--spacing-6)',
                        flexWrap: 'wrap'
                    }}>
                        <div>
                            <small style={{ color: 'var(--text-secondary)' }}>Department</small>
                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedAssignment.classId?.department || 'N/A'}</p>
                        </div>
                        <div>
                            <small style={{ color: 'var(--text-secondary)' }}>Semester</small>
                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedAssignment.classId?.semester || selectedAssignment.semester}</p>
                        </div>
                        <div>
                            <small style={{ color: 'var(--text-secondary)' }}>Section</small>
                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedAssignment.classId?.section || 'N/A'}</p>
                        </div>
                        <div>
                            <small style={{ color: 'var(--text-secondary)' }}>Subject</small>
                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedAssignment.subjectId?.name || 'N/A'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="summary-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div className="summary-card">
                    <div className="summary-icon total">
                        <FiUsers />
                    </div>
                    <div className="summary-content">
                        <h3>{students.length}</h3>
                        <p>Total Students</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon present">
                        <FiCheck />
                    </div>
                    <div className="summary-content">
                        <h3>{presentCount}</h3>
                        <p>Present</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon absent">
                        <FiX />
                    </div>
                    <div className="summary-content">
                        <h3>{absentCount}</h3>
                        <p>Absent</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            {students.length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-4)', display: 'flex', gap: 'var(--spacing-3)' }}>
                    <button className="btn btn-secondary btn-sm" onClick={markAllPresent}>
                        <FiCheck /> Mark All Present
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={markAllAbsent}>
                        <FiX /> Mark All Absent
                    </button>
                </div>
            )}

            {/* Attendance List */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Student List</h2>
                </div>
                <div className="table-container">
                    {loading ? (
                        <div className="page-loading" style={{ padding: 'var(--spacing-8)' }}>
                            <div className="spinner"></div>
                            <p>Loading students...</p>
                        </div>
                    ) : students.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id}>
                                        <td><strong>{student.rollNumber}</strong></td>
                                        <td>{student.user?.firstName} {student.user?.lastName}</td>
                                        <td>
                                            <span className={`badge ${attendanceData[student._id] === 'Present' ? 'badge-success' : 'badge-error'}`}>
                                                {attendanceData[student._id]}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`btn btn-sm ${attendanceData[student._id] === 'Present' ? 'btn-secondary' : 'btn-primary'}`}
                                                onClick={() => toggleAttendance(student._id)}
                                            >
                                                {attendanceData[student._id] === 'Present' ? (
                                                    <><FiX /> Mark Absent</>
                                                ) : (
                                                    <><FiCheck /> Mark Present</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--spacing-12)' }}>
                            <FiCalendar size={48} />
                            <h3>No Students Found</h3>
                            <p>{selectedAssignment
                                ? 'No students enrolled in this class.'
                                : 'Please select a teaching assignment to load students.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendance;
