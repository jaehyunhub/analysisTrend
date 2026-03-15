const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (!skipAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

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

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: 'DELETE' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청에 실패했습니다.' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data;
}
