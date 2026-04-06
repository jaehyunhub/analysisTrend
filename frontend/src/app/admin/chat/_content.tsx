'use client';

import { useState, useEffect, useRef } from 'react';
import { analysisPostForm } from '@/shared/api/client';

// ── Types ─────────────────────────────────────────────────────────────────────
interface HeatmapBucket { timestamp: string; count: number; normalized: number; }
interface PeakSegment { start: string; end: string; peak_count: number; keywords: string[]; }
interface KeywordTimeline {
  keyword: string;
  timeline: HeatmapBucket[];
  timestamps: string[]; // 키워드가 등장한 분 단위 타임스탬프
}
interface ChatAnalysisResult {
  session_id: string;
  total_messages: number;
  heatmap: HeatmapBucket[];
  peaks: PeakSegment[];
  top_keywords: string[];
  keyword_timelines: KeywordTimeline[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getBarColor(normalized: number): string {
  if (normalized > 0.8) return 'bg-red-500';
  if (normalized > 0.6) return 'bg-orange-400';
  if (normalized > 0.4) return 'bg-yellow-400';
  if (normalized > 0.2) return 'bg-green-400';
  return 'bg-blue-300';
}

function getKeywordBarColor(idx: number): string {
  const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
  return colors[idx % colors.length];
}

/** "HH:MM" → "HH:MM:00" (분 단위 버킷에 초 표기 추가) */
function toHMS(ts: string): string {
  const parts = ts.split(':');
  if (parts.length === 2) return `${ts}:00`;
  return ts;
}

/** "HH:MM" → "HH:MM:59" (분 단위 버킷의 끝을 :59초로 표시) */
function toHMSEnd(ts: string): string {
  const parts = ts.split(':');
  if (parts.length === 2) return `${ts}:59`;
  return ts;
}

/** heatmap 버킷 배열로 총 분석 시간을 "N시간 N분" 형식으로 반환 */
function formatDuration(heatmap: HeatmapBucket[]): string {
  if (heatmap.length === 0) return '-';
  const [fh, fm] = heatmap[0].timestamp.split(':').map(Number);
  const [lh, lm] = heatmap[heatmap.length - 1].timestamp.split(':').map(Number);
  const totalMin = (lh * 60 + lm) - (fh * 60 + fm);
  if (totalMin <= 0) return `${heatmap.length}분`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

// ── Upload Zone ───────────────────────────────────────────────────────────────
function UploadZone({ onFileLoaded }: { onFileLoaded: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="채팅 파일 업로드 영역. 클릭하거나 파일을 드래그하세요."
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFileLoaded(f); }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all
        ${dragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'}`}
    >
      <input ref={inputRef} type="file" accept=".csv,.json,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileLoaded(f); }} aria-hidden="true" />
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">채팅 파일을 드래그하거나 클릭하여 업로드</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">YouTube Live 채팅 내보내기 · CSV / JSON / TXT</p>
        </div>
        <div className="flex gap-2 mt-1">
          {['CSV', 'JSON', 'TXT'].map((ext) => (
            <span key={ext} className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">.{ext}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Scrollable Heatmap Chart ──────────────────────────────────────────────────
function HeatmapChart({ buckets, colorFn }: { buckets: HeatmapBucket[]; colorFn?: (n: number) => string }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const maxCount = Math.max(...buckets.map((d) => d.count), 1);
  const getColor = colorFn ?? getBarColor;

  // 라벨 표시 간격: 전체 버킷 수에 따라 조정
  const labelInterval = buckets.length <= 30 ? 5 : buckets.length <= 90 ? 15 : 30;
  const barWidth = Math.max(6, Math.min(14, Math.floor(800 / buckets.length)));

  return (
    <>
      {/* fixed 포지션 tooltip — overflow 클리핑 완전 우회 */}
      {tooltip && (
        <div
          className="fixed z-[9999] px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none shadow-lg"
          style={{ left: tooltip.x + 10, top: tooltip.y - 32 }}
        >
          {tooltip.text}
        </div>
      )}
      <div style={{ overflowX: 'auto' }} className="pb-1">
        <div style={{ minWidth: `${buckets.length * (barWidth + 2)}px` }}>
          {/* 막대 차트 */}
          <div className="flex items-end h-32" style={{ gap: '2px' }}>
            {buckets.map((d, idx) => (
              <div
                key={idx}
                className="relative flex flex-col justify-end cursor-pointer shrink-0"
                style={{ width: `${barWidth}px`, height: '100%' }}
                onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: `${toHMS(d.timestamp)} · ${d.count}개` })}
                onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: `${toHMS(d.timestamp)} · ${d.count}개` })}
                onMouseLeave={() => setTooltip(null)}
              >
                <div
                  className={`w-full rounded-t-sm transition-all ${getColor(d.normalized)} hover:opacity-70`}
                  style={{ height: `${(d.count / maxCount) * 100}%` }}
                />
              </div>
            ))}
          </div>
          {/* X축 라벨 */}
          <div className="flex mt-1" style={{ gap: '2px' }}>
            {buckets.map((d, idx) => (
              <div
                key={idx}
                className="shrink-0 relative"
                style={{ width: `${barWidth}px`, height: '16px' }}
              >
                {idx % labelInterval === 0 && (
                  <span className="absolute left-0 text-gray-400 dark:text-gray-500 whitespace-nowrap" style={{ fontSize: '8px', transform: 'translateX(-50%)' }}>
                    {d.timestamp}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Content ───────────────────────────────────────────────────────────────
export default function ChatContent() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [searchKeywords, setSearchKeywords] = useState('');
  const [result, setResult] = useState<ChatAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'peaks' | 'keywords'>('heatmap');
  const [selectedPeak, setSelectedPeak] = useState<number | null>(null);
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);

  const analyzeFixedFile = async (keywords?: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('filename', '슈카월드라이브20260406.json');
      if (keywords?.trim()) formData.append('search_keywords', keywords.trim());
      const data = await analysisPostForm<ChatAnalysisResult>('/analyze/chat/preset', formData);
      setResult(data);
      setActiveTab('heatmap');
    } catch (e) {
      setError(e instanceof Error ? e.message : '기본 파일 분석에 실패했습니다.');
    } finally {
      setAnalyzing(false);
    }
  };

  // 페이지 진입 시 고정 파일 자동 분석
  useEffect(() => { analyzeFixedFile(); }, []);

  const handleFileLoaded = (file: File) => {
    setUploadedFile(file);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      if (searchKeywords.trim()) {
        formData.append('search_keywords', searchKeywords.trim());
      }
      const data = await analysisPostForm<ChatAnalysisResult>('/analyze/chat', formData);
      const isFirstAnalysis = !result;
      setResult(data);
      // 최초 분석 시에만 히트맵 탭으로 이동, 재분석 시 현재 탭 유지
      if (isFirstAnalysis) setActiveTab('heatmap');
    } catch (e) {
      setError(e instanceof Error ? e.message : '분석에 실패했습니다.');
    } finally {
      setAnalyzing(false);
    }
  };

  // 히트맵 탭용: 항상 피크 기반 CSV (시간 순서)
  const handleDownloadPeakCSV = () => {
    if (!result) return;
    const header = 'start,end,peak_count\n';
    const rows = result.peaks.map((p) =>
      `${toHMS(p.start)},${toHMSEnd(p.end)},${p.peak_count}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'peak_markers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 키워드 탭용: 개별 타임스탬프 기반 CSV
  const handleDownloadKeywordCSV = () => {
    if (!result || searchTimelines.length === 0) return;
    const header = 'keyword,timestamp\n';
    const rows = searchTimelines.flatMap((tl) =>
      tl.timestamps.map((ts) => `"${tl.keyword}",${ts}`)
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword_markers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHeatmapCSV = () => {
    if (!result) return;
    const header = 'timestamp,count\n';
    const rows = result.heatmap.map((b) => `${toHMS(b.timestamp)},${b.count}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heatmap_timeline.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 검색 키워드 timelines (결과에서 검색 키워드 우선)
  const searchKwList = searchKeywords.split(',').map((k) => k.trim()).filter(Boolean);
  const searchTimelines = result?.keyword_timelines.filter((t) =>
    searchKwList.some((k) => k.toLowerCase() === t.keyword.toLowerCase())
  ) ?? [];
  const timeRange = result && result.heatmap.length > 0
    ? formatDuration(result.heatmap)
    : null;

  const TABS = [
    { key: 'heatmap', label: '채팅 히트맵' },
    { key: 'peaks', label: '피크 구간' },
    { key: 'keywords', label: `키워드 타임라인${searchTimelines.length > 0 ? ` (${searchTimelines.length})` : ''}` },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0e] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">채팅 분석</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">라이브 채팅 데이터로 편집 포인트를 자동 감지합니다</p>
          </div>
        </div>
      </div>

      {/* Persona Banner */}
      <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-2xl mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center shrink-0 text-lg" aria-hidden="true">🎬</div>
        <div>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            라이브 채팅을 업로드하면 채팅 밀도 히트맵, 피크 구간, 반응 키워드를 자동으로 분석합니다.
            검색 키워드를 입력하면 해당 키워드가 폭발한 구간만 추려서 확인할 수 있습니다.
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-500 mt-1.5">
            현재 표시된 결과는 <span className="font-semibold">슈카월드 생방송 20260406 방영분</span> 라이브 채팅을 기준으로 분석한 내용입니다.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-[#1a1a1b] rounded-2xl border border-gray-200 dark:border-[#343536] p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">채팅 파일 업로드</h2>
          <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-700/50">
            슈카월드 생방송 20260405 방영분 분석
          </span>
        </div>
        <UploadZone onFileLoaded={handleFileLoaded} />

        {/* 키워드 검색 입력 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            검색 키워드 <span className="text-gray-400 font-normal">(선택사항 · 쉼표로 구분)</span>
          </label>
          <input
            type="text"
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
            placeholder="예: ㅋㅋㅋ, 경제, 주식, 대박"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            입력한 키워드가 등장하는 모든 시간대를 타임라인으로 표시합니다
          </p>
        </div>

        {/* 고정 파일 재분석 버튼 (파일 업로드 없이) */}
        {!uploadedFile && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => analyzeFixedFile(searchKeywords)}
              disabled={analyzing}
              className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg transition-colors flex items-center gap-2"
              aria-busy={analyzing}
            >
              {analyzing ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  분석 중...
                </>
              ) : '재분석'}
            </button>
          </div>
        )}

        {uploadedFile && (
          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#272729] rounded-xl border border-gray-200 dark:border-[#343536]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadedFile.name}</span>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-4 py-1.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg transition-colors flex items-center gap-2"
              aria-busy={analyzing}
            >
              {analyzing ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  분석 중...
                </>
              ) : '분석 시작'}
            </button>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">{error}</div>
        )}

        {/* Quick stats */}
        {result && (
          <>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[
                { label: '총 채팅 수', value: result.total_messages.toLocaleString(), color: 'text-purple-600 dark:text-purple-400' },
                { label: '피크 구간', value: `${result.peaks.length}개`, color: 'text-red-600 dark:text-red-400' },
                { label: '분석 범위', value: timeRange ?? '-', color: 'text-blue-600 dark:text-blue-400' },
                { label: '검색 키워드', value: `${searchTimelines.length}개`, color: 'text-green-600 dark:text-green-400' },
              ].map((stat) => (
                <div key={stat.label} className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl text-center border border-gray-200 dark:border-[#343536]">
                  <p className={`text-lg font-bold ${stat.color} truncate`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Analysis Results */}
      {result && (
        <>
          {/* Tabs */}
          <div className="bg-white dark:bg-[#1a1a1b] rounded-2xl border border-gray-200 dark:border-[#343536] shadow-sm mb-6 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-[#343536]" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors
                    ${activeTab === tab.key
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* ── 히트맵 탭 ─────────────────────────────────────────────── */}
              {activeTab === 'heatmap' && (
                <div role="tabpanel" aria-label="채팅 히트맵">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">분 단위 채팅 밀도 (빨간색 = 피크)</p>
                      {timeRange && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          총 분석 시간: {timeRange} · {result.heatmap.length}분 버킷
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="w-3 h-3 rounded-sm bg-blue-300 inline-block" />낮음
                      <span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" />중간
                      <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />피크
                    </div>
                  </div>

                  <HeatmapChart buckets={result.heatmap} />

                  {/* 피크 마커 */}
                  <div className="mt-4 flex gap-2 flex-wrap" data-testid="peak-list">
                    {result.peaks.map((p, i) => (
                      <div key={i} data-testid="peak-item" className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-full text-xs font-medium text-red-700 dark:text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {toHMS(p.start)} – {toHMSEnd(p.end)} · {p.peak_count}개
                      </div>
                    ))}
                  </div>

                  {/* 피크 감지 기준 안내 */}
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-[#272729] rounded-xl text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-600 dark:text-gray-300">피크 감지 기준:</span>{' '}
                    분당 채팅 수가 <span className="font-mono">평균 + 1.5 × 표준편차</span>를 초과하는 구간을 피크로 탐지합니다.
                    연속된 피크 버킷은 하나의 구간으로 병합됩니다.{' '}
                    <span className="text-gray-400">표준편차(σ)는 분당 채팅 수들이 평균으로부터 얼마나 퍼져 있는지를 나타내며, σ가 클수록 피크 임계값이 높아집니다.</span>
                  </div>

                  {/* 편집 마커 내보내기 — 히트맵/피크 기준 */}
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#343536]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">편집 마커 내보내기</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">피크 구간 기준 CSV — DaVinci Resolve / Premiere Pro에 임포트하세요</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDownloadHeatmapCSV}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          전체 타임라인
                        </button>
                        <button
                          onClick={handleDownloadPeakCSV}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          피크 구간 CSV
                        </button>
                      </div>
                    </div>
                    {result.peaks.length > 0 ? (
                      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#343536]">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-[#272729]">
                            <tr>
                              {['시작', '종료', '최대 채팅 수/분'].map((h) => (
                                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide" scope="col">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
                            {result.peaks.map((p, i) => (
                              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                                <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-200">{toHMS(p.start)}</td>
                                <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-200">{toHMSEnd(p.end)}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.peak_count.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">감지된 피크 구간이 없습니다.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── 피크 구간 탭 ──────────────────────────────────────────── */}
              {activeTab === 'peaks' && (
                <div role="tabpanel" aria-label="피크 구간" className="max-h-[640px] overflow-y-auto space-y-4 pr-1">
                  {result.peaks.length === 0 && (
                    <p className="text-center text-gray-400 py-8">감지된 피크 구간이 없습니다.</p>
                  )}
                  {[...result.peaks].sort((a, b) => b.peak_count - a.peak_count).map((peak, i) => {
                    const maxPeak = Math.max(...result.peaks.map(p => p.peak_count), 1);
                    const intensity = Math.round((peak.peak_count / maxPeak) * 100);
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedPeak(selectedPeak === i ? null : i)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedPeak(selectedPeak === i ? null : i)}
                        tabIndex={0}
                        role="button"
                        aria-expanded={selectedPeak === i}
                        className={`p-4 rounded-xl border cursor-pointer transition-all
                          ${selectedPeak === i
                            ? 'border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-[#343536] hover:border-purple-300 dark:hover:border-purple-600'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-400' : 'bg-yellow-400'}`}>
                              #{i + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">피크 구간 #{i + 1}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{toHMS(peak.start)} → {toHMSEnd(peak.end)}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{peak.peak_count.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">최대 채팅 수/분</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-400' : 'bg-yellow-400'}`} style={{ width: `${intensity}%` }} />
                          </div>
                        </div>
                        {selectedPeak === i && peak.keywords.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#343536]">
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-1">
                              주요 반응:
                              {peak.keywords.map((kw) => (
                                <span key={kw} className="ml-1 px-2 py-0.5 bg-white dark:bg-[#272729] rounded-full text-xs border border-gray-200 dark:border-[#343536] font-medium text-gray-700 dark:text-gray-300">{kw}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── 키워드 타임라인 탭 ────────────────────────────────────── */}
              {activeTab === 'keywords' && (
                <div role="tabpanel" aria-label="키워드 타임라인">
                  {/* 검색 키워드 섹션 */}
                  {searchTimelines.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                        검색 키워드 타임라인
                      </p>
                      <div className="space-y-4">
                        {searchTimelines.map((tl, idx) => {
                          const totalCount = tl.timeline.reduce((s, b) => s + b.count, 0);
                          const isExpanded = expandedKeyword === tl.keyword;
                          const barColor = getKeywordBarColor(idx);
                          const maxBucket = Math.max(...tl.timeline.map(b => b.count), 1);
                          const coloredBuckets = tl.timeline.map(b => ({
                            ...b,
                            normalized: b.count / maxBucket,
                          }));

                          return (
                            <div key={tl.keyword} className="border border-purple-200 dark:border-purple-800/50 rounded-xl overflow-hidden">
                              <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-purple-800 dark:text-purple-300">"{tl.keyword}"</span>
                                  <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full font-medium">{totalCount}회</span>
                                  <span className="text-xs text-purple-600 dark:text-purple-400">{tl.timestamps.length}회 등장</span>
                                </div>
                                <button
                                  onClick={() => setExpandedKeyword(isExpanded ? null : tl.keyword)}
                                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                                >
                                  {isExpanded ? '타임스탬프 접기' : `전체 ${tl.timestamps.length}건 보기`}
                                </button>
                              </div>
                              <div className="p-4">
                                <HeatmapChart
                                  buckets={coloredBuckets}
                                  colorFn={() => barColor}
                                />
                                {isExpanded && (
                                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#343536]">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">"{tl.keyword}" 개별 등장 타임스탬프</p>
                                      <button
                                        onClick={() => navigator.clipboard.writeText(tl.timestamps.join(', '))}
                                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        전체 복사
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                                      {tl.timestamps.map((ts, i) => (
                                        <span
                                          key={i}
                                          className="px-2 py-0.5 font-mono text-xs bg-white dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-default"
                                        >
                                          {ts}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 편집 마커 내보내기 — 키워드 개별 타임스탬프 기준 */}
                  {searchTimelines.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#343536]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">편집 마커 내보내기</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">키워드 개별 등장 타임스탬프 기준 CSV</p>
                        </div>
                        <button
                          onClick={handleDownloadKeywordCSV}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          키워드 마커 CSV
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 dark:border-[#343536]">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-[#272729] sticky top-0">
                            <tr>
                              {['키워드', '타임스탬프'].map((h) => (
                                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide" scope="col">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
                            {searchTimelines.flatMap((tl) =>
                              tl.timestamps.map((ts, i) => ({ keyword: tl.keyword, ts, key: `${tl.keyword}-${i}` }))
                            ).map((row) => (
                              <tr key={row.key} className="hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                                <td className="px-4 py-2.5 font-medium text-purple-700 dark:text-purple-300">"{row.keyword}"</td>
                                <td className="px-4 py-2.5 font-mono text-gray-800 dark:text-gray-200">{row.ts}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {searchTimelines.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      <p>키워드 데이터가 없습니다.</p>
                      <p className="text-xs mt-1">위에서 검색 키워드를 입력 후 다시 분석하세요.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </>
      )}

      {/* 초기 로딩 스피너 */}
      {analyzing && !result && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg className="w-8 h-8 mx-auto mb-3 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">채팅 데이터 분석 중...</p>
        </div>
      )}
    </div>
  );
}
