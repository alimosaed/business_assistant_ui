'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { verifyToken } from './auth';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  tokenExpiresAt: number | null;
}

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  exp?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  
  // Check if localStorage is available and working
  const isLocalStorageAvailable = () => {
    const testKey = '__test_storage__';
    try {
      localStorage.setItem(testKey, 'test');
      const result = localStorage.getItem(testKey) === 'test';
      localStorage.removeItem(testKey);
      return result;
    } catch (e) {
      console.error('localStorage is not available:', e);
      return false;
    }
  };

  // Check token expiration
  const checkTokenExpiration = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      console.log('Decoded token payload:', decoded);

      if (decoded.exp) {
        // Store expiration time
        setTokenExpiresAt(decoded.exp * 1000); // Convert to milliseconds

        // Check if token is expired
        const currentTime = Date.now();
        const expirationTime = decoded.exp * 1000;
        const isValid = expirationTime > currentTime;

        console.log('Token expiration details:', {
          currentTime: new Date(currentTime).toISOString(),
          expirationTime: new Date(expirationTime).toISOString(),
          isValid,
          timeUntilExpiry: Math.floor((expirationTime - currentTime) / 1000 / 60) + ' minutes'
        });

        return isValid;
      }
      console.error('Token has no expiration field');
      return false;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  };

  useEffect(() => {
    const verifyAuth = async () => {
      console.log('Checking if localStorage is available...');
      const storageAvailable = isLocalStorageAvailable();
      console.log('localStorage available:', storageAvailable);
      
      if (!storageAvailable) {
        console.error('localStorage is not available, authentication will not persist');
        setIsLoading(false);
        return;
      }
      
      console.log('Checking for token in localStorage...');
      let token;
      
      try {
        token = localStorage.getItem('authToken');
        console.log('Token in localStorage:', token ? 'Found' : 'Not found');
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
      }
      
      if (token) {
        try {
          // Check token expiration
          console.log('Checking token expiration...');
          const isValid = checkTokenExpiration(token);
          console.log('Token expiration check result:', isValid ? 'Valid' : 'Expired');
          
          if (isValid) {
            console.log('Verifying token with backend...');
            await verifyToken(token);
            console.log('Token verified successfully with backend');
            setIsAuthenticated(true);
          } else {
            console.error('Token expired');
            try {
              localStorage.removeItem('authToken');
              console.log('Expired token removed from localStorage');
            } catch (removeError) {
              console.error('Error removing token from localStorage:', removeError);
            }
          }
        } catch (error) {
          console.error('Invalid token:', error);
          try {
            localStorage.removeItem('authToken');
            console.log('Invalid token removed from localStorage');
          } catch (removeError) {
            console.error('Error removing token from localStorage:', removeError);
          }
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
    
    // Set up token expiration check
    const checkInterval = setInterval(() => {
      try {
        const token = localStorage.getItem('authToken');
        if (token && tokenExpiresAt) {
          const currentTime = Date.now();
          if (currentTime >= tokenExpiresAt) {
            console.log('Token expired, logging out');
            logout();
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage in expiration check:', error);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkInterval);
  }, [tokenExpiresAt]);

  const login = async (token: string) => {
    try {
      console.log('=== Login Process Started ===');
      console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');

      console.log('Step 1: Verifying token with backend...');
      try {
        await verifyToken(token);
        console.log('✓ Token verified successfully with backend');
      } catch (verifyError) {
        console.error('✗ Backend verification failed:', verifyError);
        throw verifyError;
      }

      console.log('Step 2: Checking token expiration...');
      const isValid = checkTokenExpiration(token);
      console.log('Token expiration check result:', isValid ? '✓ Valid' : '✗ Expired');

      if (isValid) {
        console.log('Step 3: Storing token...');
        const storageAvailable = isLocalStorageAvailable();
        console.log('localStorage available:', storageAvailable);

        if (storageAvailable) {
          try {
            localStorage.setItem('authToken', token);
            const storedToken = localStorage.getItem('authToken');
            console.log('Token storage verification:', storedToken === token ? '✓ Success' : '✗ Failed');

            if (storedToken !== token) {
              console.error('✗ Token was not stored correctly in localStorage');
            }
          } catch (storageError) {
            console.error('✗ Error storing token in localStorage:', storageError);
          }
        } else {
          console.error('✗ localStorage is not available, authentication will not persist');
        }

        setIsAuthenticated(true);
        console.log('=== Login Successful ===');
        return true;
      } else {
        console.error('✗ Token expired or invalid');
        return false;
      }
    } catch (error) {
      console.error('=== Login Failed ===');
      console.error('Error:', error);
      return false;
    }
  };
  
  // Function to refresh token (redirect to login)
  const refreshToken = async () => {
    // In a real implementation, you might have a refresh token flow
    // For now, we'll just redirect to login
    logout();
    window.location.href = '/login';
    return false;
  };

  const logout = () => {
    console.log('Logging out...');
    try {
      localStorage.removeItem('authToken');
      console.log('Token removed from localStorage');
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshToken,
      tokenExpiresAt
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};