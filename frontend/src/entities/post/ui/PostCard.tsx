'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useCommunityStore } from "@/shared/model/communityStore";
import { getCommunityTheme } from '@/shared/lib/communityThemes';

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
  const t = getCommunityTheme(subreddit);
  const color = { bg: t.lightBg, text: t.lightText, dot: t.btnBg };
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
    <article
      onClick={() => router.push(`/community/board/${subreddit}/comments/${id}`)}
      className="group cursor-pointer bg-white dark:bg-[#1E2028] border border-gray-100 dark:border-[#2D2F3A] rounded-2xl mb-3 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] hover:border-gray-200 dark:hover:border-[#3D3F4A]"
    >
      <div className="p-4">
        {/* Metadata row */}
        <div className="flex items-center gap-2 mb-3">
          {/* Category tag */}
          <Link
            href={`/community/board/${subreddit}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-opacity hover:opacity-80 ${color.bg} ${color.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
            {subreddit}
          </Link>

          <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
          <span className="text-[12px] text-gray-400 dark:text-gray-500">
            <span className="font-medium text-gray-500 dark:text-gray-400">{author}</span>
          </span>
          <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
          <span className="text-[12px] text-gray-400 dark:text-gray-500">{timeAgo}</span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold leading-snug text-gray-900 dark:text-gray-100 mb-2 group-hover:opacity-70 transition-opacity line-clamp-2">
          {title}
        </h3>

        {/* Content preview */}
        {content && (
          <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {content}
          </p>
        )}
      </div>

      {/* Action bar — 하단 구분선 위에 배치 */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-t border-gray-50 dark:border-[#2D2F3A] bg-gray-50/50 dark:bg-[#191B22]/60">
        {/* Vote group */}
        <div className="flex items-center bg-gray-100 dark:bg-[#2D2F3A] rounded-full overflow-hidden mr-1">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-bold transition-colors ${
              voteState === 'up'
                ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/30'
                : 'text-gray-500 dark:text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            }`}
            aria-label="추천"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l-8 8h6v8h4v-8h6z"/>
            </svg>
            <span>{formatCount(upvotes)}</span>
          </button>
          <span className="w-px h-4 bg-gray-200 dark:bg-[#3D3F4A]" />
          <button
            onClick={handleDownvote}
            className={`flex items-center px-2.5 py-1.5 transition-colors ${
              voteState === 'down'
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            aria-label="비추천"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 20l8-8h-6v-8h-4v8h-6z"/>
            </svg>
          </button>
        </div>

        {/* Comments */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2D2F3A] hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd"/>
          </svg>
          댓글 {formatCount(comments)}
        </button>

        {/* Share */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2D2F3A] hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          공유
        </button>
      </div>
    </article>
  );
}
