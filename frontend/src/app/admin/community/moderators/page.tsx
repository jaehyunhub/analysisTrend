'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPatch } from '@/shared/api/client';
import { useToastStore } from '@/shared/model/toastStore';

interface Community {
  id: number;
  name: string;
  slug: string;
}

interface ModeratorEntry {
  userId: number;
  username: string;
  email: string;
  communityName: string;
  communityId: number;
  assignedAt: string;
}

interface UserSearchResult {
  id: number;
  username: string;
  email: string;
  role: string;
}

export default function CommunityModeratorsPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [moderators, setModerators] = useState<ModeratorEntry[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | ''>('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // 커뮤니티 목록 로드
  useEffect(() => {
    apiGet<{ id: number; name: string; slug: string }[]>('/api/v1/communities')
      .then((data) => setCommunities(data))
      .catch(() => {
        // API 실패 시 빈 배열 유지
      });
  }, []);

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      addToast('이메일을 입력해주세요.', 'error');
      return;
    }
    setIsSearching(true);
    setSearchResult(null);
    try {
      const result = await apiGet<UserSearchResult>(`/api/v1/admin/users/search?email=${encodeURIComponent(searchEmail.trim())}`);
      setSearchResult(result);
    } catch {
      addToast('사용자를 찾을 수 없습니다. 이메일을 확인해주세요.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssignModerator = async () => {
    if (!searchResult) {
      addToast('먼저 사용자를 검색해주세요.', 'error');
      return;
    }
    if (selectedCommunityId === '') {
      addToast('커뮤니티를 선택해주세요.', 'error');
      return;
    }

    setIsAssigning(true);
    try {
      await apiPatch(`/api/v1/admin/users/${searchResult.id}/community-role`, {
        communityId: selectedCommunityId,
        role: 'MODERATOR',
      });

      const community = communities.find((c) => c.id === selectedCommunityId);
      const newEntry: ModeratorEntry = {
        userId: searchResult.id,
        username: searchResult.username,
        email: searchResult.email,
        communityName: community?.name ?? '알 수 없음',
        communityId: selectedCommunityId as number,
        assignedAt: new Date().toLocaleDateString('ko-KR'),
      };
      setModerators((prev) => [newEntry, ...prev.filter((m) => !(m.userId === searchResult.id && m.communityId === selectedCommunityId))]);
      addToast(`${searchResult.username}님을 ${community?.name ?? ''} 커뮤니티 관리자로 지정했습니다.`, 'success');
      setSearchEmail('');
      setSearchResult(null);
    } catch {
      addToast('관리자 지정에 실패했습니다. API 엔드포인트를 확인해주세요.', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRevokeModerator = async (entry: ModeratorEntry) => {
    try {
      await apiPatch(`/api/v1/admin/users/${entry.userId}/community-role`, {
        communityId: entry.communityId,
        role: 'MEMBER',
      });
      setModerators((prev) => prev.filter((m) => !(m.userId === entry.userId && m.communityId === entry.communityId)));
      addToast(`${entry.username}님의 관리자 권한을 해제했습니다.`, 'success');
    } catch {
      addToast('권한 해제에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">커뮤니티 관리자 설정</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">사용자를 검색하여 특정 커뮤니티의 관리자(Moderator) 권한을 부여하거나 해제합니다.</p>
      </div>

      {/* Assign Form */}
      <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] p-6 space-y-5">
        <h3 className="font-bold text-gray-900 dark:text-white">관리자 권한 부여</h3>

        {/* User Search */}
        <div>
          <label htmlFor="mod-email-search" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            사용자 이메일 검색
          </label>
          <div className="flex gap-2">
            <input
              id="mod-email-search"
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
              placeholder="user@example.com"
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#343536] rounded-xl bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleSearchUser}
              disabled={isSearching || !searchEmail.trim()}
              aria-busy={isSearching}
              className="px-4 py-2.5 bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-white disabled:opacity-50 text-white dark:text-gray-900 text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              검색
            </button>
          </div>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm shrink-0">
              {searchResult.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{searchResult.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{searchResult.email}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">{searchResult.role}</span>
          </div>
        )}

        {/* Community Select + Assign Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="mod-community-select" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              커뮤니티 선택
            </label>
            <select
              id="mod-community-select"
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#343536] rounded-xl bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">커뮤니티를 선택하세요</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:self-end">
            <button
              type="button"
              onClick={handleAssignModerator}
              disabled={isAssigning || !searchResult || selectedCommunityId === ''}
              aria-busy={isAssigning}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isAssigning && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              관리자 권한 부여
            </button>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            <strong>API 안내:</strong> <code className="font-mono">PATCH /api/v1/admin/users/&#123;userId&#125;/community-role</code> 엔드포인트가 필요합니다. 미구현 시 오류 토스트가 표시됩니다.
          </p>
        </div>
      </div>

      {/* Moderator List */}
      <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#343536]">
          <h3 className="font-bold text-gray-900 dark:text-white">현재 커뮤니티 관리자 목록</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">이 세션에서 부여한 권한만 표시됩니다. 새로고침 시 초기화됩니다.</p>
        </div>

        {moderators.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
            아직 지정된 커뮤니티 관리자가 없습니다.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#272729]">
              <tr className="border-b border-gray-100 dark:border-[#343536]">
                <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase" scope="col">사용자</th>
                <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase" scope="col">이메일</th>
                <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase" scope="col">커뮤니티</th>
                <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase" scope="col">지정일</th>
                <th className="text-right py-3 px-5 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase" scope="col">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
              {moderators.map((entry) => (
                <tr key={`${entry.userId}-${entry.communityId}`} className="hover:bg-gray-50 dark:hover:bg-[#272729]">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{entry.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-gray-600 dark:text-gray-300">{entry.email}</td>
                  <td className="py-3 px-5">
                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                      {entry.communityName}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-gray-500 dark:text-gray-400 text-xs">{entry.assignedAt}</td>
                  <td className="py-3 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleRevokeModerator(entry)}
                      className="px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      권한 해제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
