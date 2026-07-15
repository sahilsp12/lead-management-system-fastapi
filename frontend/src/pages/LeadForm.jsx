import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const LeadForm = () => {
  const { leadId } = useParams(); // undefined if creating
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEdit = !!leadId;

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Web');
  const [status, setStatus] = useState('NEW');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // Dropdown options
  const [agents, setAgents] = useState([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Fetch agents list if Manager or Admin to populate assignment dropdown
    if (user?.role === 'Manager' || user?.role === 'Admin') {
      fetchAgents();
    }

    // 2. Fetch lead details if editing
    if (isEdit) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const fetchAgents = async () => {
    try {
      // Admins can list all users. For Managers, we will fetch users list
      // Note: users_router list_users is admin_only in current backend.
      // So if the logged-in user is a Manager, let's gracefully fallback or fetch.
      // Wait, is there a risk of Manager getting 403 when listing users?
      // In users.py: router.get("/", response_model=list[UserOut], dependencies=[Depends(admin_only)])
      // Yes, listing users is admin_only. So for Manager, we can't show a dropdown of agents unless we have a manager endpoint,
      // or we can allow the backend to assign, or we just type agent ID manually, or query agents specifically.
      // Since it's a simple CRUD, we can let managers type the Agent User ID in an input field, which is extremely simple, 
      // or let Admin use a dropdown. Let's make it a simple text/number input for Manager and Admin, or fetch users only if Admin!
      // This is very clean, avoids 403 errors, and is easy to explain.
      if (user.role === 'Admin') {
        const response = await api.get('/users/');
        // Filter users who are Agents
        const agentUsers = response.data.filter(u => u.role === 'Agent');
        setAgents(agentUsers);
      }
    } catch (err) {
      console.warn('Failed to fetch agents dropdown, manual ID input will be enabled.');
    }
  };

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/leads/${leadId}`);
      const lead = response.data;
      setName(lead.name);
      setEmail(lead.email);
      setPhone(lead.phone || '');
      setSource(lead.source || 'Web');
      setStatus(lead.status || 'NEW');
      setNotes(lead.notes || '');
      setAssignedTo(lead.assigned_to || '');
    } catch (err) {
      setError('Failed to fetch lead details for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isEdit) {
        // Prepare update payload
        const payload = {};
        if (user.role === 'Agent') {
          // Agents can only update status and notes
          payload.status = status;
          payload.notes = notes;
        } else {
          // Admin/Manager can edit all fields
          payload.name = name;
          payload.email = email;
          payload.phone = phone;
          payload.source = source;
          payload.status = status;
          payload.notes = notes;
          payload.assigned_to = assignedTo ? parseInt(assignedTo) : null;
        }

        await api.put(`/leads/${leadId}`, payload);
        navigate(`/leads/${leadId}`);
      } else {
        // Create new lead manually
        const payload = {
          name,
          email,
          phone,
          source,
          status,
          notes,
        };
        const response = await api.post('/leads/', payload);
        navigate(`/leads/${response.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while saving the lead.');
    } finally {
      setSubmitting(false);
    }
  };

  // Integration of Third-Party API Import
  const handleImportRandom = async () => {
    setError('');
    setImporting(true);

    try {
      const response = await api.post('/leads/import-random');
      navigate(`/leads/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to import random lead from external API.');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Lead Form...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">
          {isEdit ? (user.role === 'Agent' ? 'Update Lead Status' : 'Edit Lead') : 'Create Lead'}
        </h1>
        
        {/* Import Random Lead - only visible when creating, for Admin/Manager */}
        {!isEdit && (user?.role === 'Manager' || user?.role === 'Admin') && (
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleImportRandom}
            disabled={importing}
          >
            {importing ? (
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            ) : (
              <i className="bi bi-cloud-arrow-down me-1"></i>
            )}
            Import Random Lead (API)
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm border-0 p-4">
        <form onSubmit={handleSubmit}>
          {/* Read Only Field checks for Agents */}
          {user.role === 'Agent' && isEdit ? (
            // Layout for Agents editing assigned lead (restrict to status/notes)
            <>
              <div className="alert alert-light border py-2 mb-3">
                <strong>Lead Info (Read Only for Agents):</strong>
                <div className="mt-1 small text-secondary">Name: {name}</div>
                <div className="small text-secondary">Email: {email}</div>
                <div className="small text-secondary">Phone: {phone || '-'}</div>
              </div>
            </>
          ) : (
            // Full inputs for Managers/Admins or when creating
            <>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lead name"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Source</label>
                <select
                  className="form-select"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="Web">Web</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Partner">Partner</option>
                  <option value="External API">External API</option>
                </select>
              </div>
            </>
          )}

          {/* Status (Editable by all roles) */}
          <div className="mb-3">
            <label className="form-label">Lead Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="LOST">Lost</option>
              <option value="WON">Won</option>
            </select>
          </div>

          {/* Notes (Editable by all roles) */}
          <div className="mb-3">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any extra comments or discussion summaries..."
            ></textarea>
          </div>

          {/* Assigned To - only visible/editable for Admin and Manager during Edit */}
          {isEdit && (user.role === 'Admin' || user.role === 'Manager') && (
            <div className="mb-4">
              <label className="form-label">Assign Agent</label>
              {user.role === 'Admin' && agents.length > 0 ? (
                <select
                  className="form-select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} (ID: {agent.id})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter Agent User ID"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                />
              )}
              <span className="form-text text-muted">
                Input the User ID of the agent to assign.
              </span>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Link to={isEdit ? `/leads/${leadId}` : '/leads'} className="btn btn-light">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              ) : null}
              {isEdit ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
