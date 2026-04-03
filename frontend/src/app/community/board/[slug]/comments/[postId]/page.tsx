'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/widgets/Header/ui/Header';
import Sidebar from '@/widgets/Sidebar/ui/Sidebar';
import { LoginModal } from '@/features/auth/ui/LoginModal';
import { useCommunityStore } from '@/shared/model/communityStore';
import { useAuthStore } from '@/shared/model/authStore';
import { apiGet } from '@/shared/api/client';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
interface BackendComment {
  id: number;
  content: string;
  author: string;
  authorId?: number;
  createdAt: string;
  parentId?: number | null;
}

interface CommentNode extends BackendComment {
  replies: CommentNode[];
}

// ────────────────────────────────────────────────────────────
// Constants / Helpers
// ────────────────────────────────────────────────────────────
const FIXED_CATEGORIES = ['경제', '방송', '쇼핑', '자유게시판'];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function buildTree(flat: BackendComment[]): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];
  for (const c of flat) map.set(c.id, { ...c, replies: [] });
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function initials(name: string): string {
  return name ? name.slice(0, 2).toUpperCase() : '??';
}

// Avatar colours per username
const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ────────────────────────────────────────────────────────────
// Sub-component: Avatar
// ────────────────────────────────────────────────────────────
function Avatar({ name, size = 'sm' }: { name: string; size?: 'xs' | 'sm' | 'md' }) {
  const cls = size === 'xs' ? 'w-5 h-5 text-[9px]' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${cls} ${avatarColor(name)} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {initials(name)}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Sub-component: CommentItem (recursive)
// ────────────────────────────────────────────────────────────
function CommentItem({
  comment,
  depth,
  currentUser,
  isMember,
  onReplySubmit,
  onLoginRequest,
}: {
  comment: CommentNode;
  depth: number;
  currentUser: string | null;
  isMember: boolean;
  onReplySubmit: (parentId: number, content: string) => Promise<void>;
  onLoginRequest: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [votes, setVotes] = useState(0);
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);

  const handleVote = (type: 'up' | 'down') => {
    if (!currentUser) { onLoginRequest(); return; }
    setVoteState(prev => {
      if (prev === type) { setVotes(v => v + (type === 'up' ? -1 : 1)); return null; }
      setVotes(v => v + (type === 'up' ? (prev === 'down' ? 2 : 1) : (prev === 'up' ? -2 : -1)));
      return type;
    });
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReplySubmit(comment.id, replyText.trim());
      setReplyText('');
      setShowReply(false);
    } finally {
      setSubmitting(false);
    }
  };

  const indent = Math.min(depth, 6);

  return (
    <div className={`relative ${indent > 0 ? 'pl-4' : ''}`}>
      {/* Thread line */}
      {indent > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-200 dark:bg-[#2D2F3A] hover:bg-blue-400 dark:hover:bg-blue-500 cursor-pointer transition-colors rounded-full"
          onClick={() => setCollapsed(c => !c)}
        />
      )}

      <div className="py-2">
        {/* Comment header */}
        <div className="flex items-center gap-2 mb-1.5">
          <Avatar name={comment.author} size="xs" />
          <button
            className="font-semibold text-xs text-gray-800 dark:text-gray-200 hover:underline"
          >
            u/{comment.author}
          </button>
          {comment.author === currentUser && (
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">작성자</span>
          )}
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{timeAgo(comment.createdAt)}</span>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-auto"
          >
            {collapsed ? '[+] 펼치기' : '[–]'}
          </button>
        </div>

        {!collapsed && (
          <>
            {/* Content */}
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2 whitespace-pre-wrap">
              {comment.content}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 text-xs font-bold text-gray-400 dark:text-gray-500">
              {/* Upvote */}
              <button
                onClick={() => handleVote('up')}
                className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2D2F3A] transition-colors ${voteState === 'up' ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10z"/>
                </svg>
              </button>

              {/* Score */}
              <span className={`text-[11px] min-w-[20px] text-center ${voteState === 'up' ? 'text-[#FF4500]' : voteState === 'down' ? 'text-[#7193FF]' : 'text-gray-400'}`}>
                {votes > 0 ? `+${votes}` : votes === 0 ? '·' : votes}
              </span>

              {/* Downvote */}
              <button
                onClick={() => handleVote('down')}
                className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2D2F3A] transition-colors ${voteState === 'down' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.219 21.625c.381.475 1.181.475 1.562 0l8-10A1.001 1.001 0 0 0 20 10h-4V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v7H4a1.001 1.001 0 0 0-.781 1.625l8 10z"/>
                </svg>
              </button>

              {/* Reply */}
              {isMember && (
                <button
                  onClick={() => {
                    if (!currentUser) { onLoginRequest(); return; }
                    setShowReply(r => !r);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2D2F3A] hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd"/>
                  </svg>
                  답글
                </button>
              )}

              <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2D2F3A] hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                공유
              </button>
              <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2D2F3A] hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                신고
              </button>
            </div>

            {/* Reply Input */}
            {showReply && currentUser && (
              <div className="mt-3 ml-2">
                <div className="border border-gray-200 dark:border-[#2D2F3A] rounded-xl overflow-hidden focus-within:border-blue-400 transition-colors">
                  <textarea
                    className="w-full text-sm p-3 h-24 focus:outline-none bg-white dark:bg-[#1E2028] text-gray-900 dark:text-gray-100 resize-none"
                    placeholder={`u/${comment.author}에게 답글 작성...`}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <div className="bg-gray-50 dark:bg-[#191B22] px-3 py-2 flex justify-end gap-2 border-t border-gray-100 dark:border-[#2D2F3A]">
                    <button
                      onClick={() => { setShowReply(false); setReplyText(''); }}
                      className="px-3 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2D2F3A] rounded-xl transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim() || submitting}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl disabled:opacity-50 transition-colors"
                    >
                      답글 작성
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {comment.replies.length > 0 && (
              <div className="mt-2 space-y-1">
                {comment.replies.map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    currentUser={currentUser}
                    isMember={isMember}
                    onReplySubmit={onReplySubmit}
                    onLoginRequest={onLoginRequest}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────
export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const postId = params.postId as string;

  const { posts: allPosts, addComment, votePostWithApi, getVoteState, isMember, joinCommunity, getMemberCount } = useCommunityStore();
  const { user, isAuthenticated } = useAuthStore();

  const foundPost = allPosts.find(p => p.id === Number(postId));
  const post = foundPost ?? {
    id: Number(postId),
    title: '게시글을 불러오는 중...',
    content: '',
    author: '',
    authorId: 0,
    community: slug,
    upvotes: 0,
    downvotes: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    tags: [] as string[],
  };

  const [comments, setComments] = useState<CommentNode[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentSort] = useState<'인기' | '최신' | '오래된'>('최신');
  const [submitting, setSubmitting] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const isFixedCategory = FIXED_CATEGORIES.includes(slug);
  const member = isFixedCategory || isMember(slug);
  const voteState = getVoteState(post.id);
  const memberCount = getMemberCount(slug);

  // Load comments
  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const data = await apiGet<BackendComment[]>(`/api/v1/posts/${postId}/comments`);
      setComments(buildTree(Array.isArray(data) ? data : []));
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [postId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  // Submit top-level comment
  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    const newComment: BackendComment = {
      id: Date.now(),
      content: commentText.trim(),
      author: user?.nickname ?? '나',
      authorId: user?.id,
      createdAt: new Date().toISOString(),
      parentId: null,
    };
    // Optimistic
    setComments(prev => [{ ...newComment, replies: [] }, ...prev]);
    setCommentText('');
    try {
      await addComment(post.id, { id: newComment.id, content: newComment.content, author: newComment.author, createdAt: newComment.createdAt });
      // Reload for server-assigned IDs
      await loadComments();
    } catch {
      setComments(prev => prev.filter(c => c.id !== newComment.id));
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleReplySubmit = async (parentId: number, content: string) => {
    const newReply: BackendComment = {
      id: Date.now(),
      content,
      author: user?.nickname ?? '나',
      authorId: user?.id,
      createdAt: new Date().toISOString(),
      parentId,
    };
    setComments(prev => {
      const insertReply = (nodes: CommentNode[]): CommentNode[] =>
        nodes.map(n => n.id === parentId
          ? { ...n, replies: [...n.replies, { ...newReply, replies: [] }] }
          : { ...n, replies: insertReply(n.replies) }
        );
      return insertReply(prev);
    });
    try {
      await addComment(post.id, { id: newReply.id, content, author: newReply.author, createdAt: newReply.createdAt, parentId });
      await loadComments();
    } catch { /* toast handled by client.ts */ }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const totalComments = comments.reduce(function countAll(sum: number, c: CommentNode): number {
    return sum + 1 + c.replies.reduce(countAll, 0);
  }, 0);

  return (
    <div className="bg-gray-50 dark:bg-[#0F1117] min-h-screen">
      <Header />

      {/* Share toast */}
      {shareToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-full z-50 shadow-lg animate-fade-in">
          링크가 복사되었습니다
        </div>
      )}

      <div className="flex justify-center px-4 py-4 max-w-[1200px] mx-auto gap-6">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main */}
        <div className="flex-1 min-w-0 max-w-[740px]">
          {/* Back navigation */}
          <div className="mb-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              돌아가기
            </button>
          </div>

          {/* ── Post Card ── */}
          <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-100 dark:border-[#2D2F3A] mb-4 overflow-hidden shadow-sm">
            <div className="flex">
              {/* Vote Column */}
              <div className="w-12 bg-gray-50 dark:bg-[#191B22] flex flex-col items-center py-4 gap-1.5 shrink-0 border-r border-gray-100 dark:border-[#2D2F3A]">
                <button
                  onClick={() => isAuthenticated ? votePostWithApi(post.id, 'up') : setIsLoginOpen(true)}
                  className={`p-1 rounded transition-colors ${voteState === 'up' ? 'text-[#FF4500]' : 'text-gray-400 hover:text-[#FF4500] hover:bg-gray-200 dark:hover:bg-[#272729]'}`}
                  aria-label="추천"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10z"/>
                  </svg>
                </button>

                <span className={`text-xs font-bold ${voteState === 'up' ? 'text-[#FF4500]' : voteState === 'down' ? 'text-[#7193FF]' : 'text-[#1C1C1C] dark:text-[#D7DADC]'}`}>
                  {post.upvotes}
                </span>

                <button
                  onClick={() => isAuthenticated ? votePostWithApi(post.id, 'down') : setIsLoginOpen(true)}
                  className={`p-1 rounded transition-colors ${voteState === 'down' ? 'text-[#7193FF]' : 'text-gray-400 hover:text-[#7193FF] hover:bg-gray-200 dark:hover:bg-[#272729]'}`}
                  aria-label="비추천"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.219 21.625c.381.475 1.181.475 1.562 0l8-10A1.001 1.001 0 0 0 20 10h-4V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v7H4a1.001 1.001 0 0 0-.781 1.625l8 10z"/>
                  </svg>
                </button>
              </div>

              {/* Post Content */}
              <div className="flex-1 p-3 min-w-0">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <Link href={`/community/board/${encodeURIComponent(slug)}`} className="font-bold text-[#1C1C1C] dark:text-[#D7DADC] hover:underline">
                    r/{slug}
                  </Link>
                  <span>•</span>
                  <span>
                    <span className="text-gray-400">Posted by </span>
                    <span className="hover:underline cursor-pointer">u/{post.author}</span>
                  </span>
                  <span className="text-gray-400">{timeAgo(post.createdAt)}</span>
                  {post.tags && post.tags.map(tag => (
                    <span key={tag} className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-xl font-semibold text-[#1C1C1C] dark:text-[#D7DADC] mb-3 leading-snug">
                  {post.title}
                </h1>

                {/* Body */}
                {post.content && (
                  <div className="text-sm text-[#1C1C1C] dark:text-[#D7DADC] leading-relaxed mb-4 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                    {post.content}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center flex-wrap gap-1 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => commentInputRef.current?.focus()}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2D2F3A] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd"/>
                    </svg>
                    {totalComments} 댓글
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2D2F3A] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                    공유
                  </button>

                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2D2F3A] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                    저장
                  </button>

                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2D2F3A] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                    더보기
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Comments Section ── */}
          <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-100 dark:border-[#2D2F3A] overflow-hidden shadow-sm">
            <div className="px-4 pt-4 pb-2">

              {/* Comment Input Area */}
              {!isAuthenticated ? (
                // Not logged in
                <div className="border border-gray-100 dark:border-[#2D2F3A] rounded-2xl p-4 mb-4 flex items-center justify-between gap-4 bg-gray-50 dark:bg-[#191B22]">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    댓글을 작성하려면 로그인하세요
                  </p>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shrink-0 transition-colors"
                  >
                    로그인
                  </button>
                </div>
              ) : !member ? (
                // Logged in but not a member
                <div className="border border-gray-100 dark:border-[#2D2F3A] rounded-2xl p-4 mb-4 flex items-center justify-between gap-4 bg-gray-50 dark:bg-[#191B22]">
                  <div>
                    <p className="text-sm font-bold text-[#1C1C1C] dark:text-[#D7DADC] mb-0.5">
                      r/{slug} 커뮤니티 멤버가 되어야 댓글을 작성할 수 있어요
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">가입하고 토론에 참여하세요</p>
                  </div>
                  <button
                    onClick={() => joinCommunity(slug)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shrink-0 transition-colors"
                  >
                    가입하기
                  </button>
                </div>
              ) : (
                // Member — show comment box
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    <span className="text-[#0079D3] font-bold">u/{user?.nickname}</span> 으로 댓글 작성
                  </p>
                  <div className="border border-gray-200 dark:border-[#2D2F3A] rounded-xl overflow-hidden focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-colors">
                    <textarea
                      ref={commentInputRef}
                      className="w-full text-sm p-3 h-28 focus:outline-none bg-white dark:bg-[#1E2028] text-gray-900 dark:text-gray-100 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="생각을 공유해보세요"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                    />
                    {/* Formatting toolbar */}
                    <div className="bg-gray-50 dark:bg-[#191B22] px-3 py-2 flex items-center justify-between border-t border-gray-100 dark:border-[#2D2F3A]">
                      <div className="flex gap-1 text-gray-500">
                        {['B', 'I', '"'].map(fmt => (
                          <button key={fmt} className="w-6 h-6 text-xs font-bold hover:bg-gray-200 dark:hover:bg-[#343536] rounded flex items-center justify-center transition-colors">
                            {fmt}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || submitting}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl disabled:opacity-50 transition-colors"
                      >
                        {submitting ? '작성 중...' : '댓글 작성'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sort Bar */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-[#2D2F3A]">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                </svg>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">정렬:</span>
                {(['최신', '인기', '오래된'] as const).map(s => (
                  <button
                    key={s}
                    className={`text-xs font-bold px-2 py-1 rounded-full transition-colors ${commentSort === s ? 'bg-[#0079D3] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#272729]'}`}
                  >
                    {s}
                  </button>
                ))}
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                  {totalComments}개 댓글
                </span>
              </div>

              {/* Comments List */}
              {commentsLoading ? (
                <div className="space-y-4 pb-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex gap-2 mb-2">
                        <div className="w-5 h-5 bg-gray-200 dark:bg-[#343536] rounded-full" />
                        <div className="h-3 bg-gray-200 dark:bg-[#343536] rounded w-24" />
                        <div className="h-3 bg-gray-200 dark:bg-[#343536] rounded w-16" />
                      </div>
                      <div className="space-y-1.5 ml-7">
                        <div className="h-3 bg-gray-200 dark:bg-[#343536] rounded w-full" />
                        <div className="h-3 bg-gray-200 dark:bg-[#343536] rounded w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">아직 댓글이 없습니다</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">첫 번째 댓글을 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-1 pb-4">
                  {comments.map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      depth={0}
                      currentUser={user?.nickname ?? null}
                      isMember={member}
                      onReplySubmit={handleReplySubmit}
                      onLoginRequest={() => setIsLoginOpen(true)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="hidden lg:block w-[312px] shrink-0">
          {/* Community About */}
          <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-100 dark:border-[#2D2F3A] mb-3 overflow-hidden sticky top-[65px] shadow-sm">
            {/* Banner */}
            <div className="h-[60px] bg-gradient-to-r from-blue-600 to-indigo-500" />

            {/* Community icon */}
            <div className="px-3 pb-3">
              <div className="-mt-5 mb-2">
                <div className="w-[54px] h-[54px] rounded-2xl border-4 border-white dark:border-[#1E2028] bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-black shadow-lg">
                  r/
                </div>
              </div>

              <h2 className="font-bold text-[15px] text-gray-900 dark:text-white mb-1">{slug}</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                {slug} 커뮤니티에 오신 걸 환영합니다. 자유롭게 의견을 나눠보세요.
              </p>

              <div className="flex gap-6 py-3 border-y border-[#EDEFF1] dark:border-[#343536] mb-3">
                <div>
                  <div className="text-[15px] font-bold text-[#1C1C1C] dark:text-[#D7DADC]">
                    {memberCount > 0 ? memberCount.toLocaleString() : '—'}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">멤버</div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#46D160] shrink-0" />
                    <span className="text-[15px] font-bold text-[#1C1C1C] dark:text-[#D7DADC]">온라인</span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">활성</div>
                </div>
              </div>

              {!isFixedCategory && (
                member ? (
                  <div className="space-y-2">
                    <Link
                      href={`/community/board/${encodeURIComponent(slug)}`}
                      className="block w-full text-center py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 font-bold text-sm rounded-xl transition-colors"
                    >
                      글 작성하기
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => joinCommunity(slug)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors"
                  >
                    커뮤니티 가입
                  </button>
                )
              )}
            </div>
          </div>

          {/* Community Rules */}
          <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-100 dark:border-[#2D2F3A] overflow-hidden shadow-sm">
            <div className="px-3 py-2.5 border-b border-gray-100 dark:border-[#2D2F3A]">
              <h3 className="font-bold text-sm text-[#1C1C1C] dark:text-[#D7DADC]">커뮤니티 규칙</h3>
            </div>
            <div className="px-3 py-2 divide-y divide-gray-50 dark:divide-[#2D2F3A]">
              {[
                '서로 존중하며 대화하세요',
                '스팸 및 광고를 자제하세요',
                '주제에 맞는 내용을 작성하세요',
                '개인정보를 공유하지 마세요',
              ].map((rule, i) => (
                <div key={i} className="py-2 flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-[#1C1C1C] dark:text-[#D7DADC] shrink-0">{i + 1}.</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
