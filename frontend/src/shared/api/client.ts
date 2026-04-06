import { useToastStore } from '@/shared/model/toastStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const ANALYSIS_BASE_URL = process.env.NEXT_PUBLIC_ANALYSIS_URL || 'http://localhost:8000';

/** authStore는 sessionStorage에 persist (key: auth-storage).
 *  login() 시 sessionStorage.accessToken도 직접 세팅하지만
 *  Zustand hydration(페이지 새로고침/E2E inject) 시에는 auth-storage 블롭만 있으므로
 *  두 경로 모두 확인한다. */
function getStoredToken(key: 'accessToken' | 'refreshToken'): string | null {
  if (typeof window === 'undefined') return null;
  const direct = sessionStorage.getItem(key);
  if (direct) return direct;
  try {
    const blob = sessionStorage.getItem('auth-storage');
    if (blob) return JSON.parse(blob)?.state?.[key] ?? null;
  } catch { /* ignore */ }
  return null;
}

function showErrorToast(message: string): void {
  if (typeof window === 'undefined') return;
  useToastStore.getState().error(message);
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  _isRetry?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getStoredToken('refreshToken');

      if (!refreshToken) return null;

      const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
        }
        return null;
      }

      const json = await res.json();
      const newAccessToken = json.data?.accessToken;
      const newRefreshToken = json.data?.refreshToken;

      if (newAccessToken && typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) sessionStorage.setItem('refreshToken', newRefreshToken);
      }

      return newAccessToken ?? null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, _isRetry = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getStoredToken('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${url}`, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });
  } catch {
    showErrorToast('네트워크 오류가 발생했습니다');
    throw new Error('네트워크 오류가 발생했습니다');
  }

  // 401이고 첫 번째 시도인 경우 토큰 재발급 후 재시도
  if (response.status === 401 && !skipAuth && !_isRetry) {
    const newToken = await attemptTokenRefresh();
    if (newToken) {
      return fetchWithAuth(url, { ...options, _isRetry: true });
    }
    // 재발급 실패 — 로그아웃 처리 (스토어 순환 참조 방지를 위해 이벤트로 처리)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  // 5xx 서버 에러 Toast
  if (response.status >= 500) {
    showErrorToast('서버 오류가 발생했습니다');
  }

  return response;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청에 실패했습니다.' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data;
}

export async function apiPost<T>(url: string, body?: unknown, skipAuth = false): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    skipAuth,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청에 실패했습니다.' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청에 실패했습니다.' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청에 실패했습니다.' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: 'DELETE' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청에 실패했습니다.' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data;
}

// ── Analysis Service (multipart/form-data) ────────────────────────────────────

export async function analysisPostForm<T>(path: string, formData: FormData): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${ANALYSIS_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch {
    showErrorToast('네트워크 오류가 발생했습니다');
    throw new Error('네트워크 오류가 발생했습니다');
  }

  if (response.status >= 500) {
    showErrorToast('서버 오류가 발생했습니다');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '분석 요청에 실패했습니다.' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function analysisGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${ANALYSIS_BASE_URL}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url.toString(), { headers });
  } catch {
    showErrorToast('네트워크 오류가 발생했습니다');
    throw new Error('네트워크 오류가 발생했습니다');
  }

  if (response.status >= 500) {
    showErrorToast('서버 오류가 발생했습니다');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '조회에 실패했습니다.' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}
