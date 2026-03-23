'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { LoginModal } from '@/features/auth/ui/LoginModal';
import { useThemeStore } from '@/shared/model/themeStore';
import { useAuthStore } from '@/shared/model/authStore';
import { useCartStore } from '@/shared/model/cartStore';

const NAV_LINKS = [
  { href: '/community', label: '커뮤니티' },
  { href: '/shop', label: '쇼핑' },
  { href: '/magazine', label: '매거진' },
  { href: '/about', label: '소개' },
];

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();

  const avatarInitial = user?.nickname?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?';
  const displayName = user?.nickname ?? user?.email ?? '';

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#1A1A1B]/95 backdrop-blur-sm border-b border-gray-200 dark:border-[#343536] px-4 h-[52px] flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 lg:w-[220px]">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:shadow-md transition-shadow">
              A
            </div>
            <span className="hidden text-lg font-black lg:block tracking-tight text-gray-900 dark:text-white">
              AnalysisTrend
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center gap-1 mx-4">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#272729]'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 lg:w-[220px] justify-end">
          <Link
            href="/admin"
            className="hidden md:flex items-center justify-center h-8 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272729] text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors"
          >
            관리자
          </Link>
          <Link
            href="/mypage"
            className="hidden md:flex items-center justify-center h-8 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272729] text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors"
          >
            마이페이지
          </Link>

          {/* Cart link */}
          <Link
            href="/shop/cart"
            aria-label="장바구니"
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {items.length > 9 ? '9+' : items.length}
              </span>
            )}
          </Link>

          {/* 다크모드 토글 */}
          <button
            onClick={toggleTheme}
            className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272729] text-gray-500 dark:text-gray-400 transition-colors"
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2 ml-1">
              <div
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-bold select-none"
                title={displayName}
              >
                {avatarInitial}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[80px] truncate">
                {displayName}
              </span>
              <button
                onClick={logout}
                className="flex items-center justify-center rounded-lg border border-gray-300 dark:border-[#343536] hover:bg-gray-100 dark:hover:bg-[#272729] px-3 h-8 text-sm font-semibold text-gray-600 dark:text-gray-300 transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden md:flex ml-1 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 px-5 h-8 text-sm font-semibold text-white transition-colors shadow-sm"
            >
              로그인
            </button>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg transition-colors"
            aria-label="메뉴 열기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white dark:bg-[#1A1A1B] z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#343536]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-sm">
              A
            </div>
            <span className="font-black text-gray-900 dark:text-white">AnalysisTrend</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg transition-colors"
            aria-label="메뉴 닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729]'
                }`}
              >
                {label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-gray-100 dark:border-[#343536] mt-3 space-y-1">
            <Link
              href="/mypage"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors"
            >
              마이페이지
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors"
            >
              관리자
            </Link>
          </div>
        </nav>

        {/* Login / User Button */}
        <div className="p-4 border-t border-gray-200 dark:border-[#343536]">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-2">
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-bold shrink-0">
                  {avatarInitial}
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {displayName}
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center rounded-xl border border-gray-300 dark:border-[#343536] hover:bg-gray-100 dark:hover:bg-[#272729] py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsLoginModalOpen(true);
              }}
              className="w-full flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white transition-colors shadow-sm"
            >
              로그인
            </button>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
    </>
  );
}
