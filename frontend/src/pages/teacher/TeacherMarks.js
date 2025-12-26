import React, { useState, useEffect } from 'react';
import { FiSave, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../student/StudentPages.css';

const TeacherMarks = () => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedExam, setSelectedExam] = useState('Internal 1');
    const [marksData, setMarksData] = useState({});
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        loadDemoData();
    }, []);

    const loadDemoData = () => {
        // Demo students with marks
        const demoStudents = [
            { _id: '1', rollNumber: 'CE2024001', name: 'Rahul Kumar' },
            { _id: '2', rollNumber: 'CE2024002', name: 'Priya Singh' },
            { _id: '3', rollNumber: 'CE2024003', name: 'Amit Jadhav' },
            { _id: '4', rollNumber: 'CE2024004', name: 'Sneha Patil' },
            { _id: '5', rollNumber: 'CE2024005', name: 'Vikram Sharma' },
        ];
        setStudents(demoStudents);

        // Initialize marks
        const initialMarks = {};
        demoStudents.forEach(s => {
            initialMarks[s._id] = { obtained: Math.floor(Math.random() * 30) + 10, max: 40 };
        });
        setMarksData(initialMarks);
        setLoading(false);
    };

    const handleMarksChange = (studentId, value) => {
        const numValue = parseInt(value) || 0;
        setMarksData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], obtained: Math.min(numValue, prev[studentId].max) }
        }));
    };

    const calculateGrade = (obtained, max) => {
        const percentage = (obtained / max) * 100;
        if (percentage >= 90) return { grade: 'A+', color: 'var(--success-color)' };
        if (percentage >= 80) return { grade: 'A', color: 'var(--success-color)' };
        if (percentage >= 70) return { grade: 'B+', color: 'var(--primary-color)' };
        if (percentage >= 60) return { grade: 'B', color: 'var(--primary-color)' };
        if (percentage >= 50) return { grade: 'C', color: 'var(--warning-color)' };
        if (percentage >= 40) return { grade: 'D', color: 'var(--warning-color)' };
        return { grade: 'F', color: 'var(--error-color)' };
    };

    const handleSubmit = async () => {
        try {
            // API call would go here
            toast.success('Marks saved successfully!');
            setEditMode(false);
        } catch (error) {
            toast.error('Failed to save marks');
        }
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
                    <h1>Enter Marks</h1>
                    <p>Enter and manage student marks for your subjects</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                    {editMode ? (
                        <>
                            <button className="btn btn-primary" onClick={handleSubmit}>
                                <FiCheck /> Save Marks
                            </button>
                            <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                                <FiX /> Cancel
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                            <FiEdit2 /> Edit Marks
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="section-card" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ padding: 'var(--spacing-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Class</label>
                        <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            <option value="">Select Class</option>
                            <option value="CE-5-A">Computer Engineering - Sem 5 - A</option>
                            <option value="CE-5-B">Computer Engineering - Sem 5 - B</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Subject</label>
                        <select className="form-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                            <option value="">Select Subject</option>
                            <option value="CS301">CS301 - DBMS</option>
                            <option value="CS302">CS302 - Operating Systems</option>
                            <option value="CS303">CS303 - Computer Networks</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Exam Type</label>
                        <select className="form-select" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                            <option value="Internal 1">Internal 1</option>
                            <option value="Internal 2">Internal 2</option>
                            <option value="Mid Term">Mid Term</option>
                            <option value="End Term">End Term</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Marks Table */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Student Marks - {selectedExam}</h2>
                    <span className="badge badge-info">Max Marks: 40</span>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Marks Obtained</th>
                                <th>Percentage</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => {
                                const marks = marksData[student._id] || { obtained: 0, max: 40 };
                                const percentage = ((marks.obtained / marks.max) * 100).toFixed(1);
                                const gradeInfo = calculateGrade(marks.obtained, marks.max);
                                return (
                                    <tr key={student._id}>
                                        <td><strong>{student.rollNumber}</strong></td>
                                        <td>{student.name}</td>
                                        <td>
                                            {editMode ? (
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: 80 }}
                                                    value={marks.obtained}
                                                    min={0}
                                                    max={marks.max}
                                                    onChange={(e) => handleMarksChange(student._id, e.target.value)}
                                                />
                                            ) : (
                                                <span>{marks.obtained} / {marks.max}</span>
                                            )}
                                        </td>
                                        <td>{percentage}%</td>
                                        <td>
                                            <span className="badge" style={{ background: gradeInfo.color, color: 'white' }}>
                                                {gradeInfo.grade}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Statistics */}
            <div className="summary-grid" style={{ marginTop: 'var(--spacing-6)' }}>
                <div className="summary-card">
                    <div className="summary-icon total">
                        <FiEdit2 />
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
                        <h3>{students.filter(s => marksData[s._id]?.obtained >= 16).length}</h3>
                        <p>Passed</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon absent">
                        <FiX />
                    </div>
                    <div className="summary-content">
                        <h3>{students.filter(s => marksData[s._id]?.obtained < 16).length}</h3>
                        <p>Failed</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherMarks;
