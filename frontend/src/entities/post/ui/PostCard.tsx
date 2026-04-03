'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useCommunityStore } from "@/shared/model/communityStore";

interface PostProps {
  id: number;
  subreddit: string;
  author: string;
  timeAgo: string;
  title: string;
  content?: string;
  upvotes: number | string;
  comments: number | string;
}

const BOARD_COLORS: Record<string, string> = {
  '경제': 'bg-blue-500',
  '방송': 'bg-red-500',
  '쇼핑': 'bg-orange-500',
  '자유게시판': 'bg-green-500',
};

function formatCount(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  if (typeof value === 'string' && value.includes('k')) return value;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
}

export default function PostCard({ id, subreddit, author, timeAgo, title, content, upvotes, comments }: PostProps) {
  const router = useRouter();
  const votePostWithApi = useCommunityStore((state) => state.votePostWithApi);
  const getVoteState = useCommunityStore((state) => state.getVoteState);
  const boardColor = BOARD_COLORS[subreddit] || 'bg-gray-500';
  const voteState = getVoteState(id);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    votePostWithApi(id, 'up');
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    votePostWithApi(id, 'down');
  };

  return (
    <div
      onClick={() => router.push(`/community/board/${subreddit}/comments/${id}`)}
      className="flex cursor-pointer bg-white dark:bg-[#1A1A1B] border border-gray-200 dark:border-[#343536] rounded-xl hover:border-gray-400 dark:hover:border-[#818384] mb-2.5 overflow-hidden transition-colors"
    >
        {/* Vote Sidebar */}
        <div className="w-[44px] flex flex-col items-center bg-gray-50 dark:bg-[#151516] px-2 py-3 gap-1 shrink-0">
             <button
                onClick={handleUpvote}
                className={`p-1 rounded-md transition-colors ${
                  voteState === 'up'
                    ? 'text-orange-500 bg-orange-50 dark:bg-[#343536]'
                    : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-[#343536]'
                }`}
                aria-label="추천"
             >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h6v8h4v-8h6z"/></svg>
             </button>
             <span className={`text-xs font-black ${
               voteState === 'up' ? 'text-orange-500' : voteState === 'down' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
             }`}>{formatCount(upvotes)}</span>
             <button
                onClick={handleDownvote}
                className={`p-1 rounded-md transition-colors ${
                  voteState === 'down'
                    ? 'text-blue-500 bg-blue-50 dark:bg-[#343536]'
                    : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-[#343536]'
                }`}
                aria-label="비추천"
             >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8h-6v-8h-4v8h-6z"/></svg>
             </button>
        </div>

        {/* Content Area */}
        <div className="p-3 w-full bg-white dark:bg-[#1A1A1B]">
             {/* Metadata */}
             <div className="flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-gray-400 mb-2">
                 <div className={`h-5 w-5 ${boardColor} rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0`}>
                   {subreddit?.[0] ?? '?'}
                 </div>
                 <Link
                    href={`/community/board/${subreddit}`}
                    className="font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                 >
                    {subreddit}
                 </Link>
                 <span className="text-gray-300 dark:text-gray-600">•</span>
                 <span>u/{author}</span>
                 <span className="text-gray-300 dark:text-gray-600">•</span>
                 <span>{timeAgo}</span>
             </div>

             {/* Title */}
             <h3 className="text-[16px] font-bold leading-snug text-gray-900 dark:text-gray-100 mb-2 pr-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{title}</h3>

             {/* Content Preview */}
             {content && (
                 <div className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {content}
                 </div>
             )}

             {/* Action Bar */}
             <div className="flex items-center gap-0.5 text-gray-400 font-bold text-[12px]">
                 <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg transition-colors hover:text-gray-600 dark:hover:text-gray-200">
                     <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
                     <span>댓글 {formatCount(comments)}</span>
                 </button>
                 <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg transition-colors hover:text-gray-600 dark:hover:text-gray-200">
                     <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                     <span>공유</span>
                 </button>
                 <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg transition-colors hover:text-gray-600 dark:hover:text-gray-200">
                     <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                     <span>저장</span>
                 </button>
                 <button className="flex items-center px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg transition-colors hover:text-gray-600 dark:hover:text-gray-200">
                     <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/></svg>
                 </button>
             </div>
        </div>
    </div>
  );
}
