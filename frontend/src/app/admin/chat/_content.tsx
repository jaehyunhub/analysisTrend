'use client';

import { useState, useRef } from 'react';
import { analysisPostForm } from '@/shared/api/client';

// ── Types ─────────────────────────────────────────────────────────────────────
interface HeatmapBucket { timestamp: string; count: number; normalized: number; }
interface PeakSegment { start: string; end: string; peak_count: number; keywords: string[]; }
interface ChatAnalysisResult {
  session_id: string;
  total_messages: number;
  heatmap: HeatmapBucket[];
  peaks: PeakSegment[];
  top_keywords: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBarColor(normalized: number): string {
  if (normalized > 0.8) return 'bg-red-500';
  if (normalized > 0.6) return 'bg-orange-400';
  if (normalized > 0.4) return 'bg-yellow-400';
  if (normalized > 0.2) return 'bg-green-400';
  return 'bg-blue-300';
}


// ── Components ────────────────────────────────────────────────────────────────
function UploadZone({ onFileLoaded }: { onFileLoaded: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileLoaded(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileLoaded(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="채팅 파일 업로드 영역. 클릭하거나 파일을 드래그하세요."
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all
        ${dragging
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
        }`}
    >
      <input ref={inputRef} type="file" accept=".csv,.json,.txt" className="hidden" onChange={handleChange} aria-hidden="true" />
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">채팅 파일을 드래그하거나 클릭하여 업로드</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">YouTube Live 채팅 내보내기 · CSV / JSON / TXT</p>
        </div>
        <div className="flex gap-2 mt-1">
          {['CSV', 'JSON', 'TXT'].map((ext) => (
            <span key={ext} className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
              .{ext}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Content ───────────────────────────────────────────────────────────────
export default function ChatContent() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ChatAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'peaks' | 'keywords'>('heatmap');
  const [selectedPeak, setSelectedPeak] = useState<number | null>(null);

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
      const data = await analysisPostForm<ChatAnalysisResult>('/analyze/chat', formData);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '분석에 실패했습니다.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    const header = 'start,end,peak_count,keywords\n';
    const rows = result.peaks.map((p) => `${p.start},${p.end},${p.peak_count},"${p.keywords.join(',')}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edit_markers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const heatmapMax = result ? Math.max(...result.heatmap.map((d) => d.count), 1) : 1;

  const TABS = [
    { key: 'heatmap', label: '채팅 히트맵' },
    { key: 'peaks', label: '피크 구간' },
    { key: 'keywords', label: '키워드 타임라인' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0e] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
          <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">페르소나 D · 영상 편집자</p>
          <p className="text-sm text-purple-700 dark:text-purple-400 mt-0.5">
            라이브 채팅을 업로드하면 채팅 밀도 히트맵, 피크 구간, 반응 키워드를 자동으로 분석해 드립니다.
            피크 구간을 편집 마커로 내보내 영상 편집에 바로 활용하세요.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-[#1a1a1b] rounded-2xl border border-gray-200 dark:border-[#343536] p-6 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">채팅 파일 업로드</h2>
        <UploadZone onFileLoaded={handleFileLoaded} />

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

        {/* Quick stats row when analyzed */}
        {result && (
          <>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[
                { label: '총 채팅 수', value: result.total_messages.toLocaleString(), color: 'text-purple-600 dark:text-purple-400' },
                { label: '피크 구간', value: `${result.peaks.length}개`, color: 'text-red-600 dark:text-red-400' },
                { label: '분석 버킷', value: `${result.heatmap.length}개`, color: 'text-blue-600 dark:text-blue-400' },
                { label: '주요 키워드', value: `${result.top_keywords.length}개`, color: 'text-green-600 dark:text-green-400' },
              ].map((stat) => (
                <div key={stat.label} className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl text-center border border-gray-200 dark:border-[#343536]">
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            {result.top_keywords.length > 0 && (
              <div data-testid="keyword-list" className="mt-3 flex flex-wrap gap-1.5">
                {result.top_keywords.map((kw) => (
                  <span key={kw} className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full font-medium">{kw}</span>
                ))}
              </div>
            )}
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
              {/* Heatmap Tab */}
              {activeTab === 'heatmap' && (
                <div role="tabpanel" aria-label="채팅 히트맵">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">분 단위 채팅 밀도 (빨간색 = 피크)</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="w-3 h-3 rounded-sm bg-blue-300 inline-block" aria-hidden="true" />낮음
                      <span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" aria-hidden="true" />중간
                      <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" aria-hidden="true" />피크
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="flex items-end gap-0.5 h-40 w-full" role="img" aria-label="채팅 밀도 막대 그래프" data-testid="heatmap">
                    {result.heatmap.map((d, idx) => (
                      <div
                        key={idx}
                        className="group relative flex-1 flex flex-col justify-end cursor-pointer"
                        title={`${d.timestamp}: ${d.count}개`}
                      >
                        <div
                          className={`w-full rounded-t-sm transition-all ${getBarColor(d.normalized)} group-hover:opacity-80`}
                          style={{ height: `${(d.count / heatmapMax) * 100}%` }}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                          {d.timestamp} · {d.count}개
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Peak markers */}
                  <div className="mt-4 flex gap-2 flex-wrap" data-testid="peak-list">
                    {result.peaks.map((p, i) => (
                      <div key={i} data-testid="peak-item" className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-full text-xs font-medium text-red-700 dark:text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
                        {p.start} – {p.end} · {p.peak_count}개
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Peaks Tab */}
              {activeTab === 'peaks' && (
                <div role="tabpanel" aria-label="피크 구간" className="space-y-4">
                  {result.peaks.map((peak, i) => {
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
                        aria-label={`피크 구간 ${i + 1}: ${peak.start}부터 ${peak.end}까지, 최대 채팅 수 ${peak.peak_count}`}
                        className={`p-4 rounded-xl border cursor-pointer transition-all
                          ${selectedPeak === i
                            ? 'border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-[#343536] hover:border-purple-300 dark:hover:border-purple-600'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0
                              ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-400' : 'bg-yellow-400'}`} aria-hidden="true">
                              #{i + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">피크 구간 #{i + 1}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{peak.start} → {peak.end}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{peak.peak_count.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">최대 채팅 수</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-400' : 'bg-yellow-400'}`}
                              style={{ width: `${intensity}%` }}
                              role="progressbar"
                              aria-valuenow={intensity}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </div>

                        {selectedPeak === i && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#343536]">
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-1">
                              주요 반응:
                              {peak.keywords.map((kw) => (
                                <span key={kw} className="ml-1 px-2 py-0.5 bg-white dark:bg-[#272729] rounded-full text-xs border border-gray-200 dark:border-[#343536] font-medium text-gray-700 dark:text-gray-300">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Keywords Tab */}
              {activeTab === 'keywords' && (
                <div role="tabpanel" aria-label="키워드 타임라인">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">상위 키워드</p>
                  <div className="flex flex-wrap gap-2">
                    {result.top_keywords.map((kw, i) => (
                      <span
                        key={kw}
                        className={`px-3 py-1.5 rounded-full font-semibold border text-sm
                          ${i < 3 ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                            : i < 7 ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}
                      >
                        #{i + 1} {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-white dark:bg-[#1a1a1b] rounded-2xl border border-gray-200 dark:border-[#343536] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">편집 마커 내보내기</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  피크 구간을 CSV로 저장해 DaVinci Resolve / Premiere Pro에 임포트하세요
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCSV}
                  aria-label="편집 마커 CSV 파일 다운로드"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV 다운로드
                </button>
                <button
                  aria-label="분석 결과 공유"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  공유
                </button>
              </div>
            </div>

            {/* Preview table */}
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-[#343536]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#272729]">
                  <tr>
                    {['시작', '종료', '최대 채팅 수', '키워드'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide" scope="col">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
                  {result.peaks.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-200">{p.start}</td>
                      <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-200">{p.end}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.peak_count.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.keywords.slice(0, 3).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty state when no file */}
      {!uploadedFile && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">채팅 파일을 업로드하면 분석 결과가 표시됩니다</p>
        </div>
      )}
    </div>
  );
}
