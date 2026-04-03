'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MOCK_MAGAZINES } from '@/shared/mocks/magazines';
import type { Magazine } from '@/shared/types/magazine';

const CATEGORIES = ['트렌드', '마케팅', '테크', '라이프'];

const EMPTY_FORM: Omit<Magazine, 'id'> = {
  title: '',
  summary: '',
  thumbnail: '',
  category: '트렌드',
  author: '',
  readTime: '',
  publishedAt: new Date().toISOString().slice(0, 10),
};

export default function MagazineManagementPage() {
  const [articles, setArticles] = useState<Magazine[]>(MOCK_MAGAZINES);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Magazine | null>(null);
  const [form, setForm] = useState<Omit<Magazine, 'id'>>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
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
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.author.trim()) return;
    if (editTarget) {
      setArticles((prev) => prev.map((a) => a.id === editTarget.id ? { ...editTarget, ...form } : a));
    } else {
      const newId = Math.max(0, ...articles.map((a) => a.id)) + 1;
      setArticles((prev) => [{ id: newId, ...form }, ...prev]);
    }
    setFormOpen(false);
  };

  const handleDelete = (id: number) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">매거진 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">매거진 아티클을 작성하고 관리합니다.</p>
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
          <div key={cat} className="bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-[#343536] p-4 text-center">
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {articles.filter((a) => a.category === cat).length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cat}</p>
          </div>
        ))}
      </div>

      {/* Article List */}
      <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#343536] flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">아티클 목록 ({articles.length}건)</h3>
        </div>
        {articles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">등록된 아티클이 없습니다.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-[#343536]">
            {articles.map((article) => (
              <div key={article.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                {/* Thumbnail */}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[11px] font-bold shrink-0">
                      {article.category}
                    </span>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{article.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{article.summary}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {article.author} · {article.publishedAt} · {article.readTime} 읽기
                  </p>
                </div>

                {/* Actions */}
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

      {/* Form Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#343536] flex items-center justify-between">
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

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="아티클 제목을 입력하세요"
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
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                {form.thumbnail && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                    <Image src={form.thumbnail} alt="미리보기" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end gap-3">
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

      {/* Delete Confirm Modal */}
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">이 아티클을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.</p>
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
