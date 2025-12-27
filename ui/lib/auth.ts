import { apiGet } from './api';

export const verifyToken = async (token: string): Promise<any> => {
  try {
    // Temporarily store token for verification
    const existingToken = localStorage.getItem('authToken');
    localStorage.setItem('authToken', token);

    try {
      const userData = await apiGet('http://127.0.0.1:8000/api/auth/me');
      // Verification succeeded - keep the new token
      return userData;
    } catch (error) {
      // Verification failed - restore original token
      if (existingToken) {
        localStorage.setItem('authToken', existingToken);
      } else {
        localStorage.removeItem('authToken');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};