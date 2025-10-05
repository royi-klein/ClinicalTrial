import { useState, useEffect } from 'react';
import { dashboard } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboard.getStats();
      setStats(data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="loading" style={{ fontSize: '18px', color: '#6b7280' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '18px', color: '#ef4444' }}>
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  const totalIssues = stats.total || 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          Dashboard Overview
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>
          Real-time statistics and metrics for clinical trial issues
        </p>
      </div>

      {/* Summary Card */}
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
          Total Issues
        </div>
        <div style={{ fontSize: '56px', fontWeight: '800', lineHeight: 1 }}>
          {totalIssues}
        </div>
      </div>

      {/* Status Statistics */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span> By Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <StatCard 
            title="Open" 
            count={stats.byStatus.open} 
            total={totalIssues}
            color="#ef4444" 
            icon="🔴" 
            description="Active issues requiring attention"
          />
          <StatCard 
            title="In Progress" 
            count={stats.byStatus.in_progress} 
            total={totalIssues}
            color="#f59e0b" 
            icon="⏳" 
            description="Issues currently being addressed"
          />
          <StatCard 
            title="Resolved" 
            count={stats.byStatus.resolved} 
            total={totalIssues}
            color="#10b981" 
            icon="✅" 
            description="Completed and closed issues"
          />
        </div>
      </div>

      {/* Severity Statistics */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span> By Severity
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <StatCard 
            title="Minor" 
            count={stats.bySeverity.minor} 
            total={totalIssues}
            color="#6b7280" 
            icon="ℹ️" 
            description="Low priority issues"
          />
          <StatCard 
            title="Major" 
            count={stats.bySeverity.major} 
            total={totalIssues}
            color="#f59e0b" 
            icon="⚠️" 
            description="Medium priority issues"
          />
          <StatCard 
            title="Critical" 
            count={stats.bySeverity.critical} 
            total={totalIssues}
            color="#ef4444" 
            icon="🚨" 
            description="High priority urgent issues"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, count, total, color, icon, description }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div className="stat-card" style={{ 
      backgroundColor: 'white', 
      padding: '28px', 
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `5px solid ${color}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '40px', opacity: 0.1 }}>
        {icon}
      </div>
      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '48px', fontWeight: '800', color, lineHeight: 1 }}>
          {count}
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#9ca3af' }}>
          ({percentage}%)
        </div>
      </div>
      <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
        {description}
      </div>
      {/* Progress bar */}
      <div style={{ marginTop: '16px', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${percentage}%`, 
          backgroundColor: color,
          transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  );
}

export default Dashboard;