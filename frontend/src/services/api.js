import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// API Service functions
export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/password', data),
};

export const studentService = {
    getAll: (params) => api.get('/students', { params }),
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    getByClass: (department, semester, section) =>
        api.get(`/students/class/${department}/${semester}/${section}`),
};

export const teacherService = {
    getAll: (params) => api.get('/teachers', { params }),
    getById: (id) => api.get(`/teachers/${id}`),
    create: (data) => api.post('/teachers', data),
    update: (id, data) => api.put(`/teachers/${id}`, data),
    delete: (id) => api.delete(`/teachers/${id}`),
};

export const attendanceService = {
    mark: (data) => api.post('/attendance/mark', data),
    getClass: (params) => api.get('/attendance/class', { params }),
    getStudent: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
    getSummary: (studentId) => api.get(`/attendance/summary/${studentId}`),
    getAnalytics: (params) => api.get('/attendance/analytics', { params }),
};

export const feeService = {
    getStructures: (params) => api.get('/fees/structures', { params }),
    createStructure: (data) => api.post('/fees/structure', data),
    getStudentFees: (studentId, params) => api.get(`/fees/student/${studentId}`, { params }),
    makePayment: (data) => api.post('/fees/payment', data),
    getPayments: (studentId) => api.get(`/fees/payments/${studentId}`),
    getAnalytics: (params) => api.get('/fees/analytics', { params }),
    getOverdue: () => api.get('/fees/overdue'),
};

export const scholarshipService = {
    getAll: (params) => api.get('/scholarships', { params }),
    getById: (id) => api.get(`/scholarships/${id}`),
    create: (data) => api.post('/scholarships', data),
    apply: (id, data) => api.post(`/scholarships/${id}/apply`, data),
    getMyApplications: () => api.get('/scholarships/student/my-applications'),
    getAllApplications: (params) => api.get('/scholarships/admin/applications', { params }),
    reviewApplication: (id, data) => api.put(`/scholarships/applications/${id}/review`, data),
};

export const marksService = {
    enter: (data) => api.post('/marks', data),
    getStudentMarks: (studentId, params) => api.get(`/marks/student/${studentId}`, { params }),
    getClassMarks: (params) => api.get('/marks/class', { params }),
    getBacklogs: (studentId, params) => api.get(`/marks/backlogs/${studentId}`, { params }),
    getAnalytics: (params) => api.get('/marks/analytics', { params }),
};

export const noteService = {
    getAll: (params) => api.get('/notes', { params }),
    upload: (data) => api.post('/notes', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getById: (id) => api.get(`/notes/${id}`),
    download: (id) => api.get(`/notes/${id}/download`),
    getMyNotes: () => api.get('/notes/my-notes'),
    getBySubject: (subjectId) => api.get(`/notes/subject/${subjectId}`),
};

export const leaveService = {
    apply: (data) => api.post('/leave', data),
    getMyLeaves: (params) => api.get('/leave/my-leaves', { params }),
    getAll: (params) => api.get('/leave', { params }),
    getPending: () => api.get('/leave/pending'),
    review: (id, data) => api.put(`/leave/${id}/review`, data),
    cancel: (id) => api.put(`/leave/${id}/cancel`),
};

export const galleryService = {
    getAll: (params) => api.get('/gallery', { params }),
    getCarousel: () => api.get('/gallery/carousel'),
    upload: (data) => api.post('/gallery', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, data) => api.put(`/gallery/${id}`, data),
    delete: (id) => api.delete(`/gallery/${id}`),
};

export const parentService = {
    getWardDashboard: () => api.get('/parents/ward-dashboard'),
    getWardAttendance: (studentId, params) => api.get(`/parents/ward/${studentId}/attendance`, { params }),
    getWardFees: (studentId) => api.get(`/parents/ward/${studentId}/fees`),
    getWardMarks: (studentId) => api.get(`/parents/ward/${studentId}/marks`),
    getWardLeaves: (studentId) => api.get(`/parents/ward/${studentId}/leaves`),
    getNotifications: () => api.get('/parents/notifications'),
    markNotificationRead: (id) => api.put(`/parents/notifications/${id}/read`),
};

export const adminService = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
    getSubjects: (params) => api.get('/admin/subjects', { params }),
    createSubject: (data) => api.post('/admin/subjects', data),
    updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
    deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
    sendNotification: (data) => api.post('/admin/notifications', data),
    getReports: (params) => api.get('/admin/reports', { params }),
    bulkAssignFees: (data) => api.post('/admin/fees/bulk-assign', data),
};

export const collegeService = {
    getInfo: () => api.get('/college-info'),
};

export default api;
