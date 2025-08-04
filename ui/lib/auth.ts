export const verifyToken = async (token: string): Promise<any> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify token');
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};