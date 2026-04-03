'use client';

import { useState, useRef } from 'react';
import { useAdsStore, type Ad } from '@/shared/model/adsStore';

type AdType = 'gradient' | 'placeholder';

export default function AdsManagement() {
  const { ads, addAd, updateAd, removeAd } = useAdsStore();

  const [adFormOpen, setAdFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Ad | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [form, setForm] = useState<{ title: string; subtitle: string; type: AdType; link: string; imageUrl: string }>({
    title: '',
    subtitle: '',
    type: 'gradient',
    link: '',
    imageUrl: '',
  });
  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openCreate = () => {
    setEditTarget(null);
    setForm({ title: '', subtitle: '', type: 'gradient', link: '', imageUrl: '' });
    setImageInputMode('url');
    setAdFormOpen(true);
  };

  const openEdit = (ad: Ad) => {
    setEditTarget(ad);
    setForm({ title: ad.title, subtitle: ad.subtitle ?? '', type: ad.type ?? 'gradient', link: ad.link ?? '', imageUrl: ad.imageUrl ?? '' });
    setImageInputMode(ad.imageUrl?.startsWith('data:') ? 'file' : 'url');
    setAdFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">사이드바 광고 관리</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">우측 사이드바에 표시되는 광고 블록을 관리합니다.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-500/30"
        >
          + 광고 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="relative group bg-white dark:bg-[#1A1A1B] p-4 rounded-xl border border-gray-200 dark:border-[#343536] hover:shadow-lg transition-all hover:scale-[1.02]">

             {/* Preview of the Ad Component */}
             <div className="mb-4 pointer-events-none select-none transform scale-95 origin-center bg-gray-50 dark:bg-[#09090b] p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                 <p className="text-[10px] text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wider font-bold">미리보기</p>
                 <div className="bg-white dark:bg-[#1A1A1B] p-3 rounded-xl border border-gray-200 dark:border-[#343536] shadow-sm w-[160px] mx-auto">
                    <div className={`w-full h-[140px] rounded-lg mb-2 flex flex-col items-center justify-center text-center p-2 overflow-hidden
                        ${!ad.imageUrl && ad.type === 'gradient' ? `bg-gradient-to-br ${ad.color} text-white` : ''}
                        ${!ad.imageUrl && ad.type === 'placeholder' ? 'bg-gray-100 dark:bg-[#272729] text-gray-400 border border-dashed border-gray-300 dark:border-gray-700' : ''}
                    `}>
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <>
                            <span className="font-black text-lg">{ad.title}</span>
                            {ad.type === 'gradient' && <span className="text-xs opacity-90">분석 서비스</span>}
                            {ad.type === 'placeholder' && <span className="text-xs">광고 문의</span>}
                          </>
                        )}
                    </div>
                    <p className="text-center text-sm font-bold text-gray-900 dark:text-white">{ad.subtitle}</p>
                </div>
             </div>

             <div className="space-y-2">
                 <div className="flex justify-between items-center">
                     <span className="text-sm font-bold text-gray-900 dark:text-white">{ad.title}</span>
                     <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#272729] px-2 py-1 rounded">{ad.type}</span>
                 </div>
                 <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{ad.link}</p>
                 {ad.imageUrl && (
                   <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     이미지 첨부됨
                   </p>
                 )}
                 <div className="flex items-center justify-between pt-1">
                   <span className="text-xs text-gray-500 dark:text-gray-400">홈 표시</span>
                   <button
                     onClick={() => updateAd(ad.id, { active: ad.active === false ? true : false })}
                     className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${ad.active !== false ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                     aria-label="광고 활성화 토글"
                   >
                     <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${ad.active !== false ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                   </button>
                 </div>
             </div>

             <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(ad)}
                  className="p-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-gray-200 dark:border-[#343536] hover:text-blue-500"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button
                  onClick={() => setDeleteTargetId(ad.id)}
                  className="p-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-gray-200 dark:border-[#343536] hover:text-red-500"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
             </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button
          onClick={openCreate}
          className="border-2 border-dashed border-gray-200 dark:border-[#343536] rounded-xl flex flex-col items-center justify-center p-6 text-gray-400 hover:text-green-500 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all min-h-[300px]"
        >
            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="font-bold">새 광고 블록 추가</span>
        </button>
      </div>

      {/* Form 모달 (추가 / 수정 겸용) */}
      {adFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl p-6 w-[420px] max-h-[90vh] overflow-y-auto flex flex-col gap-4 border border-gray-200 dark:border-[#343536]">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{editTarget ? '광고 수정' : '광고 추가'}</h3>
            <div className="flex flex-col gap-3">
              <input
                placeholder="제목"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#343536] bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
              <input
                placeholder="부제목"
                value={form.subtitle}
                onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#343536] bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as AdType }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#343536] bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
              >
                <option value="gradient">그라디언트</option>
                <option value="placeholder">플레이스홀더</option>
              </select>
              <input
                placeholder="링크 (선택)"
                value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#343536] bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />

              {/* 이미지 입력 — URL 또는 파일 첨부 */}
              <div>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => { setImageInputMode('url'); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${imageInputMode === 'url' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#272729] text-gray-500 dark:text-gray-400 border-gray-300 dark:border-[#343536] hover:border-blue-400'}`}
                  >
                    URL 입력
                  </button>
                  <button
                    type="button"
                    onClick={() => { setImageInputMode('file'); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${imageInputMode === 'file' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#272729] text-gray-500 dark:text-gray-400 border-gray-300 dark:border-[#343536] hover:border-blue-400'}`}
                  >
                    파일 첨부
                  </button>
                </div>

                {imageInputMode === 'url' ? (
                  <input
                    placeholder="이미지 URL (선택)"
                    value={form.imageUrl}
                    onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#343536] bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                  />
                ) : (
                  <div
                    className="w-full px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>{form.imageUrl && form.imageUrl.startsWith('data:') ? '이미지 선택됨 (클릭하여 변경)' : '이미지 파일 선택...'}</span>
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
                  <div className="mt-2 relative">
                    <img
                      src={form.imageUrl}
                      alt="미리보기"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-[#343536]"
                    />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/80"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setAdFormOpen(false)}
                className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-[#343536] text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (!form.title.trim()) return;
                  const defaultColor = form.type === 'gradient' ? 'from-indigo-500 to-purple-600' : 'bg-gray-100';
                  if (editTarget) {
                    updateAd(editTarget.id, { ...form });
                  } else {
                    addAd({ color: defaultColor, ...form });
                  }
                  setAdFormOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete 확인 모달 */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl p-6 w-80 flex flex-col gap-4 border border-gray-200 dark:border-[#343536]">
            <h3 className="text-base font-bold text-gray-900 dark:text-white text-center">이 광고를 삭제하시겠습니까?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-[#343536] text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => { removeAd(deleteTargetId); setDeleteTargetId(null); }}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
