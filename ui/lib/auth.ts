import { apiGet } from './api';

export const verifyToken = async (token: string): Promise<any> => {
  try {
    // Temporarily store token for verification
    const existingToken = localStorage.getItem('authToken');
    localStorage.setItem('authToken', token);
    
    try {
      const userData = await apiGet('http://127.0.0.1:8000/api/auth/me');
      return userData;
    } finally {
      // Restore original token if verification fails
      if (existingToken) {
        localStorage.setItem('authToken', existingToken);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};