'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/shared/model/authStore';
import { useToastStore } from '@/shared/model/toastStore';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenProcessed = useRef(false);
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (tokenProcessed.current) return;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    // 레거시 파라미터 호환
    const legacyToken = searchParams.get('token');
    const error = searchParams.get('error');

    const resolvedToken = accessToken || legacyToken;

    if (resolvedToken) {
      tokenProcessed.current = true;

      const user = {
        id: 0,
        email: '',
        nickname: '소셜 사용자',
        role: 'USER' as const,
        provider: 'GOOGLE' as const,
        createdAt: new Date().toISOString(),
      };

      login(user, resolvedToken, refreshToken ?? undefined);
      window.dispatchEvent(new Event('auth-change'));

      setTimeout(() => {
        router.push('/');
      }, 100);
    } else if (error) {
      addToast('로그인에 실패했습니다: ' + error, 'error');
      router.push('/');
    } else {
      addToast('인증 정보를 찾을 수 없습니다.', 'error');
      router.push('/');
    }
  }, [searchParams, router, login, addToast]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">로그인 처리 중...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">로딩 중...</div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
