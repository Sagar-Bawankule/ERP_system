import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiSearch, FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../student/StudentPages.css';

const SuperAdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [newUser, setNewUser] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'student', phone: '',
    });

    const allRoles = ['super_admin', 'admin', 'teacher', 'student', 'parent', 'accountant', 'librarian', 'receptionist'];

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 15 };
            if (roleFilter) params.role = roleFilter;
            if (search) params.search = search;

            const res = await api.get('/super-admin/users', { params });
            if (res.data.success) {
                setUsers(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    }, [roleFilter, pagination.page, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/super-admin/users', newUser);
            if (res.data.success) {
                toast.success(res.data.message);
                setShowCreateModal(false);
                setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'student', phone: '' });
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await api.put(`/super-admin/users/${id}/status`);
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            const res = await api.delete(`/super-admin/users/${id}`);
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            const res = await api.put(`/super-admin/users/${id}/role`, { role: newRole });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            super_admin: '#e74c3c', admin: '#8e44ad', teacher: '#2980b9',
            student: '#27ae60', parent: '#f39c12', accountant: '#1abc9c',
            librarian: '#e67e22', receptionist: '#3498db',
        };
        return colors[role] || '#95a5a6';
    };

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1><FiUsers style={{ marginRight: 8 }} /> User Management</h1>
                    <p>Manage all system users, roles, and permissions</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <FiPlus /> Create User
                </button>
            </div>

            {/* Filters */}
            <div className="section-card" style={{ marginBottom: 'var(--spacing-4)' }}>
                <div style={{ padding: 'var(--spacing-4)', display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--spacing-2)', flex: 1, minWidth: 200 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: 36 }}
                            />
                        </div>
                        <button type="submit" className="btn btn-secondary">Search</button>
                    </form>
                    <select
                        className="form-input"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{ width: 180 }}
                    >
                        <option value="">All Roles</option>
                        {allRoles.map(r => (
                            <option key={r} value={r}>{r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="section-card">
                <div className="table-container">
                    {loading ? (
                        <div className="page-loading"><div className="spinner"></div></div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td><strong>{u.firstName} {u.lastName}</strong></td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{u.email}</td>
                                        <td>
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                style={{
                                                    background: getRoleBadgeColor(u.role),
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: 12,
                                                    padding: '4px 12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {allRoles.map(r => (
                                                    <option key={r} value={r} style={{ background: '#333', color: '#fff' }}>
                                                        {r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleStatus(u._id)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: u.isActive ? '#27ae60' : '#e74c3c',
                                                    display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
                                                }}
                                            >
                                                {u.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                                                className="btn btn-secondary"
                                                style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No users found</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div style={{ padding: 'var(--spacing-4)', display: 'flex', justifyContent: 'center', gap: 'var(--spacing-2)' }}>
                        {Array.from({ length: pagination.pages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`btn ${pagination.page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '4px 12px', minWidth: 36 }}
                                onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)',
                        padding: 'var(--spacing-6)', width: '100%', maxWidth: 500,
                        boxShadow: 'var(--shadow-xl)',
                    }}>
                        <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Create New User</h2>
                        <form onSubmit={handleCreateUser}>
                            <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                                    <div>
                                        <label className="form-label">First Name</label>
                                        <input className="form-input" required value={newUser.firstName}
                                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="form-label">Last Name</label>
                                        <input className="form-input" required value={newUser.lastName}
                                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" required value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">Password</label>
                                    <input className="form-input" type="password" required minLength={6} value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">Role</label>
                                    <select className="form-input" value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                        {allRoles.map(r => (
                                            <option key={r} value={r}>{r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Phone (optional)</label>
                                    <input className="form-input" value={newUser.phone}
                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end', marginTop: 'var(--spacing-4)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminUsers;
