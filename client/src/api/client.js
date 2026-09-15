import axios from 'axios';

// Base API URL from Vite environment variables (fallback to '/api/v1')
const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api/v1';

// In-memory access token storage
let memoryAccessToken = null;
let authFailureCallback = null;

export const setAccessToken = (token) => {
  memoryAccessToken = token;
};

export const getAccessToken = () => memoryAccessToken;

export const registerAuthFailureCallback = (callback) => {
  authFailureCallback = callback;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach in-memory access token if available
api.interceptors.request.use(
  (config) => {
    if (memoryAccessToken) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 with single silent refresh and retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh if error is not 401 or if originalRequest missing
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Guard against infinite retry loops:
    // If request has already been retried OR if the request was to login/refresh/logout, do not retry.
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register');

    if (originalRequest._retry || isAuthEndpoint) {
      setAccessToken(null);
      if (authFailureCallback && !isAuthEndpoint) {
        authFailureCallback();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Attempt single silent refresh
      const refreshResponse = await axios.post(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = refreshResponse.data?.data?.accessToken;
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } else {
        throw new Error('No access token returned from refresh');
      }
    } catch (refreshError) {
      setAccessToken(null);
      if (authFailureCallback) {
        authFailureCallback();
      }
      return Promise.reject(refreshError);
    }
  }
);

/**
 * Utility to extract field-level errors or human message from standard ApiError responses (e.g. 422 validation)
 */
export const parseApiError = (error) => {
  if (!error?.response?.data) {
    return { message: error?.message || 'A network error occurred. Please try again.' };
  }

  const data = error.response.data;
  const message = data.message || 'An error occurred';
  const fieldErrors = {};

  if (Array.isArray(data.errors)) {
    data.errors.forEach((err) => {
      if (typeof err === 'string' && err.includes(':')) {
        const parts = err.split(':');
        const field = parts[0].trim();
        const msg = parts.slice(1).join(':').trim();
        fieldErrors[field] = msg;
      } else if (typeof err === 'object' && err.field && err.message) {
        fieldErrors[err.field] = err.message;
      }
    });
  }

  return { message, fieldErrors };
};

export default api;
