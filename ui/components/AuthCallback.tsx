'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import logoImage from '@/components/assets/logo.jpg';

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      console.log('Token received from URL:', token ? `${token.substring(0, 15)}...` : 'No token');
      
      if (token) {
        try {
          console.log('Attempting to login with token');
          const success = await login(token);
          console.log('Login result:', success ? 'Success' : 'Failed');
          
          if (success) {
            // Check if token was actually stored
            const storedToken = localStorage.getItem('authToken');
            console.log('Token stored in localStorage:', storedToken ? 'Yes' : 'No');
            
            router.push('/');
          } else {
            setError('Authentication failed');
            router.push('/login?error=authentication-failed');
          }
        } catch (error) {
          console.error('Auth error:', error);
          setError('Authentication error');
          router.push('/login?error=authentication-error');
        }
      } else {
        setError('No token provided');
        router.push('/login?error=no-token');
      }
    };

    handleAuth();
  }, [router, searchParams, login]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <Image
            src={logoImage}
            alt="Logo"
            width={120}
            height={120}
            className="logo-image"
            priority
          />
        </div>
        <h1 className="login-title">Authenticating...</h1>
        {error ? (
          <p className="error-message">{error}</p>
        ) : (
          <p>Please wait while we verify your identity.</p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;