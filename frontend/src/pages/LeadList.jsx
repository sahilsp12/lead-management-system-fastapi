import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';

const LeadList = () => {
  const { user } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, sourceFilter, sortBy, sortDir]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sort_by: sortBy,
        sort_dir: sortDir,
      };

      if (search) params.search = search;
      if (statusFilter) params.status_filter = statusFilter;
      if (sourceFilter) params.source_filter = sourceFilter;

      const response = await api.get('/leads/', { params });
      setLeads(response.data.leads);
      setTotalPages(response.data.pages);
      setTotalLeads(response.data.total);
    } catch (err) {
      setError('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSourceFilter('');
    setSortBy('created_at');
    setSortDir('desc');
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (err) {
        alert(getErrorMessage(err));
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Leads Directory</h1>
          <p className="text-muted">Total leads found: {totalLeads}</p>
        </div>
        {(user?.role === 'Manager' || user?.role === 'Admin') && (
          <Link to="/leads/new" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1"></i> Create Lead
          </Link>
        )}
      </div>

      {}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <form onSubmit={handleSearchSubmit} className="row g-3">
          {}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">
                Search
              </button>
            </div>
          </div>

          {}
          <div className="col-6 col-sm-4 col-md-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="LOST">Lost</option>
              <option value="WON">Won</option>
            </select>
          </div>

          {}
          <div className="col-6 col-sm-4 col-md-2">
            <select
              className="form-select"
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Sources</option>
              <option value="Web">Web</option>
              <option value="Referral">Referral</option>
              <option value="Cold Call">Cold Call</option>
              <option value="External API">External API</option>
            </select>
          </div>

          {}
          <div className="col-6 col-sm-4 col-md-2">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="created_at">Sort By: Date</option>
              <option value="name">Sort By: Name</option>
            </select>
          </div>

          {}
          <div className="col-6 col-sm-4 col-md-1">
            <select
              className="form-select"
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value);
                setPage(1);
              }}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>

          {}
          <div className="col-12 col-sm-4 col-md-1 d-grid">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleResetFilters}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading Leads...</span>
                      </div>
                    </td>
                  </tr>
                ) : leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-4 fw-semibold">{lead.name}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone || '-'}</td>
                      <td>{lead.source || '-'}</td>
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
                      <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td className="pe-4 text-end">
                        <div className="btn-group" role="group">
                          <Link to={`/leads/${lead.id}`} className="btn btn-sm btn-outline-secondary">
                            View
                          </Link>
                          {(user?.role === 'Manager' || user?.role === 'Admin') && (
                            <>
                              <Link to={`/leads/${lead.id}/edit`} className="btn btn-sm btn-outline-primary">
                                Edit
                              </Link>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(lead.id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {user?.role === 'Agent' && (
                            <Link to={`/leads/${lead.id}/edit`} className="btn btn-sm btn-outline-primary">
                              Update Status
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No leads found matching current filter options.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center">
          <ul className="pagination shadow-sm">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
            </li>
            {[...Array(totalPages).keys()].map((num) => (
              <li
                key={num + 1}
                className={`page-item ${page === num + 1 ? 'active' : ''}`}
              >
                <button className="page-link" onClick={() => setPage(num + 1)}>
                  {num + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default LeadList;
