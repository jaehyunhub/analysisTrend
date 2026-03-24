/**
 * E2E 테스트용 API 헬퍼
 * 브라우저 없이 백엔드 API를 직접 호출해 테스트 데이터를 준비/정리합니다.
 */

interface UserPayload {
  email: string;
  password: string;
  nickname: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export class ApiHelper {
  constructor(private readonly baseURL: string) {}

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API ${path} failed (${res.status}): ${body}`);
    }
    return res.json() as Promise<T>;
  }

  /** 테스트용 일반 사용자 생성 (이미 존재하면 무시) */
  async ensureUserExists(payload: UserPayload): Promise<void> {
    try {
      await this.fetch('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // 이미 존재하는 경우 무시
    }
  }

  /** 테스트용 관리자 계정 생성 (이미 존재하면 무시)
   * 주의: signup API는 항상 USER role로 생성합니다.
   * ADMIN role 부여는 global-setup.ts에서 db.ts의 setAdminRole()로 처리합니다.
   */
  async ensureAdminExists(payload: UserPayload): Promise<void> {
    try {
      await this.fetch('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // 이미 존재하는 경우 무시
    }
  }

  /** 로그인 후 토큰 반환 */
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await this.fetch<{ data: LoginResponse }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res.data;
  }

  /** 인증 헤더 포함 요청 */
  async authFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...options.headers },
    });
  }

  /** 테스트용 게시글 생성 */
  async createPost(token: string, payload: { title: string; content: string; communityId: number }) {
    return this.authFetch('/api/v1/posts', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /** 테스트용 게시글 삭제 */
  async deletePost(token: string, postId: number) {
    return this.authFetch(`/api/v1/posts/${postId}`, token, { method: 'DELETE' });
  }
}
