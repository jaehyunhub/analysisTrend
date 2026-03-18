import { Page, Locator } from '@playwright/test';

/**
 * 게시글 상세 모달 Page Object
 * COMM-02: 투표 / COMM-04: 댓글
 */
export class PostDetailModal {
  readonly page: Page;

  readonly modal: Locator;
  readonly upvoteButton: Locator;
  readonly downvoteButton: Locator;
  readonly voteCount: Locator;
  readonly commentInput: Locator;
  readonly commentSubmit: Locator;
  readonly commentList: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByRole('dialog');
    this.upvoteButton = this.modal.getByRole('button', { name: /업보트|upvote|▲/i });
    this.downvoteButton = this.modal.getByRole('button', { name: /다운보트|downvote|▼/i });
    this.voteCount = this.modal.locator('[data-testid="vote-count"]');
    this.commentInput = this.modal.getByPlaceholder(/댓글/);
    this.commentSubmit = this.modal.getByRole('button', { name: /댓글 작성|등록/ });
    this.commentList = this.modal.locator('[data-testid="comment-list"]');
    this.closeButton = this.modal.getByRole('button', { name: /닫기/i });
  }

  async waitForOpen(): Promise<void> {
    await this.modal.waitFor({ state: 'visible' });
  }

  async upvote(): Promise<void> {
    await this.upvoteButton.click();
  }

  async addComment(content: string): Promise<void> {
    await this.commentInput.fill(content);
    await this.commentSubmit.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }
}
