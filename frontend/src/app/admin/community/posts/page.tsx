'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCommunityStore } from '@/shared/model/communityStore';

export default function PostManagement() {
  const { posts, fetchPosts, deletePostWithApi } = useCommunityStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('이 게시물을 삭제하시겠습니까?')) return;
    await deletePostWithApi(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">게시물 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">신고된 콘텐츠를 검토하고 가이드라인 위반 게시물을 삭제합니다.</p>
        </div>
        <input
          type="search"
          placeholder="제목 또는 작성자 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#343536] bg-white dark:bg-[#1A1A1B] text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 placeholder-gray-400"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          {search ? '검색 결과가 없습니다.' : '게시물이 없습니다.'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(post => (
            <div
              key={post.id}
              className="bg-white dark:bg-[#1A1A1B] p-4 rounded-xl border border-gray-200 dark:border-[#343536] shadow-sm flex items-center justify-between"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    활성
                  </span>
                  {post.community && (
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-bold">{post.community}</span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    • 작성자: {post.author}
                    {post.createdAt && ` • ${new Date(post.createdAt).toLocaleDateString('ko-KR')}`}
                  </span>
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{post.title}</h3>
                <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>추천 {post.upvotes ?? 0}</span>
                  <span>댓글 {post.commentCount ?? 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/community/${post.community ?? 'free'}/comments/${post.id}`}
                  className="px-3 py-2 bg-gray-50 dark:bg-[#272729] text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-[#343536] transition-colors"
                >
                  보기
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
