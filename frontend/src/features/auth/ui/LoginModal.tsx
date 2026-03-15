'use client';

import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const BACKEND_URL = "http://localhost:8080";
  const LOGIN_URLS = {
     google: `${BACKEND_URL}/oauth2/authorization/google`,
     kakao:  `${BACKEND_URL}/oauth2/authorization/kakao`,
     naver:  `${BACKEND_URL}/oauth2/authorization/naver`
  };

  if (!isOpen) return null;

  const validateSignup = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          setError("올바른 이메일 형식이 아닙니다.");
          return false;
      }
      if (username.length < 2 || username.length > 10) {
          setError("닉네임은 2~10자 사이여야 합니다.");
          return false;
      }
      if (password.length < 8) {
          setError("비밀번호는 최소 8자 이상이어야 합니다.");
          return false;
      }
      return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');

      if (!validateSignup()) return;

      try {
          const res = await fetch(`${BACKEND_URL}/api/v1/auth/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, nickname: username })
          });

          if (res.ok) {
              setSuccess("회원가입이 완료되었습니다! 로그인 해주세요.");
              setAuthView('login');
              setPassword('');
          } else {
              const text = await res.text();
              setError(text || "회원가입에 실패했습니다.");
          }
      } catch {
          setError("네트워크 오류가 발생했습니다.");
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      try {
          const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
          });

          if (res.ok) {
              const token = await res.text();
              localStorage.setItem('accessToken', token);
              window.location.reload();
              onClose();
          } else {
              setError("이메일 또는 비밀번호가 올바르지 않습니다.");
          }
      } catch {
          setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
  };

  const switchView = (view: 'login' | 'signup') => {
      setAuthView(view);
      setError('');
      setSuccess('');
      setEmail('');
      setPassword('');
      setUsername('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-[400px] rounded-2xl bg-white shadow-2xl dark:bg-[#1A1A1B] mx-4" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#343536]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-sm">A</div>
                    <span className="font-black text-gray-900 dark:text-white">AnalysisTrend</span>
                  </div>
                  <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div className="p-6">
                    <div className="mb-5">
                        <h1 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                          {authView === 'login' ? '로그인' : '회원가입'}
                        </h1>
                        <p className="text-xs text-gray-400">계속하면 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.</p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                      <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-400">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-xl border border-green-100 dark:bg-green-900/20 dark:border-green-900/40 dark:text-green-400">
                        {success}
                      </div>
                    )}

                    <div className="flex flex-col gap-3 w-full">
                        {/* Login Form */}
                        {authView === 'login' && (
                           <form className="flex flex-col gap-2.5" onSubmit={handleLogin}>
                               <input
                                   type="text"
                                   placeholder="이메일"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                               />
                               <input
                                   type="password"
                                   placeholder="비밀번호"
                                   value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                               />
                               <button
                                   type="submit"
                                   className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors mt-1 shadow-sm"
                               >
                                   로그인
                               </button>
                           </form>
                        )}

                        {authView === 'login' ? (
                            <>
                            <div className="flex items-center gap-3 my-1">
                              <div className="h-px bg-gray-200 dark:bg-[#343536] flex-1"></div>
                              <span className="text-xs text-gray-400 font-bold">또는</span>
                              <div className="h-px bg-gray-200 dark:bg-[#343536] flex-1"></div>
                            </div>

                            {/* Social Logins */}
                            <a href={LOGIN_URLS.google} className="relative flex items-center justify-center w-full h-11 rounded-xl border border-gray-200 dark:border-[#343536] bg-white dark:bg-[#272729] hover:bg-gray-50 dark:hover:bg-[#343536] text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors">
                                <span className="absolute left-4 flex items-center">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                </span>
                                Google로 계속하기
                            </a>

                            <a href={LOGIN_URLS.kakao} className="relative flex items-center justify-center w-full h-11 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] text-sm font-medium transition-colors">
                                <span className="absolute left-4">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M12 3C5.9 3 1 6.9 1 11.8c0 3.2 2.1 6 5.4 7.6-.1.6-.4 2.1-.4 2.2 0 .2 0 .4.3.5.1 0 .2.1.3.1.2 0 .4-.1.6-.2.4-.3 3.8-2.6 4.3-3 .2 0 .5.1.8.1 6.1 0 11-3.9 11-8.8C23 6.9 18.1 3 12 3z"/>
                                    </svg>
                                </span>
                                카카오로 계속하기
                            </a>

                            <a href={LOGIN_URLS.naver} className="relative flex items-center justify-center w-full h-11 rounded-xl bg-[#03C75A] hover:bg-[#02B350] text-white text-sm font-medium transition-colors">
                                <span className="absolute left-4">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                      <path d="M16.273 12.845L7.376 0H0v24h7.727v-12.845l8.896 12.845H24V0h-7.727v12.845z"/>
                                    </svg>
                                </span>
                                네이버로 계속하기
                            </a>

                            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                AnalysisTrend가 처음이신가요?{' '}
                                <button
                                    onClick={() => switchView('signup')}
                                    className="text-blue-600 font-bold hover:underline"
                                >
                                    회원가입
                                </button>
                            </div>
                            </>
                        ) : (
                            <>
                            {/* Sign Up Form */}
                            <form className="flex flex-col gap-2.5" onSubmit={handleSignup}>
                                <input
                                    type="email"
                                    placeholder="이메일"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="닉네임 (2~10자)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                                />
                                <input
                                    type="password"
                                    placeholder="비밀번호 (최소 8자)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                                />
                                <button
                                    type="submit"
                                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors mt-1 shadow-sm"
                                >
                                    회원가입
                                </button>
                            </form>
                            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                이미 계정이 있으신가요?{' '}
                                <button
                                    onClick={() => switchView('login')}
                                    className="text-blue-600 font-bold hover:underline"
                                >
                                    로그인
                                </button>
                            </div>
                            </>
                        )}
                    </div>
                </div>
        </div>
    </div>
  );
}
