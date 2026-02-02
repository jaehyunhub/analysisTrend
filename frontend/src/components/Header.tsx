'use client';
import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { LoginModal } from './LoginModal';

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#1A1A1B] border-b border-gray-200 dark:border-[#343536] px-4 h-[49px] flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 lg:w-[200px]">
         <Link href="/" className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
             <span className="text-white text-lg">A</span>
           </div>
           <span className="hidden text-xl font-bold lg:block tracking-tighter text-[#1A1A1B] dark:text-[#D7DADC]">AnalysisTrend</span>
         </Link>
      </div>

      {/* Center: Navigation */}
      <nav className="hidden md:flex flex-1 justify-center gap-8 mx-4">
        <Link href="/community" className="font-bold text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">Community</Link>
        <Link href="#" className="font-bold text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">Shop</Link>
        <Link href="#" className="font-bold text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">Magazine</Link>
        <Link href="#" className="font-bold text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">About</Link>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:w-[200px] justify-end">
          <Link href="/admin" className="hidden md:flex items-center justify-center h-8 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#272729] text-gray-700 dark:text-gray-300 text-sm font-bold">
             Admin
          </Link>
          
          <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden md:flex ml-2 items-center justify-center rounded-full bg-[#D93A00] hover:bg-[#C13200] px-6 h-8 text-sm font-bold text-white transition-colors"
          >
              Log In
          </button>
      </div>
    </header>

    <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
    />

     <Script 
          src="https://accounts.google.com/gsi/client" 
          strategy="afterInteractive" 
          async 
          defer 
        />
    </>
  );
}
