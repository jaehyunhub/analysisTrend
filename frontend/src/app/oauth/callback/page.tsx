'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenProcessed = useRef(false);

  useEffect(() => {
    if (tokenProcessed.current) return;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      tokenProcessed.current = true;
      localStorage.setItem('accessToken', token);
      document.cookie = `accessToken=${token}; path=/; max-age=3600; samesite=strict`;
      // Dispatch a custom event to notify other components (like LoginModal)
      window.dispatchEvent(new Event('auth-change'));
      
      setTimeout(() => {
         router.push('/');
      }, 100);
    } else if (error) {
      console.error('OAuth Error:', error);
      alert('Login failed: ' + error);
      router.push('/');
    }
  }, [searchParams, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Login...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}