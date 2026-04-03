import axios from 'axios';

// The base URL for the API routes. 
// Laravel usually serves API at /api, but Sanctum CSRF is at root.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is CRITICAL for Sanctum stateful cookies
});

// Interceptor to handle global UNAUTHORIZED responses globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is 401 Unauthenticated, the user session expired or is invalid
    if (error.response?.status === 401) {
      // Clear any frontend persistent Auth states if necessary here or trigger a custom event
      localStorage.removeItem('user_session'); // Example cleanup
      
      // Optionally redirect to login, but usually the AuthContext detects this
      // window.location.href = '/login'; 
    }
    
    // For 419 Page Expired (CSRF token mismatch)
    if (error.response?.status === 419) {
      // Sometimes fetching the csrf-cookie again solves this
    }

    return Promise.reject(error);
  }
);

export default apiClient;
