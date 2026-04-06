'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMagazineStore } from '@/shared/model/magazineStore';
import type { Magazine, ContentBlock } from '@/shared/types/magazine';

const CATEGORIES = ['트렌드', '마케팅', '테크', '라이프'];

type BasicForm = {
  title: string;
  summary: string;
  thumbnail: string;
  category: string;
  author: string;
  readTime: string;
  publishedAt: string;
  sourceUrl: string;
};

const EMPTY_FORM: BasicForm = {
  title: '',
  summary: '',
  thumbnail: '',
  category: '트렌드',
  author: '',
  readTime: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  sourceUrl: '',
};

function toBlocks(article: Magazine): ContentBlock[] {
  if (article.blocks && article.blocks.length > 0) return article.blocks;
  const result: ContentBlock[] = [];
  if (article.content) result.push({ type: 'text', value: article.content });
  if (article.images) article.images.forEach((url) => result.push({ type: 'image', url }));
  return result;
}

export default function MagazineManagementPage() {
  const { magazines: articles, upsert, remove } = useMagazineStore();
  const [formOpen, setFormOpen] = useState(false);
  const [formTab, setFormTab] = useState<'basic' | 'content'>('basic');
  const [editTarget, setEditTarget] = useState<Magazine | null>(null);
  const [form, setForm] = useState<BasicForm>(EMPTY_FORM);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  /* ── 열기 ── */
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setBlocks([]);
    setFormTab('basic');
    setFormOpen(true);
  };

  const openEdit = (article: Magazine) => {
    setEditTarget(article);
    setForm({
      title: article.title,
      summary: article.summary,
      thumbnail: article.thumbnail,
      category: article.category,
      author: article.author,
      readTime: article.readTime,
      publishedAt: article.publishedAt,
      sourceUrl: article.sourceUrl ?? '',
    });
    setBlocks(toBlocks(article));
    setFormTab('basic');
    setFormOpen(true);
  };

  /* ── 저장 ── */
  const handleSave = () => {
    if (!form.title.trim() || !form.author.trim()) return;
    const article: Omit<Magazine, 'id'> = {
      ...form,
      blocks,
      // 레거시 필드 제거
      content: undefined,
      images: undefined,
    };
    if (editTarget) {
      upsert({ id: editTarget.id, ...article });
    } else {
      const newId = Math.max(0, ...articles.map((a) => a.id)) + 1;
      upsert({ id: newId, ...article });
    }
    setFormOpen(false);
  };

  const handleDelete = (id: number) => {
    remove(id);
    setDeleteConfirm(null);
  };

  /* ── 블록 조작 ── */
  const addBlock = (type: 'text' | 'image') =>
    setBlocks((b) => [
      ...b,
      type === 'text' ? { type: 'text', value: '' } : { type: 'image', url: '' },
    ]);

  const updateBlock = (i: number, updated: ContentBlock) =>
    setBlocks((b) => b.map((bl, idx) => (idx === i ? updated : bl)));

  const deleteBlock = (i: number) => setBlocks((b) => b.filter((_, idx) => idx !== i));

  const moveBlock = (i: number, dir: -1 | 1) =>
    setBlocks((b) => {
      const next = [...b];
      const j = i + dir;
      if (j < 0 || j >= next.length) return next;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  /* ── 헬퍼 ── */
  const blockCount = (article: Magazine) => {
    if (article.blocks) return article.blocks.length;
    return (article.images?.length ?? 0) + (article.content ? 1 : 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">매거진 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            매거진 아티클을 작성하고 관리합니다.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 아티클 작성
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <div
            key={cat}
            className="bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-[#343536] p-4 text-center"
          >
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {articles.filter((a) => a.category === cat).length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cat}</p>
          </div>
        ))}
      </div>

      {/* Article List */}
      <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#343536]">
          <h3 className="font-bold text-gray-900 dark:text-white">
            아티클 목록 ({articles.length}건)
          </h3>
        </div>
        {articles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">등록된 아티클이 없습니다.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-[#343536]">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors"
              >
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                  {article.thumbnail ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={article.thumbnail}
                        alt={article.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[11px] font-bold shrink-0">
                      {article.category}
                    </span>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {article.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] text-gray-400">
                      {article.author} · {article.publishedAt} · {article.readTime} 읽기
                    </p>
                    {blockCount(article) > 0 && (
                      <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">
                        블록 {blockCount(article)}개
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(article)}
                    className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(article.id)}
                    className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Form Modal ── */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#343536] flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {editTarget ? '아티클 수정' : '새 아티클 작성'}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-[#343536] px-6 shrink-0">
              {(['basic', 'content'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setFormTab(key)}
                  className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
                    formTab === key
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {key === 'basic' ? '기본 정보' : `콘텐츠 편집 (${blocks.length}블록)`}
                </button>
              ))}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {/* ── 기본 정보 탭 ── */}
              {formTab === 'basic' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">제목 *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="아티클 제목"
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">요약</label>
                    <textarea
                      value={form.summary}
                      onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                      placeholder="아티클 요약 (2~3문장)"
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">카테고리</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">읽기 시간</label>
                      <input
                        type="text"
                        value={form.readTime}
                        onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
                        placeholder="예: 8분"
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">작성자 *</label>
                      <input
                        type="text"
                        value={form.author}
                        onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                        placeholder="작성자 이름"
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">발행일</label>
                      <input
                        type="date"
                        value={form.publishedAt}
                        onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">썸네일 URL</label>
                    <input
                      type="text"
                      value={form.thumbnail}
                      onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                      placeholder="https://..."
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    {form.thumbnail && (
                      <div className="mt-2 h-24 rounded-xl overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                        <Image src={form.thumbnail} alt="미리보기" fill className="object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">원본 URL (출처)</label>
                    <input
                      type="text"
                      value={form.sourceUrl}
                      onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))}
                      placeholder="https://syukafriends.kr/article/..."
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </>
              )}

              {/* ── 콘텐츠 편집 탭 (블록 에디터) ── */}
              {formTab === 'content' && (
                <div className="space-y-3">
                  {/* 블록 추가 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addBlock('text')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-bold rounded-xl border border-purple-200 dark:border-purple-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      텍스트 블록 추가
                    </button>
                    <button
                      onClick={() => addBlock('image')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 text-xs font-bold rounded-xl border border-green-200 dark:border-green-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      이미지 블록 추가
                    </button>
                  </div>

                  {blocks.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-[#343536] rounded-xl text-gray-400 text-sm">
                      위 버튼으로 텍스트 또는 이미지 블록을 추가하세요.<br />
                      <span className="text-xs">블록 순서대로 상세 페이지에 표시됩니다.</span>
                    </div>
                  )}

                  {/* 블록 목록 */}
                  {blocks.map((block, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border-2 overflow-hidden ${
                        block.type === 'text'
                          ? 'border-purple-200 dark:border-purple-800'
                          : 'border-green-200 dark:border-green-800'
                      }`}
                    >
                      {/* 블록 헤더 */}
                      <div
                        className={`flex items-center justify-between px-3 py-2 ${
                          block.type === 'text'
                            ? 'bg-purple-50 dark:bg-purple-900/20'
                            : 'bg-green-50 dark:bg-green-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                              block.type === 'text'
                                ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                                : 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                            }`}
                          >
                            {block.type === 'text' ? 'T 텍스트' : '🖼 이미지'}
                          </span>
                          <span className="text-[11px] text-gray-400">{i + 1} / {blocks.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveBlock(i, -1)}
                            disabled={i === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"
                            title="위로"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveBlock(i, 1)}
                            disabled={i === blocks.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"
                            title="아래로"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteBlock(i)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors ml-1"
                            title="삭제"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* 블록 바디 */}
                      <div className="p-3 bg-white dark:bg-[#1A1A1B]">
                        {block.type === 'text' ? (
                          <>
                            <textarea
                              value={block.value}
                              onChange={(e) => updateBlock(i, { type: 'text', value: e.target.value })}
                              placeholder="여기에 텍스트를 입력하세요. 단락은 빈 줄로 구분됩니다."
                              rows={4}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-y leading-relaxed"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">{block.value.length}자</p>
                          </>
                        ) : (
                          <>
                            <input
                              type="text"
                              value={block.url}
                              onChange={(e) => updateBlock(i, { type: 'image', url: e.target.value })}
                              placeholder="https://example.com/image.png"
                              className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all font-mono text-xs"
                            />
                            {block.url && (
                              <div className="mt-2 h-40 rounded-lg overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                                <Image
                                  src={block.url}
                                  alt="이미지 미리보기"
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* 하단 추가 버튼 (블록이 있을 때) */}
                  {blocks.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => addBlock('text')}
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 transition-colors"
                      >
                        + 텍스트
                      </button>
                      <button
                        onClick={() => addBlock('image')}
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 transition-colors"
                      >
                        + 이미지
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-[#343536] flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setFormOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || !form.author.trim()}
                className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors shadow-sm"
              >
                {editTarget ? '수정 완료' : '작성 완료'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">아티클 삭제</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              이 아티클을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
