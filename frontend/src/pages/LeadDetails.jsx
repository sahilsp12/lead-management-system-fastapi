import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const LeadDetails = () => {
  const { leadId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agentName, setAgentName] = useState('Unassigned');

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/leads/${leadId}`);
      const leadData = response.data;
      setLead(leadData);

      // Fetch agent name if assigned_to is present
      if (leadData.assigned_to) {
        try {
          // If we are admin/manager we can list/view users, else we will fetch
          // But wait, the list_users endpoint is admin only.
          // Let's just fallback to "Agent ID: X" or if we have user context
          // Wait, is there a simpler way? The backend could return the agent name or
          // we can query an endpoint. But wait, in our leads.py backend:
          // lead relationship `agent` links to the User model.
          // In LeadOut schema:
          // class LeadOut(LeadBase):
          //     id: int
          //     assigned_to: Optional[int] = None
          //     created_by: Optional[int] = None
          //     created_at: datetime
          //     updated_at: datetime
          //     activities: list[ActivityLogOut] = []
          // It does not include agent details directly.
          // So let's write a simple resolver, or since we know the agent ID,
          // we can just display "Agent ID: X". Or wait! In the activity logs description,
          // the backend writes the agent's name like "auto-assigned to Test Agent".
          // Let's just show "Agent ID: X" in details, which is clean and database-native.
          setAgentName(`Agent ID: ${leadData.assigned_to}`);
        } catch (uErr) {
          setAgentName(`Agent ID: ${leadData.assigned_to}`);
        }
      } else {
        setAgentName('Unassigned');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch lead details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${leadId}`);
        navigate('/leads');
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete lead.');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Lead...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!lead) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/leads" className="btn btn-sm btn-outline-secondary mb-2">
            <i className="bi bi-arrow-left"></i> Back to List
          </Link>
          <h1 className="fw-bold mb-0">{lead.name}</h1>
        </div>
        <div className="btn-group" role="group">
          <Link to={`/leads/${lead.id}/edit`} className="btn btn-primary">
            <i className="bi bi-pencil-square me-1"></i> 
            {user?.role === 'Agent' ? 'Update Status' : 'Edit Lead'}
          </Link>
          {(user?.role === 'Manager' || user?.role === 'Admin') && (
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              <i className="bi bi-trash me-1"></i> Delete
            </button>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Side: Details Card */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100 p-3">
            <div className="card-body">
              <h5 className="card-title fw-bold border-bottom pb-2 mb-3">Lead Information</h5>
              
              <div className="row mb-3">
                <div className="col-4 text-muted fw-semibold">Email:</div>
                <div className="col-8">{lead.email}</div>
              </div>

              <div className="row mb-3">
                <div className="col-4 text-muted fw-semibold">Phone:</div>
                <div className="col-8">{lead.phone || '-'}</div>
              </div>

              <div className="row mb-3">
                <div className="col-4 text-muted fw-semibold">Source:</div>
                <div className="col-8">
                  <span className="badge bg-secondary">{lead.source || 'Direct'}</span>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-4 text-muted fw-semibold">Status:</div>
                <div className="col-8">
                  <span className={`badge ${
                    lead.status === 'NEW' ? 'bg-info' :
                    lead.status === 'WON' ? 'bg-success' :
                    lead.status === 'LOST' ? 'bg-danger' :
                    'bg-warning text-dark'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-4 text-muted fw-semibold">Assigned Agent:</div>
                <div className="col-8 fw-semibold">{agentName}</div>
              </div>

              <div className="row mb-3">
                <div className="col-4 text-muted fw-semibold">Created On:</div>
                <div className="col-8">{new Date(lead.created_at).toLocaleString()}</div>
              </div>

              <div className="row">
                <div className="col-12 text-muted fw-semibold mb-2">Notes:</div>
                <div className="col-12">
                  <div className="bg-light p-3 rounded border text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                    {lead.notes || 'No notes added yet.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Activity Timeline */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0 h-100 p-3">
            <div className="card-body">
              <h5 className="card-title fw-bold border-bottom pb-2 mb-3">Activity History</h5>
              <div className="timeline mt-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {lead.activities && lead.activities.length > 0 ? (
                  lead.activities.map((activity, idx) => (
                    <div className="d-flex mb-3 align-items-start" key={activity.id}>
                      <div className="me-3 text-primary">
                        <i className={`bi ${
                          activity.action === 'Lead Created' ? 'bi-plus-circle-fill' :
                          activity.action === 'Status Changed' ? 'bi-arrow-left-right' :
                          activity.action === 'Lead Assigned' ? 'bi-person-plus-fill' :
                          'bi-pencil-fill'
                        } fs-5`}></i>
                      </div>
                      <div className="border-bottom pb-2 w-100">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-dark">{activity.action}</span>
                          <span className="text-muted small">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-muted small mb-0 mt-1">{activity.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-4">No activities logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
