'use client';

import '../auth/auth.css';

const LoginPage = () => {
  const handleLogin = () => {
    // Redirect to the backend OAuth endpoint
    window.location.href = 'http://127.0.0.1:8000/api/auth/login';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Sign In</h1>
        <button onClick={handleLogin} className="oauth-button">
          Sign in with OAuth
        </button>
      </div>
    </div>
  );
};

export default LoginPage;