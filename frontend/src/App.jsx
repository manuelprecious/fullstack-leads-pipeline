import React, { useState, useEffect } from 'react';
import './App.css'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  const errorMessage = "CRITICAL CONFIGURATION ERROR: 'VITE_API_BASE_URL' environment variable is missing.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

function App() {
  // Global View States
  const [systemStatus, setSystemStatus] = useState('Connecting...');
  const [backendMessage, setBackendMessage] = useState('');
  const [leads, setLeads] = useState([]);
  const [leadsError, setLeadsError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Processing States
  const [formData, setFormData] = useState({
    lead_number: '',
    lead_origin: 'API/Web',
    lead_source: 'Organic Search',
    total_visits: '0',
    time_spent_on_website: '0',
    page_views_per_visit: '0.0',
    last_activity: 'Page Visited on Website',
    conversion_score: '50'
  });
  const [formStatus, setFormStatus] = useState({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shared Data Fetch Method
  const refreshLeadsLog = () => {
    fetch(`${API_BASE_URL}/leads`)
      .then(res => {
        if (!res.ok) throw new Error(`Database error status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setLeads(data);
        setIsLoading(false);
      })
      .catch(err => {
        setLeadsError(err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then(res => {
        if (!res.ok) throw new Error(`Network error status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setSystemStatus(data.status);
        setBackendMessage(data.message);
      })
      .catch(err => {
        setSystemStatus('OFFLINE');
        setBackendMessage('Could not connect to the backend API layer.');
      });

    refreshLeadsLog();
  }, []);

  // Form Field Dynamic Bindings
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Pipeline Submission Handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormStatus({ type: null, message: '' });

    if (!formData.lead_number) {
      setFormStatus({ type: 'error', message: 'Lead Number is a mandatory index constraint.' });
      return;
    }

    setIsSubmitting(true);

    // Parse values into strict database schemas
    const payload = {
      lead_number: parseInt(formData.lead_number, 10),
      lead_origin: formData.lead_origin,
      lead_source: formData.lead_source,
      total_visits: parseInt(formData.total_visits, 10) || 0,
      time_spent_on_website: parseInt(formData.time_spent_on_website, 10) || 0,
      page_views_per_visit: parseFloat(formData.page_views_per_visit) || 0.0,
      last_activity: formData.last_activity,
      conversion_score: parseInt(formData.conversion_score, 10) || 0
    };

    fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Server responded with status ${res.status}`);
        }
        return data;
      })
      .then(() => {
        setFormStatus({ type: 'success', message: `Lead #${payload.lead_number} successfully recorded.` });
        // Reset primary key tracking to prevent accidental duplicates
        setFormData(prev => ({ ...prev, lead_number: '' }));
        setIsSubmitting(false);
        refreshLeadsLog(); // Automatically refresh data layer
      })
      .catch(err => {
        setFormStatus({ type: 'error', message: err.message });
        setIsSubmitting(false);
      });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        
        {/* Top Identity Banner */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Leads Intelligence Pipeline Dashboard</h1>
          <div className={`status-badge ${systemStatus === 'UP' ? 'status-up' : 'status-offline'}`}>
            <span className="status-indicator-dot"></span>
            <strong>System: {systemStatus}</strong>
          </div>
        </div>
        
        {/* Network Infrastructure Topology Cards */}
        <div className="metrics-grid">
          <div className="metrics-card">
            <h3>Network Gateway Broadcast</h3>
            <p>{backendMessage}</p>
          </div>
          <div className="metrics-card">
            <h3>API Environment Base</h3>
            <code className="env-code-block">{API_BASE_URL}</code>
          </div>
        </div>

        {/* Dual-Column Layout Workspace */}
        <div className="dashboard-grid">
          
          {/* Left Column: Form Intake Panel */}
          <div className="form-card">
            <h2>Ingest New Data</h2>
            
            {formStatus.message && (
              <div className={`notification-banner notification-${formStatus.type}`}>
                {formStatus.message}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Lead Number (Unique ID)</label>
                <input 
                  type="number" name="lead_number" className="form-input" required
                  placeholder="e.g. 1002" value={formData.lead_number} onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label>Lead Origin</label>
                <input 
                  type="text" name="lead_origin" className="form-input"
                  value={formData.lead_origin} onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label>Acquisition Source</label>
                <input 
                  type="text" name="lead_source" className="form-input"
                  value={formData.lead_source} onChange={handleInputChange} 
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Total Visits</label>
                  <input 
                    type="number" name="total_visits" className="form-input"
                    value={formData.total_visits} onChange={handleInputChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Time Spent (s)</label>
                  <input 
                    type="number" name="time_spent_on_website" className="form-input"
                    value={formData.time_spent_on_website} onChange={handleInputChange} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Page Views Per Visit</label>
                <input 
                  type="number" step="0.01" name="page_views_per_visit" className="form-input"
                  value={formData.page_views_per_visit} onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label>Last Activity Context</label>
                <input 
                  type="text" name="last_activity" className="form-input"
                  value={formData.last_activity} onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label>ML Conversion Score (%)</label>
                <input 
                  type="number" min="0" max="100" name="conversion_score" className="form-input"
                  value={formData.conversion_score} onChange={handleInputChange} 
                />
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Pushing Data...' : 'Submit to Pipeline'}
              </button>
            </form>
          </div>

          {/* Right Column: Main Log Table */}
          <div className="table-wrapper">
            <h2>Inbound Behavioral Leads Data Log</h2>
            
            {isLoading && <p>Querying execution pipeline...</p>}
            {leadsError && <p style={{ color: '#e53e3e' }}><strong>Query Error:</strong> {leadsError}</p>}
            
            {!isLoading && !leadsError && leads.length === 0 && (
              <div className="empty-state-notice">
                <p>The pipeline database is currently empty. Fire a test lead using your input widget!</p>
              </div>
            )}

            {!isLoading && !leadsError && leads.length > 0 && (
              <div className="data-table-container">
                <table className="data-log-table">
                  <thead>
                    <tr>
                      <th>Lead ID</th>
                      <th>Context</th>
                      <th>Source</th>
                      <th style={{ textAlign: 'center' }}>Visits</th>
                      <th style={{ textAlign: 'center' }}>Time</th>
                      <th style={{ textAlign: 'center' }}>Depth</th>
                      <th>Last Active Event</th>
                      <th style={{ textAlign: 'right' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, idx) => (
                      <tr key={lead.id} className={idx % 2 === 0 ? 'data-row-even' : 'data-row-odd'}>
                        <td className="lead-id-cell">#{lead.lead_number}</td>
                        <td>{lead.lead_origin || 'Direct'}</td>
                        <td>
                          <span className="lead-source-tag">{lead.lead_source || 'Unknown'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>{lead.total_visits}</td>
                        <td style={{ textAlign: 'center' }}>{lead.time_spent_on_website}s</td>
                        <td style={{ textAlign: 'center' }}>{lead.page_views_per_visit}</td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>{lead.last_activity}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`score-badge ${lead.conversion_score >= 80 ? 'score-high' : 'score-low'}`}>
                            {lead.conversion_score}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;