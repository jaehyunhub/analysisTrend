'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/shared/api/client';
import { YOUTUBE } from '@/shared/api/endpoints';
import { useToastStore } from '@/shared/model/toastStore';

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();

  // 1) URL 파라미터 방식 우선 파싱 (youtube.com/watch?v=...)
  try {
    const url = new URL(trimmed);
    const v = url.searchParams.get('v');
    if (v) {
      return YOUTUBE_ID_PATTERN.test(v) ? v : null;
    }
    // youtu.be/{id} 형식
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }
    // youtube.com/embed/{id} 형식
    const embedMatch = url.pathname.match(/\/embed\/([^/?#]+)/);
    if (embedMatch) {
      return YOUTUBE_ID_PATTERN.test(embedMatch[1]) ? embedMatch[1] : null;
    }
    // URL이지만 videoId를 추출할 수 없는 경우
    return null;
  } catch {
    // URL 파싱 실패 → 직접 11자리 ID 입력 여부 확인
  }

  // 2) 순수 11자리 alphanumeric ID 입력
  if (YOUTUBE_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return null;
}

interface YoutubeVideo {
  id: number;
  title: string;
  videoId: string;
  thumbnailUrl?: string;
  duration?: string;
  viewCount?: string;
  displayOrder: number;
}

const EMPTY_FORM = { title: '', videoId: '', thumbnailUrl: '', duration: '', viewCount: '', displayOrder: 0 };

export default function YoutubeManagement() {
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<YoutubeVideo | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToastStore();

  const load = async () => {
    try {
      const data = await apiGet<YoutubeVideo[]>(YOUTUBE.LIST);
      setVideos(data);
    } catch {
      // fallback mock
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (v: YoutubeVideo) => {
    setEditTarget(v);
    setForm({ title: v.title, videoId: v.videoId, thumbnailUrl: v.thumbnailUrl ?? '', duration: v.duration ?? '', viewCount: v.viewCount ?? '', displayOrder: v.displayOrder });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!YOUTUBE_ID_PATTERN.test(form.videoId)) {
      toast.error('유효하지 않은 YouTube URL입니다');
      return;
    }
    try {
      if (editTarget) {
        const updated = await apiPut<YoutubeVideo>(YOUTUBE.ADMIN_DETAIL(editTarget.id), form);
        setVideos(prev => prev.map(v => v.id === editTarget.id ? updated : v));
      } else {
        const created = await apiPost<YoutubeVideo>(YOUTUBE.ADMIN_CREATE, form);
        setVideos(prev => [...prev, created]);
      }
      setIsFormOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('영상을 삭제하시겠습니까?')) return;
    try {
      await apiDelete(YOUTUBE.ADMIN_DETAIL(id));
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">YouTube 영상 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">메인 페이지 영상 그리드를 관리합니다.</p>
        </div>
        <button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-500/30">
          + 영상 추가
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-200 dark:border-[#343536] shadow-sm">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{editTarget ? '영상 수정' : '영상 추가'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { key: 'title', label: '제목 *', placeholder: '영상 제목' },
              { key: 'thumbnailUrl', label: '썸네일 URL', placeholder: 'https://...' },
              { key: 'duration', label: '재생시간', placeholder: '10:35' },
              { key: 'viewCount', label: '조회수', placeholder: '1.2M' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
                <input
                  type="text"
                  value={(form as Record<string, string | number>)[key] as string}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">YouTube 영상 ID *</label>
              <input
                type="text"
                value={form.videoId}
                onChange={e => {
                  const raw = e.target.value;
                  const extracted = extractYoutubeId(raw);
                  if (raw && extracted === null) {
                    toast.error('유효하지 않은 YouTube URL입니다');
                    setForm(f => ({ ...f, videoId: raw }));
                  } else {
                    setForm(f => ({ ...f, videoId: extracted ?? raw }));
                  }
                }}
                placeholder="dQw4w9WgXcQ 또는 YouTube URL 붙여넣기"
                className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            {form.videoId && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 mb-1">썸네일 미리보기</label>
                <img
                  src={form.thumbnailUrl || `https://img.youtube.com/vi/${form.videoId}/mqdefault.jpg`}
                  alt="썸네일 미리보기"
                  className="w-40 aspect-video rounded-lg object-cover border border-gray-200 dark:border-[#343536]"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">표시 순서</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
                className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-500">취소</button>
            <button onClick={handleSave} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold">저장</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">불러오는 중...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-[#272729] border-b border-gray-200 dark:border-[#343536]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">영상 정보</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">통계</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-[#212124] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-32 aspect-video rounded-lg bg-gray-900 relative flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                        <img
                          src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        {video.duration && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded">{video.duration}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2">{video.title}</p>
                        <a href={`https://youtu.be/${video.videoId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 mt-1 hover:underline block">
                          youtu.be/{video.videoId}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono dark:text-gray-300">
                      {video.viewCount && <span className="block">{video.viewCount} views</span>}
                      <span className="text-gray-400 text-xs">순서: {video.displayOrder}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(video)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">수정</button>
                      <button onClick={() => handleDelete(video.id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-gray-400">등록된 영상이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
