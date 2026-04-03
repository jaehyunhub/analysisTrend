'use client';

import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/shared/api/client';
import { BANNERS } from '@/shared/api/endpoints';
import { useToastStore } from '@/shared/model/toastStore';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  active: boolean;
  displayOrder: number;
}

const EMPTY_FORM = { title: '', subtitle: '', imageUrl: '', active: false, displayOrder: 0 };

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useToastStore((s) => s.addToast);

  const load = async () => {
    try {
      const data = await apiGet<Banner[]>(BANNERS.ADMIN_LIST);
      setBanners(data);
    } catch {
      // API 없을 때 mock 유지
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setImageInputMode('url');
    setIsFormOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditTarget(banner);
    setForm({ title: banner.title, subtitle: banner.subtitle, imageUrl: banner.imageUrl, active: banner.active, displayOrder: banner.displayOrder });
    setImageInputMode(banner.imageUrl?.startsWith('data:') ? 'file' : 'url');
    setIsFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setForm(f => ({ ...f, imageUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      if (editTarget) {
        const updated = await apiPut<Banner>(BANNERS.ADMIN_DETAIL(editTarget.id), form);
        setBanners(prev => prev.map(b => b.id === editTarget.id ? updated : b));
      } else {
        const created = await apiPost<Banner>(BANNERS.ADMIN_LIST, form);
        setBanners(prev => [...prev, created]);
      }
      setIsFormOpen(false);
    } catch (e) {
      console.error(e);
      addToast('저장에 실패했습니다. 이미지 파일이 너무 크거나 네트워크 오류입니다.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('배너를 삭제하시겠습니까?')) return;
    try {
      await apiDelete(BANNERS.ADMIN_DETAIL(id));
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await apiPatch<Banner>(BANNERS.ADMIN_TOGGLE(id), {});
      setBanners(prev => prev.map(b => b.id === id ? updated : b));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">메인 배너 관리</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">메인 페이지 히어로 배너를 관리합니다.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-500/30"
        >
          + 배너 추가
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-200 dark:border-[#343536] shadow-sm">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{editTarget ? '배너 수정' : '배너 추가'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="배너 제목 입력..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">부제목</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="설명 입력..."
              />
            </div>

            {/* 이미지 — URL 또는 파일 첨부 */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-2">이미지</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${imageInputMode === 'url' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#272729] text-gray-500 dark:text-gray-400 border-gray-300 dark:border-[#343536] hover:border-blue-400'}`}
                >
                  URL 직접 입력
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('file')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${imageInputMode === 'file' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#272729] text-gray-500 dark:text-gray-400 border-gray-300 dark:border-[#343536] hover:border-blue-400'}`}
                >
                  파일 직접 첨부
                </button>
              </div>

              {imageInputMode === 'url' ? (
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://... 또는 bg-gradient-to-r from-blue-900..."
                />
              ) : (
                <div
                  className="w-full p-4 rounded-lg border border-dashed border-gray-300 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center gap-3"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {form.imageUrl && form.imageUrl.startsWith('data:') ? '이미지 선택됨 — 클릭하여 변경' : '이미지 파일 선택 (JPG, PNG, GIF, WebP)'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {/* 이미지 미리보기 */}
              {form.imageUrl && (
                <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#343536]">
                  {form.imageUrl.startsWith('http') || form.imageUrl.startsWith('data:') ? (
                    <img
                      src={form.imageUrl}
                      alt="배너 미리보기"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className={`w-full h-40 flex items-center justify-center text-white text-sm font-bold ${form.imageUrl}`}>
                      [CSS 배경 미리보기]
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full text-sm flex items-center justify-center hover:bg-black/80 font-bold"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
                    <p className="text-white text-xs font-semibold">{form.title || '배너 제목'}</p>
                    {form.subtitle && <p className="text-white/80 text-[10px]">{form.subtitle}</p>}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">표시 순서</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
                className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="active" className="text-sm font-medium dark:text-gray-300">즉시 활성화</label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">취소</button>
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold">저장</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">불러오는 중...</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-gray-400">등록된 배너가 없습니다.</div>
        ) : banners.map((banner) => (
          <div key={banner.id} className="bg-white dark:bg-[#1A1A1B] p-4 rounded-xl border border-gray-200 dark:border-[#343536] flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-48 h-24 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
              {banner.imageUrl?.startsWith('http') || banner.imageUrl?.startsWith('data:') ? (
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <span className={`w-full h-full flex items-center justify-center ${banner.imageUrl}`}>[미리보기]</span>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{banner.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{banner.subtitle}</p>
              <p className="text-xs text-gray-400 mt-1">순서: {banner.displayOrder}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleToggle(banner.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  banner.active
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-red-100 hover:text-red-600'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 hover:bg-green-100 hover:text-green-600'
                }`}
              >
                {banner.active ? '활성' : '비활성'}
              </button>
              <div className="flex gap-2">
                <button onClick={() => openEdit(banner)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" aria-label="수정">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(banner.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="삭제">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
