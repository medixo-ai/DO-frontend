/**
 * API service layer for communicating with the FastAPI backend.
 *
 * All auth-related endpoints:
 *   POST /auth/signup   – { name, email, password }       → { token, user }
 *   POST /auth/login    – { email, password }              → { token, user }
 *   GET  /auth/me       – (Authorization: Bearer <token>) → { user }
 */

const API_BASE = import.meta.env.VITE_API_BASE || '';

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'intellidocs_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Parse JSON body (if any)
  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  }

  if (!res.ok) {
    const message = data?.detail || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

/**
 * Sign up a new user.
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function apiSignup({ name, email, password }) {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function apiLogin({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

/**
 * Get the currently authenticated user from the backend.
 * @returns {Promise<{ user: object }>}
 */
export async function apiGetMe() {
  return request('/auth/me', { method: 'GET' });
}

/**
 * Generic authenticated GET request.
 */
export async function apiGet(path) {
  return request(path, { method: 'GET' });
}

/**
 * Generic authenticated POST request.
 */
export async function apiPost(path, body) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// File Upload API
// ---------------------------------------------------------------------------

/**
 * Upload a file to the ingestion pipeline.
 * Uses XMLHttpRequest for real upload progress tracking.
 *
 * Backend endpoint: POST /ingest
 *   - file: The file to upload (multipart/form-data)
 *   - document_name: Optional document name (query param)
 *   - department: Optional department (query param)
 *   - access_level: Access level - All, Manager, Admin (query param)
 *   - tags: Comma-separated tags (query param)
 *
 * @param {File} file - The file to upload
 * @param {object} options
 * @param {string} [options.documentName] - Optional document name
 * @param {string} [options.department] - Department (HR, Finance, etc.)
 * @param {string} [options.accessLevel] - Access level (All, Manager, Admin)
 * @param {string} [options.tags] - Comma-separated tags
 * @param {function} [options.onProgress] - Progress callback (0-100)
 * @param {AbortSignal} [options.signal] - AbortController signal
 * @returns {Promise<object>} Ingestion result from the backend
 */
export function apiUploadFile(file, { documentName, department, accessLevel, tags, onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Build URL with query params
    const params = new URLSearchParams();
    if (documentName) params.set('document_name', documentName);
    if (department) params.set('department', department);
    if (accessLevel) params.set('access_level', accessLevel);
    if (tags) params.set('tags', tags);
    const queryString = params.toString();
    const url = `${API_BASE}/ingest${queryString ? `?${queryString}` : ''}`;

    xhr.open('POST', url);

    // Attach JWT token
    const token = getToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = { detail: xhr.responseText };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        const message = data?.detail || `Upload failed (${xhr.status})`;
        const err = new Error(message);
        err.status = xhr.status;
        err.data = data;
        reject(err);
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Support abort via AbortController
    if (signal) {
      signal.addEventListener('abort', () => xhr.abort());
    }

    // Send as FormData (multipart/form-data)
    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

// ---------------------------------------------------------------------------
// Query / AI Search API
// ---------------------------------------------------------------------------

/**
 * Query the knowledge graph with a natural language question.
 *
 * Backend endpoint: POST /query
 *   - question: The natural language question (JSON body)
 *
 * Returns: { answer, entities_used, documents_accessed, relationship_count }
 *
 * @param {string} question - The question to ask
 * @returns {Promise<object>} Query result from the backend
 */
export async function apiQuery(question) {
  return request('/query', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

// ---------------------------------------------------------------------------
// Document Management API
// ---------------------------------------------------------------------------

/**
 * Fetch all documents with their approval status.
 * Backend endpoint: GET /documents-all
 * @returns {Promise<{ documents: Array }>}
 */
export async function apiGetAllDocuments() {
  return request('/documents-all', { method: 'GET' });
}

/**
 * Approve a document for search/query access.
 * Backend endpoint: POST /documents/{docId}/approve
 * @param {number} docId - Document ID
 * @param {string} [reviewedBy='admin'] - User approving
 * @returns {Promise<{ message: string }>}
 */
export async function apiApproveDocument(docId, reviewedBy = 'admin') {
  return request(`/documents/${docId}/approve?reviewed_by=${encodeURIComponent(reviewedBy)}`, {
    method: 'POST',
  });
}

/**
 * Reject a document.
 * Backend endpoint: POST /documents/{docId}/reject
 * @param {number} docId - Document ID
 * @param {string} [reviewedBy='admin'] - User rejecting
 * @returns {Promise<{ message: string }>}
 */
export async function apiRejectDocument(docId, reviewedBy = 'admin') {
  return request(`/documents/${docId}/reject?reviewed_by=${encodeURIComponent(reviewedBy)}`, {
    method: 'POST',
  });
}

// ---------------------------------------------------------------------------
// Contradictions API
// ---------------------------------------------------------------------------

/**
 * Fetch all detected contradictions from the knowledge graph.
 * Backend endpoint: GET /contradictions
 * @param {number} [limit=500] - Maximum number of results
 * @returns {Promise<{ contradictions: Array, total: number }>}
 */
export async function apiGetContradictions(limit = 500) {
  return request(`/contradictions?limit=${limit}`, { method: 'GET' });
}

/**
 * Delete all CONTRADICTS edges from Neo4j (admin only).
 * Backend endpoint: DELETE /contradictions
 * @returns {Promise<{ message: string }>}
 */
export async function apiClearContradictions() {
  return request('/contradictions', { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// User Management API
// ---------------------------------------------------------------------------

/**
 * Fetch all users (admin only).
 * Backend endpoint: GET /users
 * @returns {Promise<{ users: Array }>}
 */
export async function apiGetUsers() {
  return request('/users', { method: 'GET' });
}

/**
 * Create a new user (admin only).
 * Backend endpoint: POST /users
 * @param {{ name: string, email: string, password: string, role: string }} payload
 * @returns {Promise<{ user: object }>}
 */
export async function apiCreateUser({ name, email, password, role }) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
}

/**
 * Update a user's role (admin only).
 * Backend endpoint: PUT /users/{userId}
 * @param {number} userId
 * @param {{ role: string }} payload
 * @returns {Promise<{ user: object }>}
 */
export async function apiUpdateUser(userId, { role }) {
  return request(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

/**
 * Delete a user (admin only).
 * Backend endpoint: DELETE /users/{userId}
 * @param {number} userId
 * @returns {Promise<{ message: string }>}
 */
export async function apiDeleteUser(userId) {
  return request(`/users/${userId}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Dashboard Analytics API
// ---------------------------------------------------------------------------

/**
 * Fetch aggregate dashboard statistics.
 * Backend endpoint: GET /dashboard/stats
 * @returns {Promise<{ total_documents: number, total_users: number, total_queries: number }>}
 */
export async function apiGetDashboardStats() {
  return request('/dashboard/stats', { method: 'GET' });
}

/**
 * Fetch recent activity (queries + documents).
 * Backend endpoint: GET /dashboard/recent-activity
 * @returns {Promise<{ recent_queries: Array, recent_documents: Array }>}
 */
export async function apiGetRecentActivity() {
  return request('/dashboard/recent-activity', { method: 'GET' });
}

/**
 * Fetch daily query counts for the last 7 days.
 * Backend endpoint: GET /dashboard/search-trends
 * @returns {Promise<{ trends: Array }>}
 */
export async function apiGetSearchTrends() {
  return request('/dashboard/search-trends', { method: 'GET' });
}

/**
 * Fetch the most frequently asked questions.
 * Backend endpoint: GET /dashboard/top-queries
 * @returns {Promise<{ top_queries: Array }>}
 */
export async function apiGetTopQueries() {
  return request('/dashboard/top-queries', { method: 'GET' });
}

// ---------------------------------------------------------------------------
// Department Analytics API
// ---------------------------------------------------------------------------

/**
 * Fetch per-department document and member counts.
 * Backend endpoint: GET /departments
 * @returns {Promise<{ departments: Array<{ department: string, document_count: number, member_count: number }> }>}
 */
export async function apiGetDepartments() {
  return request('/departments', { method: 'GET' });
}
