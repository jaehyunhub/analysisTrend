'use client';

import { useState, useEffect, useCallback } from 'react';
import { analysisGet } from '@/shared/api/client';

interface TrendKeyword { keyword: string; score: number; source: string; rank?: number; }
interface TrendingVideo {
  video_id: string; title: string; channel_title: string;
  view_count: number; thumbnail_url?: string; published_at: string; tags: string[];
}

export default function TrendsContent() {
  const [activeTab, setActiveTab] = useState<'keywords' | 'videos' | 'news'>('keywords');
  const [region, setRegion] = useState('KR');
  const [category, setCategory] = useState('0');
  const [keywords, setKeywords] = useState<TrendKeyword[]>([]);
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('–');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [kws, vids] = await Promise.all([
        analysisGet<TrendKeyword[]>('/trends/news', { limit: '20' }),
        analysisGet<TrendingVideo[]>('/trends/youtube', { region, category, limit: '20' }),
      ]);
      setKeywords(kws);
      setVideos(vids);
      setLastUpdated(new Date().toLocaleString('ko-KR'));
    } catch {
      // API 미연결 시 빈 배열 유지
    } finally {
      setLoading(false);
    }
  }, [region, category]);

  useEffect(() => { fetchData(); }, [fetchData]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold dark:text-white">트렌드 분석</h2>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">LIVE</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">실시간 뉴스 키워드 · YouTube 급상승 · 콘텐츠 인사이트 — 마지막 업데이트: {lastUpdated}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            aria-busy={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            {loading && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            새로고침
          </button>
        </div>
      </div>

      {/* Persona Guide Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg" aria-hidden="true">📋</span>
            <span className="text-sm font-black text-blue-700 dark:text-blue-300">콘텐츠 기획자</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">급상승 키워드로 다음 영상 주제를 결정하세요</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg" aria-hidden="true">🔍</span>
            <span className="text-sm font-black text-purple-700 dark:text-purple-300">리서처 · 작가</span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400">뉴스 원문 링크와 3줄 요약으로 자료조사를 빠르게</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg" aria-hidden="true">📊</span>
            <span className="text-sm font-black text-green-700 dark:text-green-300">채널 운영자</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">경쟁 채널 트렌딩 영상으로 콘텐츠 전략을 수립하세요</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-[#343536]" role="tablist">
          {[
            { key: 'keywords', label: '📰 뉴스 키워드', desc: '30분 주기 갱신' },
            { key: 'videos', label: '▶ YouTube 트렌딩', desc: '국가·카테고리 필터' },
            { key: 'news', label: '📄 뉴스 원문', desc: '3줄 요약' },
          ].map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-4 px-3 text-sm font-bold transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <div>{tab.label}</div>
              <div className="text-[10px] font-normal text-gray-400 mt-0.5">{tab.desc}</div>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Keywords Tab */}
          {activeTab === 'keywords' && (
            <div role="tabpanel" aria-label="뉴스 키워드" className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">국내 뉴스 급상승 키워드 TOP 20</h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">네이버·연합뉴스 기반</span>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-400">불러오는 중...</div>
              ) : keywords.length === 0 ? (
                <div className="text-center py-8 text-gray-400">데이터가 없습니다. (분석 서비스 연결 확인)</div>
              ) : (
                <>
                  {/* Keyword Cloud */}
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-[#111] rounded-xl min-h-[120px]" data-testid="news-keywords">
                    {keywords.map((kw, i) => {
                      const size = i < 5 ? 'text-lg font-black' : i < 10 ? 'text-base font-bold' : 'text-sm font-semibold';
                      const color = kw.score > 0.8 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800' :
                        kw.score > 0.4 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
                      return (
                        <button key={kw.keyword} data-testid="keyword-item" className={`${size} ${color} border px-3 py-1.5 rounded-full hover:scale-105 transition-transform cursor-pointer`}>
                          {kw.keyword}
                        </button>
                      );
                    })}
                  </div>

                  {/* Keyword Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase" scope="col">순위</th>
                          <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase" scope="col">키워드</th>
                          <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase" scope="col">점수</th>
                          <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase" scope="col">출처</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {keywords.map((kw, i) => (
                          <tr key={kw.keyword} className="hover:bg-gray-50 dark:hover:bg-[#272729]">
                            <td className="py-3 px-2">
                              <span className={`text-sm font-black ${i < 3 ? 'text-yellow-500' : 'text-gray-400'}`}>#{(kw.rank ?? i + 1)}</span>
                            </td>
                            <td className="py-3 px-2 font-semibold dark:text-white">{kw.keyword}</td>
                            <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">{kw.score.toFixed(3)}</td>
                            <td className="py-3 px-2 text-right text-xs text-gray-400">{kw.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div role="tabpanel" aria-label="YouTube 트렌딩" className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">YouTube 급상승 동영상</h3>
                <div className="flex gap-2">
                  <select
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    aria-label="국가 선택"
                    className="bg-gray-100 dark:bg-[#272729] border-none text-xs font-bold rounded-xl px-3 py-2 outline-none dark:text-white cursor-pointer"
                  >
                    <option value="KR">🇰🇷 한국</option>
                    <option value="US">🇺🇸 미국</option>
                    <option value="JP">🇯🇵 일본</option>
                  </select>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    aria-label="카테고리 선택"
                    className="bg-gray-100 dark:bg-[#272729] border-none text-xs font-bold rounded-xl px-3 py-2 outline-none dark:text-white cursor-pointer"
                  >
                    <option value="0">전체</option>
                    <option value="25">뉴스/정치</option>
                    <option value="28">과학/기술</option>
                    <option value="22">사람/블로그</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-400">불러오는 중...</div>
              ) : videos.length === 0 ? (
                <div className="text-center py-8 text-gray-400">데이터가 없습니다. (분석 서비스 연결 확인)</div>
              ) : (
                <div className="space-y-3" data-testid="youtube-trending">
                  {videos.map((video, i) => (
                    <a
                      key={video.video_id}
                      data-testid="video-item"
                      href={`https://youtu.be/${video.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${i + 1}위: ${video.title} - ${video.channel_title}, 조회수 ${(video.view_count / 1000).toFixed(0)}K`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors group cursor-pointer"
                    >
                      <span className={`text-xl font-black w-8 text-center ${i < 3 ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} aria-hidden="true">
                        {i + 1}
                      </span>
                      <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 shrink-0 overflow-hidden flex items-center justify-center">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold dark:text-white truncate group-hover:text-blue-600 transition-colors">{video.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{video.channel_title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm dark:text-white">{(video.view_count / 1000).toFixed(0)}K</p>
                        <span className="text-[10px] text-gray-400">{new Date(video.published_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div role="tabpanel" aria-label="뉴스 원문" className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">뉴스 키워드 심층 분석</h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">분석 서비스 기반</span>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-400">불러오는 중...</div>
              ) : keywords.length === 0 ? (
                <div className="text-center py-8 text-gray-400">데이터가 없습니다. (분석 서비스 연결 확인)</div>
              ) : (
                <div className="space-y-3">
                  {keywords.slice(0, 10).map((kw, i) => (
                    <div key={kw.keyword} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                      <span className={`text-base font-black w-8 text-center ${i < 3 ? 'text-yellow-500' : 'text-gray-400'}`} aria-hidden="true">#{(kw.rank ?? i + 1)}</span>
                      <span className="font-bold dark:text-white flex-1">{kw.keyword}</span>
                      <div className="w-32 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.min(kw.score * 100, 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`점수 ${kw.score.toFixed(3)}`}>
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(kw.score * 100, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-right">{kw.score.toFixed(3)}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">{kw.source}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black mb-1">AI 콘텐츠 인사이트</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {keywords.length > 0 ? (
                <>
                  이번 주 급상승 키워드{' '}
                  <strong className="text-white">&#34;{keywords[0]?.keyword}&#34;</strong>
                  {keywords[1] && <>, <strong className="text-white">&#34;{keywords[1].keyword}&#34;</strong></>}
                  가 결합된 콘텐츠가 높은 관심을 받고 있습니다. 관련 심층 분석 콘텐츠 제작을 추천합니다.
                </>
              ) : (
                '분석 서비스에 연결하면 실시간 키워드 기반 콘텐츠 인사이트를 제공합니다.'
              )}
            </p>
            <div className="flex gap-3 mt-4">
              <button className="px-4 py-2 bg-white text-indigo-700 text-sm font-bold rounded-xl hover:bg-white/90 transition-colors">
                영상 주제 제안 받기
              </button>
              <button className="px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/30 transition-colors">
                키워드 저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
