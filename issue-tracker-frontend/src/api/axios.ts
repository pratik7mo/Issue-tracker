import axios from 'axios';

/**
 * Backend REST is context-agnostic. Nginx handles the /api prefix.
 */
function resolveApiBaseUrl(): string {
  const fallback = '/api';
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw == null || String(raw).trim() === '') {
    return fallback;
  }
  let base = String(raw).trim().replace(/\/+$/, '');
  return base;
}

const resolvedBaseUrl = resolveApiBaseUrl();

// One-time log so deployed builds show the baked URL in DevTools Console (verify after hard refresh).
console.info('[IssueTracker] API base URL:', resolvedBaseUrl);

const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const PUBLIC_AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !isPublicAuthRequest(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.response?.status} from ${error.config?.url}`, error.response?.data);
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
