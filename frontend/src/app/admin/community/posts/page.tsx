'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCommunityStore } from '@/shared/model/communityStore';
import { apiGet } from '@/shared/api/client';

interface CommunityInfo {
  id: number;
  name: string;
  description?: string;
}

export default function PostManagement() {
  const { posts, fetchPosts, deletePostWithApi, isLoading } = useCommunityStore();
  const [search, setSearch] = useState('');
  const [communities, setCommunities] = useState<CommunityInfo[]>([]);
  const [communityFilter, setCommunityFilter] = useState<string>('all');
  const [commLoading, setCommLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    setCommLoading(true);
    apiGet<CommunityInfo[]>('/api/v1/communities')
      .then((data) => setCommunities(Array.isArray(data) ? data : []))
      .catch(() => setCommunities([]))
      .finally(() => setCommLoading(false));
  }, [fetchPosts]);

  const filtered = posts.filter((p) => {
    if (communityFilter !== 'all' && p.community !== communityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('이 게시물을 삭제하시겠습니까?')) return;
    await deletePostWithApi(id);
  };

  const communityPostCounts = posts.reduce<Record<string, number>>((acc, p) => {
    const key = p.community || '미분류';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // 전체 보기 시 커뮤니티별 그룹화
  const groupedPosts = filtered.reduce<Record<string, typeof filtered>>((acc, post) => {
    const key = post.community || '미분류';
    if (!acc[key]) acc[key] = [];
    acc[key].push(post);
    return acc;
  }, {});

  const PostCard = ({ post }: { post: typeof posts[0] }) => (
    <div className="bg-white dark:bg-[#1A1A1B] p-4 rounded-xl border border-gray-200 dark:border-[#343536] shadow-sm flex items-center justify-between">
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            활성
          </span>
          <span className="text-xs text-gray-700 dark:text-gray-300">
            작성자: {post.author}
            {post.createdAt && ` • ${new Date(post.createdAt).toLocaleDateString('ko-KR')}`}
          </span>
        </div>
        <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{post.title}</h3>
        <div className="flex gap-3 mt-1 text-xs text-gray-700 dark:text-gray-300">
          <span>추천 {post.upvotes ?? 0}</span>
          <span>댓글 {post.commentCount ?? 0}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/community/board/${post.community ?? 'free'}/comments/${post.id}`}
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
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">게시물 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            전체 게시물을 검토하고 관리합니다.
            <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">총 {posts.length}건</span>
          </p>
        </div>
        <input
          type="search"
          placeholder="제목 또는 작성자 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#343536] bg-white dark:bg-[#1A1A1B] text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 placeholder-gray-400"
        />
      </div>

      {/* 커뮤니티 탭 — 가로 스크롤 */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-2 min-w-max">
          {/* 전체 탭 */}
          <button
            onClick={() => setCommunityFilter('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-bold whitespace-nowrap transition-colors ${
              communityFilter === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-[#1A1A1B] text-gray-900 dark:text-white border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#272729]'
            }`}
          >
            전체
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              communityFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#343536] text-gray-900 dark:text-white'
            }`}>
              {posts.length}
            </span>
          </button>

          {/* 커뮤니티별 탭 */}
          {commLoading ? (
            <span className="text-xs text-gray-400 px-2">커뮤니티 로드 중...</span>
          ) : communities.length === 0 ? (
            <span className="text-xs text-gray-400 px-2">커뮤니티가 없습니다.</span>
          ) : (
            communities.map((c) => (
              <button
                key={c.id}
                onClick={() => setCommunityFilter(c.name)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-bold whitespace-nowrap transition-colors ${
                  communityFilter === c.name
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-[#1A1A1B] text-gray-900 dark:text-white border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#272729]'
                }`}
              >
                {c.name}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  communityFilter === c.name ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#343536] text-gray-900 dark:text-white'
                }`}>
                  {communityPostCounts[c.name] ?? 0}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 게시물 목록 */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">게시물을 불러오는 중...</div>
      ) : communityFilter === 'all' ? (
        // 전체 보기: 커뮤니티별 그룹화
        Object.keys(groupedPosts).length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            {search ? '검색 결과가 없습니다.' : '게시물이 없습니다.'}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPosts).map(([communityName, communityPosts]) => (
              <div key={communityName}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{communityName}</h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">
                    {communityPosts.length}건
                  </span>
                </div>
                <div className="grid gap-3 pl-2 border-l-2 border-blue-200 dark:border-blue-900/50">
                  {communityPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // 특정 커뮤니티 필터
        <div>
          {/* 커뮤니티 헤더 */}
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{communityFilter}</h3>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">
              {filtered.length}건
            </span>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-[#343536]">
              {search ? '검색 결과가 없습니다.' : '이 커뮤니티에 게시물이 없습니다.'}
            </div>
          ) : (
            <div className="grid gap-3 pl-2 border-l-2 border-blue-200 dark:border-blue-900/50">
              {filtered.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
