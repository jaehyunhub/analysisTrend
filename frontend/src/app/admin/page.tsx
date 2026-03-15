'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  const sections = [
    {
      title: '메인 배너',
      description: '홈 상단 히어로 배너 이미지, 텍스트, 링크를 관리합니다.',
      href: '/admin/banner',
      color: 'from-blue-500 to-indigo-600',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: '방송 일정 · 공지',
      description: '방송 일정, 날짜, 주제, 공지사항을 업데이트합니다.',
      href: '/admin/schedule',
      color: 'from-purple-500 to-pink-600',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: '광고 슬롯 관리',
      description: '사이드바 및 배너 광고 영역을 관리합니다.',
      href: '/admin/ads',
      color: 'from-green-500 to-emerald-600',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    },
    {
      title: '유튜브 영상 관리',
      description: '홈에 노출할 유튜브 영상 링크, 썸네일, 설명을 관리합니다.',
      href: '/admin/youtube',
      color: 'from-red-500 to-orange-600',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: '채널 분석',
      description: '구독자 증감, 조회수, 최고 퍼포밍 영상 분석 데이터를 확인합니다.',
      href: '/admin/analysis',
      color: 'from-purple-600 to-indigo-600',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: '커뮤니티 관리',
      description: '회원 관리, 신고 처리, 게시물 강제 삭제를 수행합니다.',
      href: '/admin/community/members',
      color: 'from-orange-500 to-red-600',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const STATS = [
    { label: '오늘 방문자', value: '1,284', trend: '+12%', up: true },
    { label: '신규 회원', value: '47', trend: '+5명', up: true },
    { label: '새 게시물', value: '23', trend: '+3', up: true },
    { label: '미처리 신고', value: '2', trend: '즉시 확인', up: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">대시보드</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">AnalysisTrend 관리자 콘솔에 오신 것을 환영합니다.</p>
        </div>
        <span className="text-sm text-gray-400">2026년 3월 15일</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-[#1A1A1B] p-5 rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm">
            <p className="text-xs text-gray-400 mb-1 font-medium">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            <p className={`text-xs font-semibold mt-1 ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="group flex items-start gap-4 p-5 bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} shadow-md shrink-0`}>
              {section.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {section.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm leading-snug">
                {section.description}
              </p>
            </div>
            <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
