import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

/**
 * Get API base URL from environment variables with fallback
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

/**
 * Creates an Axios instance with predefined configuration.
 * @constant
 * @type {AxiosInstance}
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Adds an authorization token to the request headers if available.
 * @param {string | null} token - The authorization token.
 */
export const setAuthToken = (token: string | null) => {
  if (token)
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete axiosInstance.defaults.headers.common["Authorization"];
};

/**
 * Response interceptor to handle token expiration
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear auth token
      setAuthToken(null);

      // Remove token from localStorage if it exists
      localStorage.removeItem("token");

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Makes an API call using the configured Axios instance.
 * @template T - The expected type of the response data.
 * @param {AxiosRequestConfig} config - The configuration for the API request.
 * @returns {Promise<T>} A promise that resolves with the response data.
 * @throws {Error} Throws an error if the API call fails.
 */
export const apiCall = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export default axiosInstance;
