'use client'

import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서 Sentry 등 연동 가능)
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-[#0d0d0f] dark:via-[#1A1A1B] dark:to-[#1a1a2e] flex flex-col items-center justify-center px-4">
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* 에러 아이콘 */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 shadow-inner">
          <svg
            className="h-10 w-10 text-violet-600 dark:text-violet-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          오류가 발생했습니다
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
          예상치 못한 문제가 발생했습니다.
          <br />
          잠시 후 다시 시도하거나, 문제가 지속되면 관리자에게 문의해 주세요.
        </p>

        {/* 에러 digest (디버깅용, 개발 환경) */}
        {error.digest && (
          <p className="mb-6 text-xs text-gray-400 dark:text-gray-600 font-mono bg-gray-100 dark:bg-[#272729] rounded-lg px-3 py-1.5">
            오류 코드: {error.digest}
          </p>
        )}

        {/* 버튼 그룹 */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-8 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            다시 시도
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-[#343536] bg-white dark:bg-[#272729] hover:bg-gray-50 dark:hover:bg-[#343536] px-8 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors"
          >
            홈으로
          </a>
        </div>
      </div>
    </div>
  )
}
