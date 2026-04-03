'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '@/shared/api/client';

interface UserDto {
  id: number;
  email: string;
  nickname: string;
  role: string;
  provider: string;
  createdAt: string;
}

interface PageResult {
  content: UserDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export default function MemberManagement() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 20;

  const [searchEmail, setSearchEmail] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page: number, email: string) => {
    setLoading(true);
    setError(null);
    try {
      let result: PageResult;
      if (email.trim()) {
        result = await apiGet<PageResult>(
          `/api/v1/admin/users/search?email=${encodeURIComponent(email.trim())}&page=${page}&size=${PAGE_SIZE}`
        );
      } else {
        result = await apiGet<PageResult>(
          `/api/v1/admin/users?page=${page}&size=${PAGE_SIZE}`
        );
      }
      setUsers(result.content ?? []);
      setTotalElements(result.totalElements ?? 0);
      setTotalPages(result.totalPages ?? 0);
      setCurrentPage(result.number ?? page);
    } catch (e) {
      setError(e instanceof Error ? e.message : '유저 목록을 불러오지 못했습니다.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(0, '');
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearchEmail(searchInput);
    setCurrentPage(0);
    fetchUsers(0, searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchEmail);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return dateStr.replace('T', ' ').slice(0, 16);
  };

  const roleBadge = (role: string) => {
    if (role === 'ADMIN') return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const providerBadge = (provider: string) => {
    switch (provider) {
      case 'GOOGLE': return 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400';
      case 'KAKAO': return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'NAVER': return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">회원 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            전체 회원 목록 및 정보를 확인합니다.
            {totalElements > 0 && (
              <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">
                총 {totalElements.toLocaleString()}명
              </span>
            )}
          </p>
        </div>
        {/* 검색 */}
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="이메일로 검색..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-[#343536] rounded-lg bg-white dark:bg-[#1A1A1B] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            검색
          </button>
          {searchEmail && (
            <button
              onClick={() => {
                setSearchInput('');
                setSearchEmail('');
                fetchUsers(0, '');
              }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-[#343536] rounded-lg transition-colors"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 테이블 */}
      <div className="bg-white dark:bg-[#1A1A1B] rounded-xl border border-gray-200 dark:border-[#343536] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">
              {searchEmail ? `"${searchEmail}" 검색 결과가 없습니다.` : '등록된 회원이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#272729] text-gray-600 dark:text-gray-300 font-bold border-b border-gray-100 dark:border-[#343536]">
                <tr>
                  <th className="p-4 w-12">ID</th>
                  <th className="p-4">닉네임</th>
                  <th className="p-4">이메일</th>
                  <th className="p-4">역할</th>
                  <th className="p-4">가입 경로</th>
                  <th className="p-4">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                    <td className="p-4 text-gray-400 dark:text-gray-500 text-xs">{user.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.nickname ? user.nickname.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{user.nickname || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${roleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${providerBadge(user.provider)}`}>
                        {user.provider}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-[#343536] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#272729] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const start = Math.max(0, currentPage - 4);
            const pageNum = start + i;
            if (pageNum >= totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white font-bold'
                    : 'border border-gray-200 dark:border-[#343536] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#272729]'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-[#343536] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#272729] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
