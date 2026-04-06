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
  constructor(
    private readonly baseURL: string,
    private readonly defaultToken?: string,
  ) {}

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.defaultToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.defaultToken}`;
    }
    const res = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers,
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
      headers: { Authorization: `Bearer ${token}`, ...(options.headers as Record<string, string>) },
    });
  }

  // ────────────────────────────────────────────────────────
  // 커뮤니티 게시글
  // ────────────────────────────────────────────────────────

  /** 테스트용 게시글 생성 */
  async createPost(token: string, payload: { title: string; content: string; communityId: number }) {
    return this.authFetch<{ data: { id: number } }>('/api/v1/posts', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /** 테스트용 게시글 삭제 */
  async deletePost(token: string, postId: number) {
    return this.authFetch(`/api/v1/posts/${postId}`, token, { method: 'DELETE' });
  }

  /** 커뮤니티 목록 조회 */
  async getCommunities(): Promise<{ data: Array<{ id: number; name: string; slug: string }> }> {
    return this.fetch('/api/v1/communities');
  }

  /** 게시글 목록 조회 */
  async getPosts(page = 0, size = 10): Promise<{ data: { content: Array<{ id: number; title: string }> } }> {
    return this.fetch(`/api/v1/posts?page=${page}&size=${size}`);
  }

  // ────────────────────────────────────────────────────────
  // 관리자 — 배너
  // ────────────────────────────────────────────────────────

  /** 배너 생성 (ADMIN) */
  async createBanner(payload: { title: string; subtitle?: string; imageUrl: string; linkUrl: string; displayOrder?: number; active?: boolean }) {
    return this.fetch<{ data: { id: number } }>('/api/v1/admin/banners', {
      method: 'POST',
      body: JSON.stringify({ active: true, displayOrder: 1, ...payload }),
    });
  }

  /** 배너 수정 (ADMIN) */
  async updateBanner(bannerId: number, payload: Partial<{ title: string; subtitle: string; imageUrl: string; linkUrl: string; displayOrder: number; active: boolean }>) {
    return this.fetch<{ data: { id: number } }>(`/api/v1/admin/banners/${bannerId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /** 배너 삭제 (ADMIN) */
  async deleteBanner(bannerId: number) {
    return this.fetch(`/api/v1/admin/banners/${bannerId}`, { method: 'DELETE' });
  }

  /** 배너 목록 조회 */
  async getBanners(): Promise<{ data: Array<{ id: number; title: string; active: boolean }> }> {
    return this.fetch('/api/v1/banners');
  }

  // ────────────────────────────────────────────────────────
  // 관리자 — 방송 일정
  // ────────────────────────────────────────────────────────

  /** 스케줄 생성 (ADMIN) */
  async createSchedule(payload: { title: string; date: string; type?: string; description?: string }) {
    return this.fetch<{ data: { id: number } }>('/api/v1/admin/schedules', {
      method: 'POST',
      body: JSON.stringify({ type: 'REGULAR', description: '', ...payload }),
    });
  }

  /** 스케줄 수정 (ADMIN) */
  async updateSchedule(scheduleId: number, payload: Partial<{ title: string; date: string; type: string; description: string }>) {
    return this.fetch<{ data: { id: number } }>(`/api/v1/admin/schedules/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /** 스케줄 삭제 (ADMIN) */
  async deleteSchedule(scheduleId: number) {
    return this.fetch(`/api/v1/admin/schedules/${scheduleId}`, { method: 'DELETE' });
  }

  /** 스케줄 목록 조회 */
  async getSchedules(year?: number, month?: number): Promise<{ data: Array<{ id: number; title: string }> }> {
    const params = year && month ? `?year=${year}&month=${month}` : '';
    return this.fetch(`/api/v1/schedules${params}`);
  }

  // ────────────────────────────────────────────────────────
  // 관리자 — YouTube
  // ────────────────────────────────────────────────────────

  /** YouTube 영상 생성 (ADMIN) */
  async createYoutube(payload: { title: string; videoId: string; description?: string }) {
    return this.fetch<{ data: { id: number } }>('/api/v1/admin/youtube', {
      method: 'POST',
      body: JSON.stringify({ description: '', ...payload }),
    });
  }

  /** YouTube 영상 수정 (ADMIN) */
  async updateYoutube(videoId: number, payload: Partial<{ title: string; videoId: string; description: string }>) {
    return this.fetch<{ data: { id: number } }>(`/api/v1/admin/youtube/${videoId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /** YouTube 영상 삭제 (ADMIN) */
  async deleteYoutube(videoId: number) {
    return this.fetch(`/api/v1/admin/youtube/${videoId}`, { method: 'DELETE' });
  }

  /** YouTube 목록 조회 */
  async getYoutube(): Promise<{ data: Array<{ id: number; title: string; videoId: string }> }> {
    return this.fetch('/api/v1/youtube');
  }

  // ────────────────────────────────────────────────────────
  // 관리자 — 상품
  // ────────────────────────────────────────────────────────

  /** 상품 생성 (ADMIN) */
  async createProduct(payload: { name: string; price: number; category: string; description?: string; imageUrl?: string }) {
    return this.fetch<{ data: { id: number } }>('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: 'https://placehold.co/400x400/png',
        description: '',
        ...payload,
      }),
    });
  }

  /** 상품 수정 (ADMIN) */
  async updateProduct(productId: number, payload: Partial<{ name: string; price: number; category: string; description: string; imageUrl: string; isSoldOut: boolean }>) {
    return this.fetch<{ data: { id: number } }>(`/api/v1/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /** 상품 삭제 (ADMIN) */
  async deleteProduct(productId: number) {
    return this.fetch(`/api/v1/admin/products/${productId}`, { method: 'DELETE' });
  }

  /** 품절 토글 (ADMIN) — 호출마다 is_sold_out을 반전시킵니다 */
  async toggleSoldOut(productId: number, _soldOut?: boolean) {
    return this.fetch(`/api/v1/admin/products/${productId}/sold-out`, {
      method: 'PATCH',
    });
  }

  /** 상품 목록 조회 */
  async getProducts(category?: string): Promise<{ data: { content: Array<{ id: number; name: string; price: number; soldOut: boolean; category: string }> } }> {
    const params = category ? `?category=${category}` : '';
    return this.fetch(`/api/v1/products${params}`);
  }

  // ────────────────────────────────────────────────────────
  // 유틸
  // ────────────────────────────────────────────────────────

  /** 현재 로그인 사용자 정보 */
  async getMe(token: string): Promise<{ data: { id: number; email: string; nickname: string; role: string } }> {
    return this.authFetch('/api/v1/auth/me', token);
  }
}
