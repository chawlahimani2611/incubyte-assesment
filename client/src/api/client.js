import axios from 'axios';

/**
 * Axios API Client
 *
 * Configured instance targeting the backend service API base URL.
 * Includes interceptors for consistent error unwrapping.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor to gracefully extract response body or format API error payload
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If backend returns a structured JSON error response, pass it cleanly
    if (error.response && error.response.data && error.response.data.error) {
      return Promise.reject(error.response.data.error);
    }
    return Promise.reject({
      type: 'NETWORK_ERROR',
      message: error.message || 'A network error occurred while connecting to the server.',
    });
  }
);

export default apiClient;
