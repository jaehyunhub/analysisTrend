import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-[#0d0d0f] dark:via-[#1A1A1B] dark:to-[#1a1a2e] flex flex-col items-center justify-center px-4">
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:shadow-lg transition-shadow">
            A
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
            AnalysisTrend
          </span>
        </Link>

        {/* 404 숫자 */}
        <div className="relative mb-6">
          <p className="text-[120px] font-black leading-none tracking-tighter bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent select-none">
            404
          </p>
          <div className="absolute inset-0 text-[120px] font-black leading-none tracking-tighter text-violet-200 dark:text-violet-900/30 blur-sm select-none -z-10">
            404
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          <br />
          아래 링크를 통해 원하시는 페이지로 이동해 보세요.
        </p>

        {/* 홈으로 버튼 */}
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-8 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all mb-6"
        >
          홈으로 돌아가기
        </Link>

        {/* 바로가기 링크 */}
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/community"
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            커뮤니티
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            쇼핑
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link
            href="/magazine"
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            매거진
          </Link>
        </div>
      </div>
    </div>
  )
}
