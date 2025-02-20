'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAccessToken } from '@/lib/spotify';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      getAccessToken(code)
        .then(data => {
          // Token im localStorage speichern
          localStorage.setItem('spotify_access_token', data.access_token);
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
          router.push('/');
        })
        .catch(error => {
          console.error('Auth error:', error);
          router.push('/?error=auth_failed');
        });
    }
  }, [searchParams, router]);

  return (
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500" />
  );
}

export default function Callback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Suspense fallback={
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500" />
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
} 