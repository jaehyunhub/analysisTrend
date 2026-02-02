'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. URL에서 accessToken 꺼내기
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      // 2. 브라우저 저장소(LocalStorage)에 저장
      localStorage.setItem('accessToken', accessToken);
      
      // (선택) 쿠키에 있는 refreshToken은 브라우저가 알아서 저장했음

      alert('로그인 성공! 토큰이 저장되었습니다.');
      
      // 3. 메인 페이지로 이동
      router.push('/'); 
    } else {
      alert('로그인 실패: 토큰이 없습니다.');
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-xl font-bold">로그인 처리 중입니다...</div>
    </div>
  );
}