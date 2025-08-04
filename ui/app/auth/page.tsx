import { Suspense } from 'react';
import AuthCallback from '@/components/AuthCallback';

const AuthCallbackPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallback />
    </Suspense>
  );
};

export default AuthCallbackPage;