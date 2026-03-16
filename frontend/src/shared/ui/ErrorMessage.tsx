import * as React from "react"
import { cn } from "@/shared/lib/utils"

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  onRetry?: () => void
}

const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ className, message, onRetry, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-6 py-5 text-center",
          className
        )}
        {...props}
      >
        {/* 에러 아이콘 */}
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
          <svg
            className="h-5 w-5 text-red-500 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </span>

        {/* 메시지 */}
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          {message}
        </p>

        {/* 재시도 버튼 (선택) */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors"
          >
            다시 시도
          </button>
        )}
      </div>
    )
  }
)
ErrorMessage.displayName = "ErrorMessage"

export { ErrorMessage }
