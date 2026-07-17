import { useState, useEffect } from 'react';
import api from '../services/api';
import { getErrorMessage } from '../utils/errors';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Agent');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/users/', { name, email, password, role });
      setSuccess('User created successfully.');
      setName('');
      setEmail('');
      setPassword('');
      setRole('Agent');
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        setSuccess('User deleted successfully.');
        fetchUsers();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="fw-bold">User Management</h1>
        <p className="text-muted">Admin console to manage platform users and credentials.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row g-4">
        {}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 p-3">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Add New User</h5>
              <form onSubmit={handleCreateUser}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="At least 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Agent">Agent</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  ) : null}
                  Add User
                </button>
              </form>
            </div>
          </div>
        </div>

        {}
        <div className="col-12 col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Platform Users</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4">ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th className="pe-4 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading Users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length > 0 ? (
                      users.map((u) => (
                        <tr key={u.id}>
                          <td className="px-4 text-muted fw-bold">{u.id}</td>
                          <td className="fw-semibold">{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge ${
                              u.role === 'Admin' ? 'bg-danger' :
                              u.role === 'Manager' ? 'bg-primary' :
                              'bg-secondary'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="pe-4 text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">No users registered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
