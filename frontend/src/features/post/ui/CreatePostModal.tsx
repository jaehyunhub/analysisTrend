'use client';

import { useState, useRef, useEffect } from 'react';
import { useModalStore } from '@/shared/model/modalStore';
import { useCommunityStore } from '@/shared/model/communityStore';
import { useToastStore } from '@/shared/model/toastStore';
import { useAuthStore } from '@/shared/model/authStore';

const TABS = [
  { key: 'post', label: '글' },
  { key: 'image', label: '이미지' },
  { key: 'link', label: '링크' },
  { key: 'poll', label: '투표' },
];

const COMMUNITIES = [
  { value: '경제', label: '경제' },
  { value: '방송', label: '방송' },
  { value: '쇼핑', label: '쇼핑' },
  { value: '자유게시판', label: '자유게시판' },
];

export default function CreatePostModal() {
  const { isCreatePostOpen, closeCreatePost } = useModalStore();
  const addPost = useCommunityStore((state) => state.addPost);
  const isMember = useCommunityStore((state) => state.isMember);
  const toastSuccess = useToastStore((state) => state.success);
  const toastError = useToastStore((state) => state.error);
  const { isAuthenticated } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState('post');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('경제');

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCreatePostOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) { e.preventDefault(); return; }

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, [isCreatePostOpen]);

  if (!isCreatePostOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (!isAuthenticated) {
      toastError('로그인이 필요합니다.');
      return;
    }

    if (!isMember(selectedCommunity)) {
      toastError(`'${selectedCommunity}' 커뮤니티에 먼저 가입해주세요.`);
      return;
    }

    const { user } = useAuthStore.getState();
    const newPost = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      author: user?.nickname ?? 'me',
      authorId: user?.id,
      community: selectedCommunity,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };
    addPost(newPost);
    toastSuccess('글이 작성되었습니다.');
    setTitle('');
    setContent('');
    setSelectedCommunity('경제');
    setSelectedTab('post');
    closeCreatePost();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onKeyDown={(e) => e.key === 'Escape' && closeCreatePost()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className="bg-white dark:bg-[#1A1A1B] w-full max-w-[680px] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        ref={dialogRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#343536]">
          <h2 id="create-post-title" className="text-lg font-black text-gray-900 dark:text-white">새 게시물 작성</h2>
          <button onClick={closeCreatePost} aria-label="모달 닫기" className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
            {/* Community Selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">게시판 선택</label>
              <div className="relative w-64">
                  <select
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-xl px-4 py-2.5 appearance-none font-semibold text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                  >
                      {COMMUNITIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-gray-400 text-xs">▼</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-[#343536] mb-5">
                {TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key)}
                      className={`px-5 py-3 text-sm font-bold transition-colors ${
                          selectedTab === tab.key
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                      }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Title */}
            <input
                type="text"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
                className="w-full p-3.5 border border-gray-200 dark:border-[#343536] rounded-xl mb-4 bg-transparent outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 text-sm"
            />

            {selectedTab === 'post' && (
                <textarea
                    placeholder="내용을 입력하세요 (선택사항)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3.5 border border-gray-200 dark:border-[#343536] rounded-xl min-h-[180px] bg-transparent outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                />
            )}

            {selectedTab === 'link' && (
                <input
                    type="url"
                    placeholder="https://"
                    className="w-full p-3.5 border border-gray-200 dark:border-[#343536] rounded-xl bg-transparent outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                />
            )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-[#343536] flex justify-end gap-2.5">
            <button
              onClick={closeCreatePost}
              className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-[#272729] rounded-xl transition-colors text-sm"
            >
              취소
            </button>
            <button
                onClick={handleSubmit}
                disabled={!title}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm shadow-sm"
            >
                게시하기
            </button>
        </div>
      </div>
    </div>
  );
}
