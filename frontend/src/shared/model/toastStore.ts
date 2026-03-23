import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

interface ToastActions {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

let _idCounter = 0;
const generateId = () => `toast-${++_idCounter}-${Math.random().toString(36).slice(2, 7)}`;

const scheduleRemoval = (id: string, duration: number, set: (fn: (s: ToastState) => Partial<ToastState>) => void) => {
  setTimeout(() => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  }, duration);
};

export const useToastStore = create<ToastState & ToastActions>((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3000) => {
    const id = generateId();
    set((state) => ({ toasts: [...state.toasts, { id, message, type, duration }] }));
    scheduleRemoval(id, duration, set);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  success: (message) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'success' as ToastType, duration: 3000 }],
    }));
    scheduleRemoval(id, 3000, set);
  },

  error: (message) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'error' as ToastType, duration: 4000 }],
    }));
    scheduleRemoval(id, 4000, set);
  },

  info: (message) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'info' as ToastType, duration: 3000 }],
    }));
    scheduleRemoval(id, 3000, set);
  },

  warning: (message) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'warning' as ToastType, duration: 3000 }],
    }));
    scheduleRemoval(id, 3000, set);
  },
}));
