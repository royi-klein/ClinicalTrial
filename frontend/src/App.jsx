import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { auth } from './services/api';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());
  const [username, setUsername] = useState(auth.getUsername());
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const data = await auth.login(loginForm.username, loginForm.password);
      setIsAuthenticated(true);
      setUsername(data.username);
    } catch (error) {
      setLoginError(error.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    setIsAuthenticated(false);
    setUsername('');
  };

  if (!isAuthenticated) {
    return <LoginPage loginForm={loginForm} setLoginForm={setLoginForm} handleLogin={handleLogin} loginError={loginError} />;
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <Header username={username} handleLogout={handleLogout} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/issues" element={<Issues />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

function LoginPage({ loginForm, setLoginForm, handleLogin, loginError }) {
  return (
    <div className="fade-in" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '50px 40px', 
        borderRadius: '16px', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '420px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏥</div>
          <h1 style={{ margin: 0, color: '#1f2937', fontSize: '28px', fontWeight: '700' }}>
            Trial Issue Tracker
          </h1>
          <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '14px' }}>
            Clinical Trial Management System
          </p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
              Username
            </label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '15px',
                transition: 'all 0.2s'
              }}
              placeholder="Enter username"
              required
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
              Password
            </label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '15px',
                transition: 'all 0.2s'
              }}
              placeholder="Enter password"
              required
            />
          </div>
          {loginError && (
            <div className="alert alert-error">
              <strong>Error:</strong> {loginError}
            </div>
          )}
          <button
            type="submit"
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            Sign In
          </button>
        </form>
        <div style={{ 
          marginTop: '24px', 
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
            Demo credentials
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

function Header({ username, handleLogout }) {
  const location = useLocation();
  
  const navLinkStyle = (isActive) => ({
    padding: '10px 20px',
    color: 'white',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    borderRadius: '8px',
    transition: 'all 0.2s',
    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'transparent',
    border: isActive ? '2px solid white' : '2px solid transparent'
  });

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white', 
      padding: '20px 24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>🏥</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Trial Issue Tracker</h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Clinical Trial Management</p>
          </div>
        </div>
        
        <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/dashboard" style={navLinkStyle(location.pathname === '/dashboard')}>
            📊 Dashboard
          </Link>
          <Link to="/issues" style={navLinkStyle(location.pathname === '/issues')}>
            📋 Issues
          </Link>
        </nav>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px' }}>Welcome, <strong>{username}</strong></span>
          <button onClick={handleLogout} style={{ 
            padding: '10px 24px', 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            color: 'white', 
            border: '2px solid white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            backdropFilter: 'blur(10px)'
          }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;