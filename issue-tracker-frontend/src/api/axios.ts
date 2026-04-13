import axios from 'axios';

/** Backend serves REST under `/api/...`. Accepts host-only URLs from .env and appends `/api`. */
function resolveApiBaseUrl(): string {
  const fallback = 'http://localhost:9092/api';
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw == null || String(raw).trim() === '') {
    return fallback;
  }
  let base = String(raw).trim().replace(/\/+$/, '');
  if (!base.endsWith('/api')) {
    base += '/api';
  }
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


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
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
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
