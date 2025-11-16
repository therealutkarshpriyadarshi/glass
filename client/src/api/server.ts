import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const baseURL = "http://localhost:8080/api";

/**
 * Creates an Axios instance with predefined configuration.
 * @constant
 * @type {AxiosInstance}
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
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
