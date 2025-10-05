import { useState, useEffect } from 'react';
import { issues, importCSV } from '../services/api';

function Issues() {
  const [issuesList, setIssuesList] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', severity: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    site: '',
    severity: 'minor',
    status: 'open'
  });

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await issues.getAll(filters);
      setIssuesList(data.data || []);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIssue = async (e) => {
    e.preventDefault();
    try {
      if (editingIssue) {
        await issues.update(editingIssue.id, issueForm);
      } else {
        await issues.create(issueForm);
      }
      setShowCreateForm(false);
      setEditingIssue(null);
      setIssueForm({ title: '', description: '', site: '', severity: 'minor', status: 'open' });
      loadIssues();
    } catch (error) {
      alert('Error saving issue: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    try {
      await issues.delete(id);
      loadIssues();
    } catch (error) {
      alert('Error deleting issue: ' + error.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      await issues.resolve(id);
      loadIssues();
    } catch (error) {
      alert('Error resolving issue: ' + error.message);
    }
  };

  const handleEdit = (issue) => {
    setEditingIssue(issue);
    setIssueForm({
      title: issue.title,
      description: issue.description,
      site: issue.site || '',
      severity: issue.severity,
      status: issue.status
    });
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    issues.getAll(newFilters).then(data => setIssuesList(data.data || []));
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setLoading(true);
      const result = await importCSV(file);
      alert(`Successfully imported ${result.imported} issues`);
      loadIssues();
    } catch (error) {
      alert('Error importing CSV: ' + error.message);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          Issues Management
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>
          Create, manage, and track clinical trial issues
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => { 
          setShowCreateForm(true); 
          setEditingIssue(null); 
          setIssueForm({ title: '', description: '', site: '', severity: 'minor', status: 'open' }); 
        }} style={buttonStyle('#667eea')}>
          ➕ Create Issue
        </button>
        <label style={{ ...buttonStyle('#10b981'), cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          📁 Import CSV
          <input type="file" accept=".csv" onChange={handleCSVImport} style={{ display: 'none' }} />
        </label>
        <button onClick={loadIssues} style={buttonStyle('#6b7280')} disabled={loading}>
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {showCreateForm && (
        <div className="form-section slide-in" style={{ 
          backgroundColor: 'white', 
          padding: '28px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '2px solid #667eea'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
            {editingIssue ? '✏️ Edit Issue' : '➕ Create New Issue'}
          </h3>
          <form onSubmit={handleSaveIssue}>
            <div style={{ display: 'grid', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={issueForm.title}
                  onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                  style={inputStyle}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                  Description <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Detailed description of the issue..."
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Site</label>
                  <input
                    type="text"
                    value={issueForm.site}
                    onChange={(e) => setIssueForm({ ...issueForm, site: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g., Site-101"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Severity</label>
                  <select
                    value={issueForm.severity}
                    onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="minor">Minor</option>
                    <option value="major">Major</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Status</label>
                  <select
                    value={issueForm.status}
                    onChange={(e) => setIssueForm({ ...issueForm, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" style={buttonStyle('#667eea')}>
                  {editingIssue ? '💾 Update Issue' : '✅ Create Issue'}
                </button>
                <button type="button" onClick={() => { setShowCreateForm(false); setEditingIssue(null); }} style={buttonStyle('#6b7280')}>
                  ✖️ Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>🔍 Filter Issues</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>Search Title</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title..."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>Status</label>
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} style={inputStyle}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>Severity</label>
            <select value={filters.severity} onChange={(e) => handleFilterChange('severity', e.target.value)} style={inputStyle}>
              <option value="">All Severities</option>
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', borderBottom: '2px solid #f3f4f6', backgroundColor: '#fafbfc' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
            📋 Issues List ({issuesList.length})
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <tr>
                <th style={tableHeaderStyle}>Title</th>
                <th style={tableHeaderStyle}>Site</th>
                <th style={tableHeaderStyle}>Severity</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Created</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issuesList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>No issues found</div>
                    <div style={{ fontSize: '14px', color: '#9ca3af' }}>Create your first issue or adjust filters</div>
                  </td>
                </tr>
              ) : (
                issuesList.map(issue => (
                  <tr key={issue.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{issue.title}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
                        {issue.description.substring(0, 80)}{issue.description.length > 80 ? '...' : ''}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        {issue.site || '-'}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={getBadgeStyle(issue.severity)}>
                        {issue.severity}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={getBadgeStyle(issue.status)}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{...tableCellStyle, color: '#6b7280', fontSize: '13px'}}>
                      {new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleEdit(issue)} style={actionButtonStyle('#667eea')}>
                          ✏️ Edit
                        </button>
                        {issue.status !== 'resolved' && (
                          <button onClick={() => handleResolve(issue.id)} style={actionButtonStyle('#10b981')}>
                            ✅ Resolve
                          </button>
                        )}
                        <button onClick={() => handleDelete(issue.id)} style={actionButtonStyle('#ef4444')}>
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = (color) => ({
  padding: '12px 28px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
  transition: 'all 0.2s'
});

const inputStyle = {
  width: '100%',
  padding: '11px 16px',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  transition: 'all 0.2s',
  backgroundColor: '#ffffff'
};

const tableHeaderStyle = {
  padding: '16px',
  textAlign: 'left',
  fontWeight: '700',
  fontSize: '13px',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tableCellStyle = {
  padding: '16px',
  fontSize: '14px',
  verticalAlign: 'top'
};

const actionButtonStyle = (color) => ({
  padding: '8px 16px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600',
  transition: 'all 0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
});

function getBadgeStyle(value) {
  const colors = {
    minor: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
    major: { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' },
    critical: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
    open: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
    in_progress: { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' },
    resolved: { bg: '#d1fae5', text: '#065f46', border: '#10b981' }
  };
  
  const color = colors[value] || { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
  
  return {
    padding: '6px 12px',
    backgroundColor: color.bg,
    color: color.text,
    border: `2px solid ${color.border}`,
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };
}

export default Issues;