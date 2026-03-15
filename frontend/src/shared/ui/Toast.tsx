'use client';

import { useToastStore } from '../model/toastStore';

const toastColors: Record<string, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

const toastIcons: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${toastColors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-[400px] pointer-events-auto animate-in slide-in-from-right duration-300`}
        >
          <span className="text-base font-bold leading-none shrink-0">
            {toastIcons[toast.type]}
          </span>
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white text-xl leading-none shrink-0 transition-colors"
            aria-label="알림 닫기"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
