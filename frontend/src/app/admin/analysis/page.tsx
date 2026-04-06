'use client';

import { useState } from 'react';
import { analysisGet } from '@/shared/api/client';

interface ChannelStats {
  channel_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  subscriber_count?: number;
  view_count?: number;
  video_count?: number;
  published_at?: string;
}

function fmtCount(n?: number): string {
  if (n == null) return '-';
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}천`;
  return n.toLocaleString();
}

export default function AnalysisPage() {
  const [channelInput, setChannelInput] = useState('');
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!channelInput.trim()) return;
    setLoading(true);
    setError('');
    try {
      const stats = await analysisGet<ChannelStats>('/trends/channel/stats', { channel: channelInput.trim() });
      setChannelStats(stats);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '채널을 찾을 수 없습니다.');
      setChannelStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0e]">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">채널 분석</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">YouTube 채널 통계 조회</p>
        </div>
      </div>

      {/* Persona Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center shrink-0 text-lg">📊</div>
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">페르소나 C · 채널 운영자</p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
            다른 YouTube 채널의 구독자 수, 총 조회수, 동영상 수를 URL 또는 @핸들로 바로 조회할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 검색 입력 */}
        <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">채널 통계 조회</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            YouTube 채널 URL, @핸들명, 또는 채널 ID를 입력하세요.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="예: https://youtube.com/@채널명  /  @channelhandle  /  UCxxxxxx"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !channelInput.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              조회
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {/* 결과 */}
        {channelStats ? (
          <>
            {/* 채널 프로필 */}
            <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm">
              <div className="flex items-center gap-4">
                {channelStats.thumbnail_url ? (
                  <img src={channelStats.thumbnail_url} alt={channelStats.title} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white text-2xl font-black shrink-0">
                    {channelStats.title.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{channelStats.title}</h3>
                  {channelStats.published_at && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      채널 개설: {new Date(channelStats.published_at).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                  {channelStats.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{channelStats.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '구독자', value: fmtCount(channelStats.subscriber_count), icon: '👥' },
                { label: '총 조회수', value: fmtCount(channelStats.view_count), icon: '👁' },
                { label: '동영상 수', value: fmtCount(channelStats.video_count), icon: '🎬' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-[#1A1A1B] p-5 rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
                </div>
              ))}
            </div>
          </>
        ) : (
          !loading && (
            <div className="bg-white dark:bg-[#1A1A1B] p-10 rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm text-center">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-bold text-gray-700 dark:text-gray-300">채널 URL 또는 @핸들을 입력해 통계를 조회하세요</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                구독자 수, 총 조회수, 동영상 수를 바로 확인할 수 있습니다.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
