import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Stats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const { total_leads, status_stats, source_stats, recent_leads } = stats;

  return (
    <div>
      <div className="mb-4">
        <h1 className="fw-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted">Here is the latest status of your leads.</p>
      </div>

      {/* Overview Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 bg-primary text-white h-100">
            <div className="card-body d-flex flex-column justify-content-center p-4">
              <span className="text-white-50 text-uppercase fw-semibold small">Total Leads</span>
              <h2 className="display-4 fw-bold my-2">{total_leads}</h2>
              <span className="small">Active leads in the system</span>
            </div>
          </div>
        </div>

        {/* Status Count Mini Summary */}
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">
              <span className="text-muted text-uppercase fw-semibold small">Status Summary</span>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>New</span>
                  <span className="badge bg-info">{status_stats.NEW || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Contacted</span>
                  <span className="badge bg-warning text-dark">{status_stats.CONTACTED || 0}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Won</span>
                  <span className="badge bg-success">{status_stats.WON || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Source Count Mini Summary */}
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">
              <span className="text-muted text-uppercase fw-semibold small">Top Sources</span>
              <div className="mt-3">
                {Object.entries(source_stats).length > 0 ? (
                  Object.entries(source_stats).slice(0, 3).map(([source, count]) => (
                    <div className="d-flex justify-content-between mb-2" key={source}>
                      <span>{source}</span>
                      <span className="badge bg-secondary">{count}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-muted small">No source information available</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Leads Table */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Recently Added Leads</h5>
              <Link to="/leads" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4">Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th className="pe-4 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_leads.length > 0 ? (
                      recent_leads.map((lead) => (
                        <tr key={lead.id}>
                          <td className="px-4 fw-semibold">{lead.name}</td>
                          <td>{lead.email}</td>
                          <td>
                            <span className={`badge ${
                              lead.status === 'NEW' ? 'bg-info' :
                              lead.status === 'WON' ? 'bg-success' :
                              lead.status === 'LOST' ? 'bg-danger' :
                              'bg-warning text-dark'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="pe-4 text-end">
                            <Link to={`/leads/${lead.id}`} className="btn btn-sm btn-light">View</Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">No leads found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Shortcuts / Actions */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {(user?.role === 'Manager' || user?.role === 'Admin') && (
                  <>
                    <Link to="/leads/new" className="btn btn-primary py-2 text-start">
                      <i className="bi bi-plus-circle-fill me-2"></i> Create Lead Manually
                    </Link>
                  </>
                )}
                <Link to="/leads" className="btn btn-outline-secondary py-2 text-start">
                  <i className="bi bi-list-task me-2"></i> Browse All Leads
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
