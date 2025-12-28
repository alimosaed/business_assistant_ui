'use client';

import '../auth/auth.css';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const LoginPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Check for error messages in URL parameters (only once on mount)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');

    if (messageParam) {
      setError(messageParam);
    } else if (errorParam) {
      // Map error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        'account_exists': 'An account with this email already exists using a different authentication method.',
        'authentication-failed': 'Authentication failed. Please try again.',
        'authentication-error': 'An error occurred during authentication.',
        'no-token': 'No authentication token was provided.',
      };
      setError(errorMessages[errorParam] || 'An error occurred. Please try again.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleGoogleLogin = () => {
    window.location.href = 'http://chat.bixpod.com/api/auth/login?provider=google';
  };

  const handleAppleLogin = () => {
    window.location.href = 'http://chat.bixpod.com/api/auth/login?provider=apple';
  };

  const handleMicrosoftLogin = () => {
    window.location.href = 'http://chat.bixpod.com/api/auth/login?provider=microsoft';
  };

  const handleEmailContinue = () => {
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setShowPasswordForm(true);
  };

  const handleAuthSubmit = async () => {
    setError('');
    setLoading(true);

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (isSignupMode && (!name || name.length < 1)) {
      setError('Name is required for signup');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isSignupMode ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignupMode
        ? { name, email, password }
        : { email, password };

      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && isSignupMode) {
          setError('Email already registered. Try logging in instead.');
        } else if (response.status === 401) {
          setError('Invalid email or password');
        } else if (response.status === 422) {
          setError('Invalid email format or password too short');
        } else {
          setError(data.detail || 'Authentication failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      if (data.access_token) {
        const loginSuccess = await login(data.access_token);

        if (loginSuccess) {
          // Small delay to ensure auth state propagates before navigation
          setTimeout(() => {
            router.push('/');
          }, 100);
        } else {
          setError('Token verification failed. Please try again.');
        }
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowPasswordForm(false);
    setPassword('');
    setName('');
    setError('');
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <button className="close-button" aria-label="Close" onClick={() => window.history.back()}>
          ✕
        </button>

        <h1 className="modal-title">
          {showPasswordForm ? (isSignupMode ? 'Sign up' : 'Log in') : 'Log in or sign up'}
        </h1>
        <p className="modal-subtitle">
          You&apos;ll build anything with minimum experience.
        </p>

        {error && (
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
              <div style={{ flex: 1 }}>{error}</div>
            </div>
          </div>
        )}

        {!showPasswordForm ? (
          <>
            <div className="oauth-buttons">
              <button onClick={handleGoogleLogin} className="oauth-btn google-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button onClick={handleAppleLogin} className="oauth-btn apple-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>

              <button onClick={handleMicrosoftLogin} className="oauth-btn microsoft-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#f25022" d="M11.4 11.4H2.2V2.2h9.2z"/>
                  <path fill="#00a4ef" d="M21.8 11.4h-9.2V2.2h9.2z"/>
                  <path fill="#7fba00" d="M11.4 21.8H2.2v-9.2h9.2z"/>
                  <path fill="#ffb900" d="M21.8 21.8h-9.2v-9.2h9.2z"/>
                </svg>
                Continue with Microsoft
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="email-form">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmailContinue()}
                className="email-input"
              />
              <button onClick={handleEmailContinue} className="continue-btn">
                Continue
              </button>
            </div>
          </>
        ) : (
          <div className="email-form">
            <div className="email-display">
              <span>{email}</span>
              <button onClick={resetForm} className="change-email-btn">
                Change
              </button>
            </div>

            {isSignupMode && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="email-input"
              />
            )}

            <input
              type="password"
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuthSubmit()}
              className="email-input"
            />

            <button
              onClick={handleAuthSubmit}
              className="continue-btn"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isSignupMode ? 'Sign up' : 'Log in')}
            </button>

            <div className="auth-mode-switch">
              {isSignupMode ? (
                <p>
                  Already have an account?{' '}
                  <button onClick={() => setIsSignupMode(false)} className="link-btn">
                    Log in
                  </button>
                </p>
              ) : (
                <p>
                  Don&apos;t have an account?{' '}
                  <button onClick={() => setIsSignupMode(true)} className="link-btn">
                    Sign up
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;