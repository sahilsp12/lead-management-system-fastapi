import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';

const LeadForm = () => {
  const { leadId } = useParams(); 
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEdit = !!leadId;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Web');
  const [status, setStatus] = useState('NEW');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    
    if (user?.role === 'Manager' || user?.role === 'Admin') {
      fetchAgents();
    }

    if (isEdit) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const fetchAgents = async () => {
    try {

      if (user.role === 'Admin') {
        const response = await api.get('/users/');
        
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
        
        const payload = {};
        if (user.role === 'Agent') {
          
          payload.status = status;
          payload.notes = notes;
        } else {
          
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
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportRandom = async () => {
    setError('');
    setImporting(true);

    try {
      const response = await api.get('/leads/import-random');
      const data = response.data;
      
      setName(data.name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setSource(data.source || 'External API');
      setNotes(data.notes || '');
    } catch (err) {
      setError(getErrorMessage(err));
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
        
        {}
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
          {}
          {user.role === 'Agent' && isEdit ? (
            
            <>
              <div className="alert alert-light border py-2 mb-3">
                <strong>Lead Info (Read Only for Agents):</strong>
                <div className="mt-1 small text-secondary">Name: {name}</div>
                <div className="small text-secondary">Email: {email}</div>
                <div className="small text-secondary">Phone: {phone || '-'}</div>
              </div>
            </>
          ) : (
            
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

          {}
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

          {}
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

          {}
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
