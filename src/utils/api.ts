// API utility for handling backend requests
const getBaseURL = (): string => {
  // Use environment variable if available, otherwise fallback to localhost for development
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const baseURL = getBaseURL();
  const url = `${baseURL}${endpoint}`;

  // Default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  console.log(`Making API request to: ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      console.error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response;
  } catch (error) {
    console.error(`API request error for ${url}:`, error);
    throw error;
  }
};

// Convenience methods
export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
