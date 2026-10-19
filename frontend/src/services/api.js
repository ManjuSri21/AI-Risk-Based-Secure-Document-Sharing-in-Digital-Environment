const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Authentication storage helpers
export const getStoredToken = () => localStorage.getItem('secureshare_token');
export const setStoredToken = (token) => {
  if (token) { localStorage.setItem('secureshare_token', token); } else { localStorage.removeItem('secureshare_token'); }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('secureshare_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user) => {
  if (user) { localStorage.setItem('secureshare_user', JSON.stringify(user)); } else { localStorage.removeItem('secureshare_user'); }
};

export const clearAuth = () => {
  localStorage.removeItem('secureshare_token');
  localStorage.removeItem('secureshare_token');
  localStorage.removeItem('secureshare_user');
  localStorage.removeItem('secureshare_user');
};

// Central fetch wrapper with JWT header injection
const request = async (endpoint, options = {}) => {
  const token = getStoredToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.warn(`[API] Endpoint ${endpoint} failed:`, err.message);
    throw err;
  }
};

const downloadCsv = async (endpoint, filename) => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// API Services
export const authApi = {
  login: async (email, password, role) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    if (res.token) {
      setStoredToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  register: async (name, email, password, role = 'user') => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    if (res.token) {
      setStoredToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  getMe: async () => {
    return request('/auth/me');
  },

  updateProfile: async (data) => {
    const res = await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res.user) setStoredUser(res.user);
    return res;
  },

  changePassword: async (currentPassword, newPassword) => {
    return request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  verify2FALogin: async (tempToken, otp) => {
    const res = await request('/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ tempToken, otp }),
    });
    if (res.token) {
      setStoredToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  updateSecuritySettings: async (settings) => {
    const res = await request('/auth/security-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return res;
  },

  getSessions: async () => {
    return request('/auth/sessions');
  },

  revokeSession: async (sessionId) => {
    return request(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
    });
  },

  logout: () => {
    clearAuth();
  },
};

export const adminSecurityApi = {
  getSecurityState: () => request('/admin/security'),

  updateSettings: (settings) => request('/admin/security/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  }),

  updatePassphrase: (currentPassword, newPassword) =>
    authApi.changePassword(currentPassword, newPassword),

  rotateMasterKey: (reason = 'Routine rotation') => request('/admin/security/key/rotate', {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),

  activateKey: (keyId) => request(`/admin/security/key/${encodeURIComponent(keyId)}/activate`, {
    method: 'POST',
  }),

  revokeKey: (keyId) => request(`/admin/security/key/${encodeURIComponent(keyId)}/revoke`, {
    method: 'POST',
  }),
};

export const documentsApi = {
  upload: async (file, docName) => {
    const formData = new FormData();
    formData.append('file', file);
    if (docName) formData.append('docName', docName);

    return request('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/documents?${searchParams}`);
  },

  getById: async (id) => {
    return request(`/documents/${id}`);
  },

  getFile: async (id, options = {}) => {
    const headers = {};
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/documents/${id}/view`, {
      headers,
      signal: options.signal,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return response.blob();
  },

  delete: async (id) => {
    return request(`/documents/${id}`, { method: 'DELETE' });
  },

  updatePolicy: async (id, policy) => {
    return request(`/documents/${id}/policy`, {
      method: 'PUT',
      body: JSON.stringify({ policy }),
    });
  },
};

export const sharesApi = {
  getMyShares: async () => request('/shares/my-shares'),
  create: async (payload) => {
    return request('/shares/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getInfo: async (shareToken) => {
    return request(`/shares/${encodeURIComponent(shareToken)}/info`);
  },

  verifyPassword: async (shareToken, password) => {
    return request(`/shares/${encodeURIComponent(shareToken)}/verify-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  requestOtp: async (shareToken, resend = false) => {
    return request(`/shares/${encodeURIComponent(shareToken)}/request-otp`, {
      method: 'POST',
      body: JSON.stringify({ resend }),
    });
  },

  verifyOtp: async (shareToken, otp) => {
    return request(`/shares/${encodeURIComponent(shareToken)}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  },

  getContent: async (shareToken, accessToken, options = {}) => {
    const response = await fetch(`${API_BASE}/shares/${encodeURIComponent(shareToken)}/view`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: options.signal,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return response.blob();
  },

  downloadContent: async (shareToken, accessToken) => {
    const response = await fetch(`${API_BASE}/shares/${encodeURIComponent(shareToken)}/download`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return response.blob();
  },
};

export const auditApi = {
  getMyLogs: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/audit/my-logs?${searchParams}`);
  },

  getAdminLogs: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/audit/admin-logs?${searchParams}`);
  },

  clearAllLogs: async () => {
    return request('/audit/clear-all', {
      method: 'DELETE',
    });
  },
};

export const adminApi = {
  getStats: async () => {
    return request('/admin/stats');
  },

  getUsers: async () => {
    return request('/admin/users');
  },

  toggleUserStatus: async (id) => {
    return request(`/admin/users/${id}/status`, { method: 'PATCH' });
  },

  getDocuments: async (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/admin/documents?${searchParams}`);
  },

  getRiskTelemetry: async () => {
    return request('/admin/risk-telemetry');
  },

  labelDocumentRisk: async (id, riskLevel) => {
    return request(`/admin/documents/${id}/risk-label`, {
      method: 'PATCH',
      body: JSON.stringify({ riskLevel }),
    });
  },

  downloadRiskTrainingData: async () => {
    return downloadCsv('/admin/risk-training-data', 'risk-training-data.csv');
  },

  getDocumentAuditLogs: async (id) => {
    return request(`/admin/documents/${id}/audit-logs`);
  },

  investigateDocument: async (id, justification) => {
    return request(`/admin/documents/${id}/investigate`, {
      method: 'POST',
      body: JSON.stringify({ justification }),
    });
  },
};




export const checkHealth = async () => {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
};
