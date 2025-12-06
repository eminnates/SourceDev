'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { confirmEmail } from '@/utils/api/authApi';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      const userId = searchParams.get('userId');
      const token = searchParams.get('token');

      if (!userId || !token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const result = await confirmEmail(userId, token);
        if (result.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified!');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Verification failed.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred.');
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
      {status === 'verifying' && (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Verifying Email</h2>
          <p className="text-brand-muted">{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Email Verified!</h2>
          <p className="text-brand-muted mb-6">{message}</p>
          <p className="text-sm text-brand-muted">Redirecting to login...</p>
          <Link href="/login" className="inline-block mt-4 px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark transition-colors">
            Go to Login
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Verification Failed</h2>
          <p className="text-brand-muted mb-6">{message}</p>
          <Link href="/login" className="inline-block px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark transition-colors">
            Back to Login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
