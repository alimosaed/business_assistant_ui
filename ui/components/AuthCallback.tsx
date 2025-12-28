'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import logoImage from '@/components/assets/logo.png';

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      // Check for error parameters first
      const errorParam = searchParams.get('error');
      const messageParam = searchParams.get('message');

      if (errorParam || messageParam) {
        // Immediately redirect to login page with error parameters
        const params = new URLSearchParams();
        if (errorParam) params.append('error', errorParam);
        if (messageParam) params.append('message', messageParam);
        router.replace(`/login?${params.toString()}`);
        return;
      }

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
    <div className="login-overlay">
      <div className="login-modal">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image
            src={logoImage}
            alt="Logo"
            width={100}
            height={100}
            priority
          />
        </div>
        <h1 className="modal-title">
          {error ? 'Authentication Notice' : 'Authenticating...'}
        </h1>
        {error ? (
          <div className="error-message">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: '0.125rem' }}
              >
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div style={{ flex: 1 }}>
                {error}
                <div style={{ marginTop: '0.5rem', fontSize: '0.85em', opacity: 0.9 }}>
                  Redirecting to login page...
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="modal-subtitle">Please wait while we verify your identity.</p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;