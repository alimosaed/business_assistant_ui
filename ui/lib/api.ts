/**
 * API utility with authentication interceptor
 * Automatically handles auth tokens and redirects on authentication failures
 */

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipAuthRedirect?: boolean;
}

/**
 * Handles authentication errors by clearing token and redirecting to login
 */
const handleAuthError = (): void => {
  console.error('Authentication failed - redirecting to login');
  
  try {
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * Gets authentication headers from localStorage
 */
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
  
  return headers;
};

/**
 * Makes an authenticated API request with automatic error handling
 * @param url - The API endpoint URL
 * @param options - Fetch options with optional skipAuth flag
 * @returns Promise with parsed JSON response
 * @throws Error on non-2xx responses or network errors
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuth = false, skipAuthRedirect = false, headers = {}, ...fetchOptions } = options;
  
  // Merge auth headers with provided headers
  const requestHeaders = skipAuth
    ? { 'Content-Type': 'application/json', ...headers }
    : { ...getAuthHeaders(), ...headers };
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });
    
    // Handle authentication errors (401 Unauthorized, 403 Forbidden)
    if (response.status === 401 || response.status === 403) {
      if (!skipAuthRedirect) {
        handleAuthError();
      }
      throw new Error('Authentication required');
    }
    
    // Handle other HTTP errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse and return JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Re-throw authentication errors without modification
    if (error instanceof Error && error.message === 'Authentication required') {
      throw error;
    }
    
    // Handle network errors (API not accessible)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - API not accessible:', error);
      // Redirect to login if API is not accessible (unless skipAuthRedirect is true)
      if (!skipAuthRedirect) {
        handleAuthError();
      }
      throw new Error('Unable to connect to server. Please check if the API is running.');
    }
    
    // Log and re-throw other errors
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Makes a GET request with authentication
 */
export async function apiGet<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * Makes a POST request with authentication
 */
export async function apiPost<T = any>(
  url: string,
  body?: any,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Makes a PUT request with authentication
 */
export async function apiPut<T = any>(
  url: string,
  body?: any,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Makes a DELETE request with authentication
 */
export async function apiDelete<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}