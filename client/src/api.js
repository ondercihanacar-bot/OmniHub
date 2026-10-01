const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('omnihub_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('omnihub_token', token);
  } else {
    localStorage.removeItem('omnihub_token');
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem('omnihub_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('omnihub_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('omnihub_user');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Session expired or unauthenticated
    setAuthToken(null);
    setCurrentUser(null);
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'İşlem sırasında bir hata oluştu');
  }
  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiRequest('/auth/me'),
  changePassword: (data) => apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard
  getDashboardStats: () => apiRequest('/dashboard/stats'),

  // Customers
  getCustomers: (search = '') => apiRequest(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getCustomer: (id) => apiRequest(`/customers/${id}`),
  createCustomer: (data) => apiRequest('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => apiRequest(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => apiRequest(`/customers/${id}`, { method: 'DELETE' }),

  // Licenses
  getLicenses: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.product_id) params.append('product_id', filters.product_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    if (filters.search) params.append('search', filters.search);
    const qs = params.toString();
    return apiRequest(`/licenses${qs ? `?${qs}` : ''}`);
  },
  getLicense: (id) => apiRequest(`/licenses/${id}`),
  generateLicense: (data) => apiRequest('/licenses/generate', { method: 'POST', body: JSON.stringify(data) }),
  updateLicenseStatus: (id, status, notes = '') => 
    apiRequest(`/licenses/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, notes }) }),
  renewLicense: (id, data) => apiRequest(`/licenses/${id}/renew`, { method: 'POST', body: JSON.stringify(data) }),
  resetHwid: (id) => apiRequest(`/licenses/${id}/reset-hwid`, { method: 'POST' }),
  deleteLicense: (id) => apiRequest(`/licenses/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: () => apiRequest('/products'),
  updateProduct: (id, data) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Settings
  getSettings: () => apiRequest('/settings'),
  updateSettings: (data) => apiRequest('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Client Simulation (for test & demo)
  simulateHeartbeat: (payload) => 
    fetch('/api/v1/license/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json()),
  simulateActivate: (payload) =>
    fetch('/api/v1/license/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json())
};
