'use client';

import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Nickname
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const BACKEND_URL = "http://localhost:8080"; 
  const LOGIN_URLS = {
     google: `${BACKEND_URL}/oauth2/authorization/google`,
     kakao:  `${BACKEND_URL}/oauth2/authorization/kakao`,
     naver:  `${BACKEND_URL}/oauth2/authorization/naver`
  };

  if (!isOpen) return null;

  // Validation Logic
  const validateSignup = () => {
      // Email Regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          setError("Invalid email format.");
          return false;
      }
      
      // Username/Nickname length
      if (username.length < 2 || username.length > 10) {
          setError("Username must be between 2 and 10 characters.");
          return false;
      }

      // Password Policy (Example: Min 8 chars, at least one number)
      // "포함되지 않는 글자 체크" requirements could be specific, but implementing standard safe chars here.
      if (password.length < 8) {
          setError("Password must be at least 8 characters.");
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
              setSuccess("Signup successful! Please log in.");
              setAuthView('login');
              // Clear sensitive fields
              setPassword('');
          } else {
              const text = await res.text();
              setError(text || "Signup failed");
          }
      } catch (err) {
          setError("Network error occurred.");
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
              const token = await res.text(); // Backend returns string token
              localStorage.setItem('accessToken', token);
              // Trigger a page reload or state update to reflect login
              window.location.reload(); 
              onClose();
          } else {
              setError("Invalid email or password.");
          }
      } catch (err) {
          setError("Login failed. Please try again.");
      }
  };

  // Reset state when switching views
  const switchView = (view: 'login' | 'signup') => {
      setAuthView(view);
      setError('');
      setSuccess('');
      setEmail('');
      setPassword('');
      setUsername('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
        <div className="relative w-full max-w-sm rounded-[20px] bg-white p-10 shadow-xl dark:bg-[#1A1A1B]" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-full">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                
                <div className="flex flex-col items-start gap-2 mb-8">
                    <h1 className="text-2xl font-medium dark:text-[#D7DADC]">{authView === 'login' ? 'Log in' : 'Sign up'}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">By continuing, you agree to our User Agreement and Privacy Policy.</p>
                </div>

                {/* Error/Success Messages */}
                {error && <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded border border-red-200">{error}</div>}
                {success && <div className="mb-4 p-2 text-sm text-green-600 bg-green-50 rounded border border-green-200">{success}</div>}
                
                <div className="flex flex-col gap-3 w-full">

                    {/* Local Login Inputs */}
                    {authView === 'login' && (
                       <form className="flex flex-col gap-3" onSubmit={handleLogin}>
                           <input 
                               type="text" 
                               placeholder="Email" 
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               className="w-full h-[40px] px-4 rounded border border-gray-200 dark:border-[#343536] bg-[#F6F7F8] dark:bg-[#272729] text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white dark:focus:bg-[#1A1A1B] dark:text-white transition-colors"
                           />
                           <input 
                               type="password" 
                               placeholder="Password" 
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               className="w-full h-[40px] px-4 rounded border border-gray-200 dark:border-[#343536] bg-[#F6F7F8] dark:bg-[#272729] text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white dark:focus:bg-[#1A1A1B] dark:text-white transition-colors"
                           />
                           <button 
                               type="submit" 
                               className="w-full h-[40px] rounded-full bg-[#D93A00] hover:bg-[#C13200] text-white font-bold text-sm transition-colors"
                           >
                               Log In
                           </button>
                       </form>
                    )}

                    {authView === 'login' ? (
                        <>            
                        <div className="flex items-center gap-2 my-2">
                        <div className="h-[1px] bg-gray-200 dark:bg-[#343536] flex-1"></div>
                        <span className="text-xs text-gray-400 font-bold uppercase">OR</span>
                        <div className="h-[1px] bg-gray-200 dark:bg-[#343536] flex-1"></div>
                    </div>
                        {/* Social Logins */}
                    <a href={LOGIN_URLS.google} className="relative flex items-center justify-center w-full h-[40px] rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-[14px] font-medium transition-colors">
                        <span className="absolute left-4 flex items-center">
                            <svg viewBox="0 0 24 24" className="w-5 h-5">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        </span>
                        Continue with Google
                    </a>

                    <a href={LOGIN_URLS.kakao} className="relative flex items-center justify-center w-full h-[40px] rounded border border-transparent bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] text-[14px] font-medium transition-colors">
                        <span className="absolute left-4">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M12 3C5.9 3 1 6.9 1 11.8c0 3.2 2.1 6 5.4 7.6-.1.6-.4 2.1-.4 2.2 0 .2 0 .4.3.5.1 0 .2.1.3.1.2 0 .4-.1.6-.2.4-.3 3.8-2.6 4.3-3 .2 0 .5.1.8.1 6.1 0 11-3.9 11-8.8C23 6.9 18.1 3 12 3z"/>
                            </svg>
                        </span>
                        Continue with Kakao
                    </a>

                    <a href={LOGIN_URLS.naver} className="relative flex items-center justify-center w-full h-[40px] rounded border border-transparent bg-[#03C75A] hover:bg-[#02B350] text-white text-[14px] font-medium transition-colors">
                        <span className="absolute left-4">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M16.273 12.845L7.376 0H0v24h7.727v-12.845l8.896 12.845H24V0h-7.727v12.845z"/>
                            </svg>
                        </span>
                        Continue with Naver
                    </a>
                        <div className="mt-2 text-center text-xs text-[#1A1A1B] dark:text-[#D7DADC]">
                            New to Trendit? 
                            <button 
                                onClick={() => switchView('signup')} 
                                className="ml-1 text-[#0079D3] font-bold hover:underline"
                            >
                                Sign Up
                            </button>
                        </div>
                        </>
                    ) : (
                        <>
                        {/* Sign Up Inputs */}
                        <form className="flex flex-col gap-3" onSubmit={handleSignup}>
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-[40px] px-4 rounded border border-gray-200 dark:border-[#343536] bg-[#F6F7F8] dark:bg-[#272729] text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white dark:focus:bg-[#1A1A1B] dark:text-white transition-colors"
                            />
                            <input 
                                type="text" 
                                placeholder="Username (2-10 chars)" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full h-[40px] px-4 rounded border border-gray-200 dark:border-[#343536] bg-[#F6F7F8] dark:bg-[#272729] text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white dark:focus:bg-[#1A1A1B] dark:text-white transition-colors"
                            />
                            <input 
                                type="password" 
                                placeholder="Password (Min 8 chars)" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-[40px] px-4 rounded border border-gray-200 dark:border-[#343536] bg-[#F6F7F8] dark:bg-[#272729] text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white dark:focus:bg-[#1A1A1B] dark:text-white transition-colors"
                            />
                            <button 
                                type="submit" 
                                className="w-full h-[40px] rounded-full bg-[#0079D3] hover:bg-[#006CBB] text-white font-bold text-sm transition-colors"
                            >
                                Sign Up
                            </button>
                        </form>
                        <div className="mt-2 text-center text-xs text-[#1A1A1B] dark:text-[#D7DADC]">
                            Already a trenditor? 
                            <button 
                                onClick={() => switchView('login')} 
                                className="ml-1 text-[#0079D3] font-bold hover:underline"
                            >
                                Log In
                            </button>
                        </div>
                        </>
                    )}
            </div>
        </div>
        </div>
  );
}
