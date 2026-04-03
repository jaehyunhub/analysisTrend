'use client';

import { useState, useRef } from 'react';
import { apiPost } from '@/shared/api/client';
import { useToastStore } from '@/shared/model/toastStore';

const BANNER_COLORS = [
  { label: '블루', value: 'from-blue-500 to-blue-700', preview: 'bg-blue-600' },
  { label: '퍼플', value: 'from-purple-500 to-purple-700', preview: 'bg-purple-600' },
  { label: '그린', value: 'from-green-500 to-green-700', preview: 'bg-green-600' },
  { label: '레드', value: 'from-red-500 to-red-700', preview: 'bg-red-600' },
  { label: '오렌지', value: 'from-orange-500 to-orange-700', preview: 'bg-orange-600' },
  { label: '핑크', value: 'from-pink-500 to-pink-700', preview: 'bg-pink-600' },
  { label: '인디고', value: 'from-indigo-500 to-indigo-700', preview: 'bg-indigo-600' },
  { label: '티얼', value: 'from-teal-500 to-teal-700', preview: 'bg-teal-600' },
];

type ImageMode = 'color' | 'url' | 'file';

interface CreateCommunityForm {
  name: string;
  slug: string;
  description: string;
  bannerColor: string;
  bannerImage: string; // URL 또는 base64
}

const EMPTY_FORM: CreateCommunityForm = {
  name: '',
  slug: '',
  description: '',
  bannerColor: BANNER_COLORS[0].value,
  bannerImage: '',
};

export default function CommunityCreatePage() {
  const [form, setForm] = useState<CreateCommunityForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageMode, setImageMode] = useState<ImageMode>('color');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useToastStore((s) => s.addToast);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-가-힣]/g, '')
      .slice(0, 50);
    setForm((prev) => ({ ...prev, name, slug }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setForm((f) => ({ ...f, bannerImage: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('커뮤니티 이름을 입력해주세요.', 'error');
      return;
    }
    if (!form.slug.trim()) {
      addToast('Slug를 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost('/api/v1/communities', {
        name: form.name.trim(),
        description: form.description.trim(),
        bannerColor: imageMode === 'color' ? form.bannerColor : undefined,
        bannerImage: imageMode !== 'color' ? form.bannerImage : undefined,
      });
      addToast(`커뮤니티 "${form.name}"가 생성되었습니다.`, 'success');
      setForm(EMPTY_FORM);
      setImageMode('color');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '커뮤니티 생성에 실패했습니다. API 엔드포인트를 확인해주세요.';
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 배너 미리보기 렌더링
  const BannerPreview = () => {
    if (imageMode !== 'color' && form.bannerImage) {
      return (
        <div className="relative h-24 overflow-hidden">
          <img src={form.bannerImage} alt="배너 미리보기" className="w-full h-full object-cover" />
        </div>
      );
    }
    return <div className={`h-24 bg-gradient-to-r ${form.bannerColor}`} aria-hidden="true" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">커뮤니티 생성</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">새 커뮤니티를 생성합니다. 이름, Slug, 설명, 배너를 설정하세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] p-6 space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="community-name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                커뮤니티 이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="community-name"
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="예: 기술 트렌드 이야기"
                maxLength={50}
                required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#343536] rounded-xl bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">{form.name.length}/50자</p>
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="community-slug" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Slug (URL 경로) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 dark:text-gray-500 shrink-0">/community/board/</span>
                <input
                  id="community-slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-가-힣]/g, '').slice(0, 50) }))}
                  placeholder="tech-trends"
                  maxLength={50}
                  required
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#343536] rounded-xl bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">소문자, 숫자, 하이픈, 한글만 허용됩니다.</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="community-desc" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                설명
              </label>
              <textarea
                id="community-desc"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="커뮤니티에 대한 간단한 설명을 입력하세요."
                rows={4}
                maxLength={300}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#343536] rounded-xl bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/300자</p>
            </div>

            {/* 배너 설정 */}
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">배너 설정</p>

              {/* 배너 모드 선택 탭 */}
              <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-[#272729] p-1 rounded-xl">
                {([
                  { key: 'color', label: '색상' },
                  { key: 'url', label: 'URL 입력' },
                  { key: 'file', label: '파일 업로드' },
                ] as { key: ImageMode; label: string }[]).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setImageMode(tab.key);
                      if (tab.key === 'color') setForm((f) => ({ ...f, bannerImage: '' }));
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      imageMode === tab.key
                        ? 'bg-white dark:bg-[#1A1A1B] text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 색상 선택 */}
              {imageMode === 'color' && (
                <div className="flex flex-wrap gap-2">
                  {BANNER_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, bannerColor: color.value }))}
                      aria-label={`${color.label} 색상 선택`}
                      aria-pressed={form.bannerColor === color.value}
                      className={`w-9 h-9 rounded-full ${color.preview} transition-all ${
                        form.bannerColor === color.value
                          ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* URL 입력 */}
              {imageMode === 'url' && (
                <div>
                  <input
                    type="text"
                    value={form.bannerImage}
                    onChange={(e) => setForm((f) => ({ ...f, bannerImage: e.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#343536] rounded-xl bg-white dark:bg-[#272729] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.bannerImage && (
                    <div className="mt-2 relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#343536]">
                      <img src={form.bannerImage} alt="배너 미리보기" className="w-full h-24 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              )}

              {/* 파일 업로드 */}
              {imageMode === 'file' && (
                <div>
                  <div
                    className="w-full p-4 rounded-xl border border-dashed border-gray-300 dark:border-[#343536] bg-gray-50 dark:bg-[#272729] cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center gap-3"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {form.bannerImage ? '이미지 선택됨 — 클릭하여 변경' : '배너 이미지 선택 (JPG, PNG, WebP)'}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  {form.bannerImage && (
                    <div className="mt-2 relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#343536]">
                      <img src={form.bannerImage} alt="배너 미리보기" className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, bannerImage: '' }))}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full text-sm flex items-center justify-center hover:bg-black/80 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setForm(EMPTY_FORM); setImageMode('color'); }}
                className="px-5 py-2.5 border border-gray-300 dark:border-[#343536] text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors"
              >
                초기화
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !form.name.trim() || !form.slug.trim()}
                aria-busy={isSubmitting}
                className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                커뮤니티 생성
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">미리보기</p>
          <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] overflow-hidden">
            <BannerPreview />
            <div className="p-4 space-y-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                {form.name || '커뮤니티 이름'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {form.slug ? `/community/board/${form.slug}` : 'slug 미입력'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                {form.description || '커뮤니티 설명이 여기 표시됩니다.'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">안내</p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• 커뮤니티 생성 후 멤버십 관리는 커뮤니티 관리자 탭에서 진행하세요.</li>
              <li>• 배너는 색상 그라디언트, 이미지 URL, 직접 파일 업로드 중 선택하세요.</li>
              <li>• Slug는 URL에 사용되므로 신중하게 설정해주세요.</li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">API 상태</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <code className="font-mono">POST /api/v1/admin/communities</code> 엔드포인트가 백엔드에 구현되지 않은 경우 오류 토스트가 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
