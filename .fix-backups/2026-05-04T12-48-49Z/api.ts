import axios from 'axios';

export const TOKEN_KEY = 'gslc_token';

// ─── Token helpers ────────────────────────────────────────────────────────────
// sessionStorage is used instead of localStorage:
// - Token is cleared automatically when the browser tab/session closes
// - Reduces the persistence window if XSS occurs
// - Trade-off: user must log in again after closing the tab
export const getToken  = (): string | null => sessionStorage.getItem(TOKEN_KEY);
export const setToken  = (token: string): void => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => sessionStorage.removeItem(TOKEN_KEY);

// ─── Axios instance ───────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept':           'application/json',
    'Content-Type':     'application/json',
  },
  withCredentials: true, // Required: sends cookies + satisfies CORS supports_credentials
});

// ─── Request interceptor — attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle auth errors ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expired or invalid — clear it
      clearToken();
      const path = window.location.pathname;
      const publicRoutes = ['/', '/login', '/staff/login', '/register', '/forgot-password', '/staff/forgot-password', '/reset-password'];
      
      if (!publicRoutes.includes(path)) {
        const isStaffRoute = ['/admin', '/director', '/commercial', '/logistics', '/finance']
          .some(prefix => path.startsWith(prefix));
        window.location.href = isStaffRoute ? '/staff/login' : '/login';
      }
    }

    if (status === 403) {
      // Authenticated but forbidden — redirect to their own home
      // AuthContext will determine the correct home on next load
      window.location.href = '/';
    }

    if (status === 429) {
      const retryAfter = error.response?.data?.retry_after ?? null;
      return Promise.reject({
        isRateLimit: true,
        retryAfter,
        message: retryAfter
          ? `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfter / 60)} minute(s).`
          : 'Trop de tentatives. Réessayez dans quelques minutes.',
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
