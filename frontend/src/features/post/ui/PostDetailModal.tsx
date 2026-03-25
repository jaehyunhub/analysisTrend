'use client';

import { useState, useRef, useEffect } from 'react';
import { useModalStore } from '@/shared/model/modalStore';
import { useCommunityStore } from '@/shared/model/communityStore';
import { useAuthStore } from '@/shared/model/authStore';
import type { Comment } from '@/shared/types/post';

export default function PostDetailModal() {
  const { selectedPostId, closePostDetail } = useModalStore();
  const { posts, setPosts, addComment } = useCommunityStore();
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>([]);

  const post = posts.find(p => p.id === selectedPostId);

  // 수정/삭제 권한: 작성자 본인만 허용
  // authorId가 없는 mock 데이터(기존 게시글)는 수정/삭제 불가
  const isAuthor = !!user && !!post?.authorId && post.authorId === user.id;

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPostId) return;

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
  }, [selectedPostId]);

  const handleEdit = () => {
    if (!post) return;
    setEditTitle(post.title);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!post || !editTitle.trim()) return;
    setPosts(posts.map(p => p.id === selectedPostId ? { ...p, title: editTitle.trim() } : p));
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!selectedPostId) return;
    setPosts(posts.filter(p => p.id !== selectedPostId));
    closePostDetail();
  };

  const handleSubmitComment = () => {
    if (!commentText.trim() || !selectedPostId) return;
    const newComment: Comment = {
      id: Date.now(),
      content: commentText.trim(),
      author: user?.nickname ?? '나',
      createdAt: new Date().toISOString(),
    };
    addComment(selectedPostId, newComment);
    setLocalComments(prev => [...prev, newComment]);
    setCommentText('');
  };

  if (!selectedPostId) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={closePostDetail}
      onKeyDown={(e) => e.key === 'Escape' && closePostDetail()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="게시물 상세"
        className="bg-white dark:bg-[#1A1A1B] w-full max-w-[900px] h-[80vh] rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
      >
        {/* Left: Vote & Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#DAE0E6] dark:bg-[#0D0D0D]">
            <div className="bg-white dark:bg-[#1A1A1B] rounded p-4 shadow-sm min-h-[500px]">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1">
                        <button aria-label="추천" className="text-gray-400 hover:text-red-500">⬆</button>
                        <span className="font-bold text-sm">1.2k</span>
                        <button aria-label="비추천" className="text-gray-400 hover:text-blue-500">⬇</button>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                           <span className="font-bold text-black dark:text-white">r/AnalysisTrend</span>
                           <span>• Posted by u/trend_master</span>
                           <span>• 2 hours ago</span>
                        </div>
                        {isEditing ? (
                          <div className="mb-4">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              placeholder="제목"
                              className="w-full px-3 py-2 border border-blue-500 rounded-lg outline-none text-base font-bold dark:bg-[#272729] dark:text-white"
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={handleSaveEdit} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">저장</button>
                              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 border border-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-[#343536] dark:text-gray-300">취소</button>
                            </div>
                          </div>
                        ) : (
                          <h1 className="text-xl font-bold mb-4 text-[#1C1C1C] dark:text-[#D7DADC]">
                            {post?.title || 'Exploring the new specific trend analysis algorithm'}
                          </h1>
                        )}
                        <p className="text-sm text-[#1C1C1C] dark:text-[#D7DADC] leading-relaxed">
                            I've been working on a new way to analyze YouTube trends using a combination of NLP and time-series forecasting. 
                            The results show a significant improvement in predicting viral content before it peaks...
                            <br/><br/>
                            (Mock Concept Content for Post ID: {selectedPostId})
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Right: Comments (Desktop only usually, but putting here for simplicity) */}
        <div className="w-[350px] bg-white dark:bg-[#1A1A1B] border-l border-gray-200 dark:border-[#343536] flex flex-col hidden md:flex">
             <div className="p-4 border-b border-gray-200 dark:border-[#343536] flex justify-between items-center">
                 <h3 className="font-bold text-sm">Comments (89)</h3>
                 <div className="flex gap-1">
                   {isAuthor && (
                     <>
                       <button onClick={handleEdit} className="px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">수정</button>
                       <button onClick={handleDelete} className="px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">삭제</button>
                     </>
                   )}
                   <button onClick={closePostDetail} aria-label="게시물 닫기" className="text-gray-500 hover:text-black dark:hover:text-white ml-1">닫기</button>
                 </div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {/* 기존 mock 댓글 */}
                 <div className="flex gap-2">
                     <div className="w-8 h-8 bg-purple-500 rounded-full shrink-0"></div>
                     <div>
                         <div className="text-xs font-bold mb-1 text-gray-900 dark:text-gray-100">commenter_one</div>
                         <div className="text-sm text-gray-800 dark:text-gray-200">Great analysis! Have you accounted for short-form content spikes?</div>
                         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago</div>
                     </div>
                 </div>
                 {/* 사용자가 추가한 댓글 */}
                 {localComments.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-600">
                     <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                     </svg>
                     <p className="text-sm">첫 댓글을 남겨보세요</p>
                   </div>
                 ) : (
                   localComments.map((comment: Comment) => (
                     <div key={comment.id} className="flex gap-2">
                       <div className="w-8 h-8 bg-blue-500 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold">
                         {comment.author.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <div className="text-xs font-bold mb-1 text-gray-900 dark:text-gray-100">{comment.author}</div>
                         <div className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</div>
                         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                           {new Date(comment.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </div>
                       </div>
                     </div>
                   ))
                 )}
             </div>
             {/* Comment Input */}
             <div className="p-4 border-t border-gray-200 dark:border-[#343536]">
                 <div className="flex gap-2">
                     <input
                         type="text"
                         value={commentText}
                         onChange={(e) => setCommentText(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                         placeholder="댓글 작성..."
                         className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-colors"
                     />
                     <button
                         onClick={handleSubmitComment}
                         disabled={!commentText.trim()}
                         className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-blue-700 transition-colors"
                     >
                         등록
                     </button>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
}
