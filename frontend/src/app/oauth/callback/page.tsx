'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/shared/model/authStore';
import { useToastStore } from '@/shared/model/toastStore';
import type { User } from '@/shared/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function fetchCurrentUser(accessToken: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data ?? json;
    return {
      id: data.id ?? 0,
      email: data.email ?? '',
      nickname: data.nickname ?? '사용자',
      role: data.role ?? 'USER',
      provider: data.provider ?? 'GOOGLE',
      createdAt: data.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

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
    const legacyToken = searchParams.get('token');
    const error = searchParams.get('error');

    const resolvedToken = accessToken || legacyToken;

    if (resolvedToken) {
      tokenProcessed.current = true;

      fetchCurrentUser(resolvedToken).then((user) => {
        const fallbackUser: User = {
          id: 0,
          email: '',
          nickname: '소셜 사용자',
          role: 'USER',
          provider: 'GOOGLE',
          createdAt: new Date().toISOString(),
        };
        login(user ?? fallbackUser, resolvedToken, refreshToken ?? undefined);
        window.dispatchEvent(new Event('auth-change'));
        router.push('/');
      });
    } else if (error) {
      addToast('소셜 로그인 설정이 완료되지 않았습니다. 이메일 로그인을 이용해주세요.', 'error');
      setTimeout(() => router.replace('/'), 2000);
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
