export type ContentBlock =
  | { type: 'text'; value: string }
  | { type: 'image'; url: string }

export interface Magazine {
  id: number
  title: string
  summary: string
  thumbnail: string
  category: string
  author: string
  readTime: string
  publishedAt: string
  blocks?: ContentBlock[]
  sourceUrl?: string
  // 레거시 필드 (기존 mock 데이터 호환)
  content?: string
  images?: string[]
}
