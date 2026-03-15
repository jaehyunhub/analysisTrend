'use client';

import { useState } from 'react';

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MONTHLY_SUBS = [
  { month: '1월', count: 820000, new: 12000 },
  { month: '2월', count: 855000, new: 35000 },
  { month: '3월', count: 910000, new: 55000 },
  { month: '4월', count: 965000, new: 55000 },
  { month: '5월', count: 1020000, new: 55000 },
  { month: '6월', count: 1080000, new: 60000 },
  { month: '7월', count: 1100000, new: 20000 },
  { month: '8월', count: 1120000, new: 20000 },
  { month: '9월', count: 1160000, new: 40000 },
  { month: '10월', count: 1185000, new: 25000 },
  { month: '11월', count: 1200000, new: 15000 },
  { month: '12월', count: 1215000, new: 15000 },
];

const TOP_VIDEOS = [
  { title: 'AI 데이터 트렌드 분석 총정리', views: '24.5만', likes: '2.1만', duration: '18:32', published: '2일 전', trend: 'up' },
  { title: '2026 유튜브 알고리즘 완벽 해부', views: '18.3만', likes: '1.8만', duration: '22:14', published: '5일 전', trend: 'up' },
  { title: '쇼츠 vs 롱폼 수익 비교 실험', views: '15.9만', likes: '1.5만', duration: '14:07', published: '1주 전', trend: 'same' },
  { title: '채널 1만 구독자 달성 후기', views: '12.1만', likes: '1.2만', duration: '11:45', published: '2주 전', trend: 'down' },
  { title: '라이브 수익화 완전 가이드', views: '10.8만', likes: '980', duration: '08:59', published: '3주 전', trend: 'down' },
];

const CATEGORY_DIST = [
  { label: '기술/IT', pct: 45, color: 'bg-blue-500' },
  { label: '교육', pct: 25, color: 'bg-purple-500' },
  { label: '엔터테인먼트', pct: 15, color: 'bg-green-500' },
  { label: '게임', pct: 10, color: 'bg-red-500' },
  { label: '기타', pct: 5, color: 'bg-gray-400' },
];

const RISING_KEYWORDS = [
  { tag: '#AI', type: 0 }, { tag: '#머신러닝', type: 1 }, { tag: '#웹개발', type: 2 },
  { tag: '#Next.js', type: 0 }, { tag: '#React19', type: 1 }, { tag: '#데이터시각화', type: 2 },
  { tag: '#빅데이터', type: 0 }, { tag: '#클라우드', type: 1 }, { tag: '#스타트업', type: 2 },
  { tag: '#사이버보안', type: 0 }, { tag: '#자동화', type: 1 }, { tag: '#생성AI', type: 2 },
];

const maxNew = Math.max(...MONTHLY_SUBS.map((d) => d.new));

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<'channel' | 'trend' | 'recent'>('channel');
  const [period, setPeriod] = useState('12개월');

  const TABS = [
    { key: 'channel', label: '내 채널' },
    { key: 'trend', label: '트렌드 분석' },
    { key: 'recent', label: '최근 트렌드' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0e]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">채널 분석</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">채널 성과 모니터링 및 트렌드 탐색</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="bg-white dark:bg-[#1A1A1B] p-1 rounded-xl border border-gray-200 dark:border-[#343536] flex shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Persona Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center shrink-0 text-lg">📊</div>
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">페르소나 C · 채널 운영자</p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
            구독자 증가 추이, 인기 영상 성과, 시청자 반응 트렌드를 한눈에 파악해 콘텐츠 전략을 최적화하세요.
          </p>
        </div>
      </div>

      {/* ── Tab: 내 채널 ──────────────────────────────────────────────────── */}
      {activeTab === 'channel' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '총 구독자', value: '121.5만', delta: '+12.5%', up: true },
              { label: '총 조회수', value: '4,580만', delta: '+8.2%', up: true },
              { label: '시청 시간(시간)', value: '210만', delta: '-1.4%', up: false },
              { label: '평균 시청 시간', value: '8:42', delta: '+0.5%', up: true },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-[#1A1A1B] p-5 rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
                <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                      d={stat.up ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                  </svg>
                  {stat.delta} <span className="text-gray-400 dark:text-gray-500 font-normal">전월 대비</span>
                </p>
              </div>
            ))}
          </div>

          {/* Subscriber Growth + Top Videos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg dark:text-white">구독자 증가 추이</h3>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] text-xs font-bold rounded-lg px-3 py-2 outline-none dark:text-white"
                >
                  <option>12개월</option>
                  <option>6개월</option>
                  <option>90일</option>
                </select>
              </div>
              <div className="h-[260px] flex items-end gap-1.5">
                {MONTHLY_SUBS.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col justify-end gap-0.5 group relative cursor-pointer">
                    <div
                      className="w-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-t-sm transition-all"
                      style={{ height: `${(d.new / maxNew) * 100}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-lg">
                      신규 {d.new.toLocaleString()}명
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-400 font-medium">
                {MONTHLY_SUBS.map((d) => <span key={d.month}>{d.month}</span>)}
              </div>
            </div>

            {/* Top Videos */}
            <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm">
              <h3 className="font-bold text-lg dark:text-white mb-4">인기 영상 TOP 5</h3>
              <div className="space-y-3">
                {TOP_VIDEOS.map((v, i) => (
                  <div key={i} className="flex gap-3 items-center group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-black text-gray-500 dark:text-gray-400 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold dark:text-gray-200 truncate group-hover:text-blue-500 transition-colors">{v.title}</p>
                      <p className="text-xs text-gray-400">{v.duration} · {v.published}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold dark:text-white">{v.views}</div>
                      <div className={`text-[10px] font-semibold ${v.trend === 'up' ? 'text-green-500' : v.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                        {v.trend === 'up' ? '↑ 상승' : v.trend === 'down' ? '↓ 하락' : '─ 유지'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-xs font-bold text-blue-500 border border-blue-100 dark:border-blue-900 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                전체 영상 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: 트렌드 분석 ──────────────────────────────────────────── */}
      {activeTab === 'trend' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Rising Keywords */}
            <div className="flex-1 bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm">
              <h3 className="font-bold text-lg dark:text-white mb-4">급상승 키워드</h3>
              <div className="flex flex-wrap gap-2">
                {RISING_KEYWORDS.map((item, i) => (
                  <span
                    key={i}
                    className={`px-4 py-2 rounded-full text-sm font-bold cursor-pointer transition-all hover:scale-105 ${
                      item.type === 0
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : item.type === 1
                        ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    }`}
                  >
                    {item.tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="flex-1 bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm">
              <h3 className="font-bold text-lg dark:text-white mb-4">카테고리 분포</h3>
              <div className="space-y-4">
                {CATEGORY_DIST.map((cat) => (
                  <div key={cat.label}>
                    <div className="flex justify-between text-xs font-bold mb-1 dark:text-gray-300">
                      <span>{cat.label}</span>
                      <span>{cat.pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#343536] h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 select-none">
              <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI 트렌드 인사이트
              </h3>
              <p className="max-w-2xl opacity-90 text-sm leading-relaxed">
                현재 데이터 기준 <strong>"헬스케어 분야의 생성형 AI 활용"</strong> 주제는 향후 2주 내 검색량 300% 급증이 예상됩니다.
                실제 사례 중심 콘텐츠와 윤리적 논의를 빠르게 제작하면 초기 트래픽을 선점할 수 있습니다.
              </p>
              <button className="mt-4 px-6 py-2 bg-white text-indigo-600 font-bold rounded-full text-sm hover:bg-opacity-90 transition-all shadow-sm">
                스크립트 아이디어 생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: 최근 트렌드 ──────────────────────────────────────────── */}
      {activeTab === 'recent' && (
        <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-100 dark:border-[#343536] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-[#343536] flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-lg dark:text-white">최근 급상승 영상</h3>
            <div className="flex gap-2">
              <select className="bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] text-xs font-bold rounded-lg px-3 py-2 outline-none dark:text-white">
                <option>전 세계</option>
                <option>대한민국</option>
                <option>미국</option>
                <option>일본</option>
              </select>
              <select className="bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] text-xs font-bold rounded-lg px-3 py-2 outline-none dark:text-white">
                <option>전체 카테고리</option>
                <option>기술/IT</option>
                <option>음악</option>
                <option>게임</option>
                <option>교육</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#272729] text-gray-500 dark:text-gray-400">
                <tr>
                  {['순위', '영상', '채널', '조회수', '트렌드 점수', '액션'].map((h, i) => (
                    <th key={h} className={`p-4 font-semibold text-xs uppercase tracking-wide ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#272729] group transition-colors">
                    <td className="p-4 pl-6 text-xl font-black text-gray-200 dark:text-gray-700">#{i + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                        <div className="max-w-[180px]">
                          <p className="font-semibold dark:text-white truncate group-hover:text-blue-500 transition-colors">
                            AI 기술 혁신 #{i + 1} — 2026년 전망
                          </p>
                          <p className="text-xs text-gray-400">4시간 전</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">TechDaily</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold dark:text-white">120만</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        i < 3
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : i < 6
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {i < 3 ? '높음' : i < 6 ? '보통' : '낮음'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-gray-400 hover:text-blue-500 p-2 transition-colors" title="상세 보기">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 flex justify-center">
            <button className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">
              더 불러오기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
