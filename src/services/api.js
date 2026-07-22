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
 * Backend endpoint: POST /ingest  (returns 202 with {task_id, status})
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
 * @param {function} [options.onProgress] - Progress callback (0-100 for upload, or string for processing stage)
 * @param {AbortSignal} [options.signal] - AbortController signal
 * @returns {Promise<object>} { task_id, status, document_name } on acceptance
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

    // Track upload progress (file transfer phase only)
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    // Handle completion — backend now returns 202
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


/**
 * Check the status of a background ingestion task.
 *
 * Backend endpoint: GET /ingest/status/{taskId}
 *
 * @param {string} taskId - The task ID returned by POST /ingest
 * @returns {Promise<object>} { task_id, status, progress, result, error, ... }
 */
export async function apiCheckIngestionStatus(taskId) {
  return request(`/ingest/status/${taskId}`, { method: 'GET' });
}


/**
 * Upload a file and poll until ingestion completes or fails.
 *
 * Combines apiUploadFile + apiCheckIngestionStatus into a single promise.
 *
 * @param {File} file - The file to upload
 * @param {object} options
 * @param {string} [options.documentName]
 * @param {string} [options.department]
 * @param {string} [options.accessLevel]
 * @param {string} [options.tags]
 * @param {function} [options.onProgress] - Called with (percent: number) during upload,
 *                                          then (progressText: string) during processing
 * @param {function} [options.onStatusChange] - Called with full status object on each poll
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.pollIntervalMs=3000] - Milliseconds between status polls
 * @returns {Promise<object>} The completed IngestionResult from the backend
 */
export async function apiUploadFileWithPolling(file, {
  documentName, department, accessLevel, tags,
  onProgress, onStatusChange, signal,
  pollIntervalMs = 3000,
} = {}) {
  // Phase 1: Upload the file (returns 202 with task_id)
  const accepted = await apiUploadFile(file, {
    documentName, department, accessLevel, tags,
    onProgress: (percent) => {
      if (onProgress) onProgress(percent, null);
    },
    signal,
  });

  const taskId = accepted.task_id;
  if (!taskId) {
    // Fallback: backend returned a result directly (shouldn't happen, but safe)
    return accepted;
  }

  // Phase 2: Poll for completion
  if (onProgress) onProgress(100, 'Processing…');

  return new Promise((resolve, reject) => {
    let cancelled = false;

    if (signal) {
      signal.addEventListener('abort', () => {
        cancelled = true;
        reject(new Error('Upload cancelled'));
      });
    }

    const poll = async () => {
      if (cancelled) return;

      try {
        const status = await apiCheckIngestionStatus(taskId);
        if (onStatusChange) onStatusChange(status);

        if (status.status === 'completed') {
          if (onProgress) onProgress(100, 'Done');
          resolve(status.result || status);
          return;
        }

        if (status.status === 'failed') {
          const err = new Error(status.error || 'Ingestion failed');
          err.status = 500;
          err.data = status;
          reject(err);
          return;
        }

        // Still processing — report progress and poll again
        if (onProgress && status.progress) {
          onProgress(100, status.progress);
        }
        setTimeout(poll, pollIntervalMs);
      } catch (err) {
        // Network error during polling — retry once
        if (!cancelled) {
          setTimeout(poll, pollIntervalMs * 2);
        }
      }
    };

    // First poll after a short delay
    setTimeout(poll, 1000);
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
 *   - department: Optional department to filter by (JSON body)
 *
 * Returns: { answer, entities_used, documents_accessed, relationship_count, sources }
 *
 * @param {string} question - The question to ask
 * @param {string|null} [department=null] - Department to filter results by
 * @returns {Promise<object>} Query result from the backend
 */
export async function apiQuery(question, department = null) {
  const body = { question };
  if (department) {
    body.department = department;
  }
  return request('/query', {
    method: 'POST',
    body: JSON.stringify(body),
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

// ---------------------------------------------------------------------------
// File Viewer / Downloads API
// ---------------------------------------------------------------------------

/**
 * Fetch all uploaded files from the server.
 * Backend endpoint: GET /uploaded-files
 * @returns {Promise<{ files: Array<{ filename: string, url: string, size: number }> }>}
 */
export async function apiGetUploadedFiles() {
  return request('/uploaded-files', { method: 'GET' });
}

/**
 * Build the URL to view/download an uploaded file.
 * Files are stored as: {doc_id}_{original_filename}
 *
 * @param {number|string} docId - The document ID
 * @param {string} originalFilename - The original uploaded filename
 * @returns {string} The URL path to access the file
 */
export function getFileViewUrl(docId, originalFilename) {
  const filename = `${docId}_${originalFilename}`;
  return `${API_BASE}/uploads/${encodeURIComponent(filename)}`;
}

/**
 * Find the uploaded file URL for a given document ID from the uploaded-files list.
 * This is useful when you don't know the exact original filename.
 *
 * @param {Array} uploadedFiles - Array from apiGetUploadedFiles().files
 * @param {number|string} docId - The document ID to find
 * @returns {{ filename: string, url: string, size: number } | null}
 */
export function findUploadedFile(uploadedFiles, docId) {
  const prefix = `${docId}_`;
  return uploadedFiles.find(f => f.filename.startsWith(prefix)) || null;
}
