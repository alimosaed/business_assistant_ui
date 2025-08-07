'use client';

import '../auth/auth.css';
import Image from 'next/image';
import logoImage from '@/components/assets/logo.jpg';

const LoginPage = () => {
  const handleLogin = () => {
    // Redirect to the backend OAuth endpoint
    window.location.href = 'http://127.0.0.1:8000/api/auth/login';
  };

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
        <h1 className="login-title">Sign In</h1>
        <button onClick={handleLogin} className="oauth-button">
          Sign in with OAuth
        </button>
      </div>
    </div>
  );
};

export default LoginPage;