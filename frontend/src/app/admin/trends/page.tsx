'use client';

import { useState } from 'react';

const NEWS_KEYWORDS = [
  { word: '미국 관세', count: 1240, change: +18, rank: 1 },
  { word: '금리 인하', count: 980, change: +12, rank: 2 },
  { word: '비트코인', count: 876, change: +45, rank: 3 },
  { word: '반도체', count: 754, change: -3, rank: 4 },
  { word: 'AI 혁신', count: 712, change: +22, rank: 5 },
  { word: '원달러환율', count: 698, change: +8, rank: 6 },
  { word: '부동산', count: 634, change: -5, rank: 7 },
  { word: '코스피', count: 601, change: +11, rank: 8 },
  { word: 'ChatGPT', count: 589, change: +33, rank: 9 },
  { word: '삼성전자', count: 543, change: -2, rank: 10 },
  { word: '물가상승', count: 498, change: +7, rank: 11 },
  { word: '경제성장률', count: 476, change: +4, rank: 12 },
  { word: '스타트업', count: 432, change: +15, rank: 13 },
  { word: '주식시장', count: 421, change: -8, rank: 14 },
  { word: '전기차', count: 398, change: +19, rank: 15 },
  { word: 'ESG', count: 356, change: +3, rank: 16 },
  { word: '로봇공학', count: 321, change: +28, rank: 17 },
  { word: '바이오테크', count: 298, change: -1, rank: 18 },
  { word: '메타버스', count: 276, change: -12, rank: 19 },
  { word: '양자컴퓨터', count: 254, change: +41, rank: 20 },
];

const TRENDING_VIDEOS = [
  { rank: 1, title: '2026년 AI 혁명, 한국 경제를 바꾼다', channel: '경제연구소', views: '2.4M', category: '경제', region: 'KR', trend: 'peak' },
  { rank: 2, title: '미국 관세 전쟁 최신 분석 — 수출 기업 영향은?', channel: '글로벌경제TV', views: '1.8M', category: '뉴스', region: 'KR', trend: 'high' },
  { rank: 3, title: '금리 인하 시대의 부동산 투자 전략', channel: '재테크연구소', views: '1.5M', category: '경제', region: 'KR', trend: 'high' },
  { rank: 4, title: '비트코인 사상 최고가 — 다음 목표는?', channel: '크립토인사이트', views: '1.2M', category: '금융', region: 'KR', trend: 'high' },
  { rank: 5, title: '삼성 반도체 신기술 발표 총정리', channel: '테크리뷰코리아', views: '987K', category: '기술', region: 'KR', trend: 'mid' },
  { rank: 6, title: '2026 코스피 전망 — 전문가 5인 토론', channel: '주식분석팀', views: '876K', category: '금융', region: 'KR', trend: 'mid' },
  { rank: 7, title: 'ChatGPT 최신 업데이트 완전 분석', channel: 'AI뉴스', views: '754K', category: '기술', region: 'KR', trend: 'mid' },
  { rank: 8, title: '전기차 시장 판도 변화 — 테슬라 vs 현대', channel: '모빌리티리포트', views: '698K', category: '기술', region: 'KR', trend: 'mid' },
];

const NEWS_ARTICLES = [
  {
    title: '미국, 한국산 반도체에 25% 추가 관세 부과 예고',
    source: '매일경제',
    time: '30분 전',
    summary: '트럼프 행정부가 한국산 반도체 제품에 25% 추가 관세를 부과하는 방안을 검토 중. 삼성·SK하이닉스 주가 급락 우려.',
    keywords: ['미국 관세', '반도체', '삼성전자'],
    category: '경제',
  },
  {
    title: '한국은행, 올해 2차례 금리 인하 가능성 시사',
    source: '한국경제',
    time: '1시간 전',
    summary: '한국은행 총재가 물가 안정세 지속 시 연내 2차례 금리 인하가 가능하다고 발언. 부동산·주식 시장 기대감 상승.',
    keywords: ['금리 인하', '한국은행', '부동산'],
    category: '금융',
  },
  {
    title: 'AI 스타트업 투자 유치 역대 최고 — 1조 돌파',
    source: '조선비즈',
    time: '2시간 전',
    summary: '2026년 1분기 국내 AI 스타트업 투자 유치 금액이 1조 원을 돌파. 생성형 AI와 로보틱스 분야가 투자 견인.',
    keywords: ['AI 혁신', '스타트업', 'ChatGPT'],
    category: '기술',
  },
];

export default function TrendsPage() {
  const [activeTab, setActiveTab] = useState<'keywords' | 'videos' | 'news'>('keywords');
  const [region, setRegion] = useState('KR');
  const [category, setCategory] = useState('전체');
  const [lastUpdated] = useState('2026-03-15 14:30');

  const trendColor = (change: number) => {
    if (change > 20) return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
    if (change > 0) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
    return 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  };

  const badgeColor = (trend: string) => {
    if (trend === 'peak') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    if (trend === 'high') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  };

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
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
            새로고침
          </button>
        </div>
      </div>

      {/* Persona Guide Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📋</span>
            <span className="text-sm font-black text-blue-700 dark:text-blue-300">콘텐츠 기획자</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">급상승 키워드로 다음 영상 주제를 결정하세요</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔍</span>
            <span className="text-sm font-black text-purple-700 dark:text-purple-300">리서처 · 작가</span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400">뉴스 원문 링크와 3줄 요약으로 자료조사를 빠르게</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📊</span>
            <span className="text-sm font-black text-green-700 dark:text-green-300">채널 운영자</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">경쟁 채널 트렌딩 영상으로 콘텐츠 전략을 수립하세요</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-[#343536]">
          {[
            { key: 'keywords', label: '📰 뉴스 키워드', desc: '30분 주기 갱신' },
            { key: 'videos', label: '▶ YouTube 트렌딩', desc: '국가·카테고리 필터' },
            { key: 'news', label: '📄 뉴스 원문', desc: '3줄 요약' },
          ].map(tab => (
            <button
              key={tab.key}
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
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">국내 뉴스 급상승 키워드 TOP 20</h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">네이버·연합뉴스 기반</span>
              </div>

              {/* Keyword Cloud */}
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-[#111] rounded-xl min-h-[120px]">
                {NEWS_KEYWORDS.map((kw) => {
                  const size = kw.rank <= 5 ? 'text-lg font-black' : kw.rank <= 10 ? 'text-base font-bold' : 'text-sm font-semibold';
                  const color = kw.change > 20 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800' :
                    kw.change > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
                  return (
                    <button key={kw.word} className={`${size} ${color} border px-3 py-1.5 rounded-full hover:scale-105 transition-transform cursor-pointer`}>
                      {kw.word}
                    </button>
                  );
                })}
              </div>

              {/* Keyword Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">순위</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">키워드</th>
                      <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">언급 수</th>
                      <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">변동</th>
                      <th className="text-center py-3 px-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {NEWS_KEYWORDS.map((kw) => (
                      <tr key={kw.word} className="hover:bg-gray-50 dark:hover:bg-[#272729] group">
                        <td className="py-3 px-2">
                          <span className={`text-sm font-black ${kw.rank <= 3 ? 'text-yellow-500' : 'text-gray-400'}`}>#{kw.rank}</span>
                        </td>
                        <td className="py-3 px-2 font-semibold dark:text-white">{kw.word}</td>
                        <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">{kw.count.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trendColor(kw.change)}`}>
                            {kw.change > 0 ? `↑ +${kw.change}%` : `↓ ${kw.change}%`}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button className="text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 hover:underline font-bold transition-opacity">
                            뉴스 보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">YouTube 급상승 동영상</h3>
                <div className="flex gap-2">
                  <select
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="bg-gray-100 dark:bg-[#272729] border-none text-xs font-bold rounded-xl px-3 py-2 outline-none dark:text-white cursor-pointer"
                  >
                    <option value="KR">🇰🇷 한국</option>
                    <option value="US">🇺🇸 미국</option>
                    <option value="JP">🇯🇵 일본</option>
                    <option value="GLOBAL">🌍 글로벌</option>
                  </select>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="bg-gray-100 dark:bg-[#272729] border-none text-xs font-bold rounded-xl px-3 py-2 outline-none dark:text-white cursor-pointer"
                  >
                    <option>전체</option>
                    <option>경제</option>
                    <option>기술</option>
                    <option>뉴스</option>
                    <option>금융</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {TRENDING_VIDEOS.map((video) => (
                  <div key={video.rank} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors group cursor-pointer">
                    <span className={`text-xl font-black w-8 text-center ${video.rank <= 3 ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}>
                      {video.rank}
                    </span>
                    <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 shrink-0 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold dark:text-white truncate group-hover:text-blue-600 transition-colors">{video.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{video.channel}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm dark:text-white">{video.views}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor(video.trend)}`}>
                        {video.trend === 'peak' ? '폭발적' : video.trend === 'high' ? '급상승' : '상승'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">{video.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">최신 뉴스 + AI 요약</h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">매일경제·한국경제·조선비즈</span>
              </div>

              <div className="space-y-4">
                {NEWS_ARTICLES.map((article, i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">{article.source}</span>
                        <span className="text-xs text-gray-400">{article.time}</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{article.category}</span>
                      </div>
                      <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold whitespace-nowrap shrink-0">원문 보기 →</a>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{article.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{article.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {article.keywords.map(kw => (
                        <span key={kw} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">#{kw}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                뉴스 더 보기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black mb-1">AI 콘텐츠 인사이트</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              이번 주 급상승 키워드 <strong className="text-white">&#34;미국 관세&#34;</strong>와 <strong className="text-white">&#34;반도체&#34;</strong>가 결합된 콘텐츠가 높은 조회수를 기록 중입니다.
              &#34;관세 전쟁이 삼성·SK하이닉스에 미치는 영향&#34; 같은 심층 분석 콘텐츠 제작을 추천합니다.
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
