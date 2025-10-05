// API service for backend communication
const API_URL = 'http://localhost:3000/api';

// Get token from localStorage (stored after login)
const getToken = () => localStorage.getItem('token');

// Generic API call helper
async function apiCall(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'API request failed');
  }

  return data;
}

// Auth APIs
export const auth = {
  login: async (username, password) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
    }
    
    return data;
  },

  logout: async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
  },

  isAuthenticated: () => !!getToken(),

  getUsername: () => localStorage.getItem('username') || 'User',
};

// Issues APIs
export const issues = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.severity) params.append('severity', filters.severity);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/issues${query}`);
  },

  getById: async (id) => {
    return apiCall(`/issues/${id}`);
  },

  create: async (issueData) => {
    return apiCall('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  },

  update: async (id, issueData) => {
    return apiCall(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(issueData),
    });
  },

  delete: async (id) => {
    return apiCall(`/issues/${id}`, {
      method: 'DELETE',
    });
  },

  resolve: async (id) => {
    return apiCall(`/issues/${id}/resolve`, {
      method: 'PATCH',
    });
  },
};

// Dashboard API
export const dashboard = {
  getStats: async () => {
    return apiCall('/dashboard');
  },
};

// CSV Import API
export const importCSV = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/issues/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Import failed');
  }

  return data;
};