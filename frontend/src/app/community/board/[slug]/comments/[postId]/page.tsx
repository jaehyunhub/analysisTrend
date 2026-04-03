'use client';

import { useParams } from 'next/navigation';
import Header from "@/widgets/Header/ui/Header";
import Sidebar from "@/widgets/Sidebar/ui/Sidebar";
import Link from "next/link";
import { useState } from 'react';
import { useCommunityStore } from "@/shared/model/communityStore";

export default function PostDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const postId = params.postId as string;
  const communityName = `r/${slug}`;

  const { posts: allPosts } = useCommunityStore();
  const foundPost = allPosts.find(p => p.id === Number(postId));

  const post = foundPost ? {
    id: String(foundPost.id),
    subreddit: foundPost.community,
    author: foundPost.author,
    timeAgo: new Date(foundPost.createdAt).toLocaleString('ko-KR'),
    title: foundPost.title,
    content: foundPost.content,
    upvotes: foundPost.upvotes,
    comments: foundPost.commentCount,
  } : {
    id: postId,
    subreddit: slug,
    author: "trend_master",
    timeAgo: "2 hours ago",
    title: "Exploring the new specific trend analysis algorithm",
    content: "I've been working on a new way to analyze YouTube trends using a combination of NLP and time-series forecasting. The results show a significant improvement in predicting viral content before it peaks. I utilized the Youtube Data API to gather datasets from top 100 channels in tech category.",
    upvotes: 1200,
    comments: 89,
  };

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
      { id: 1, author: 'dev_guru', content: 'This looks amazing! Have you published the code anywhere?', time: '1 hour ago', upvotes: 45, replies: [] },
      { id: 2, author: 'ai_fanatic', content: 'What libraries did you use for the NLP part?', time: '30 mins ago', upvotes: 12, replies: [
          { id: 3, author: 'trend_master', content: 'I used HuggingFace Transformers and PyTorch.', time: '10 mins ago', upvotes: 5 }
      ]}
  ]);

  return (
    <div className="bg-[#DAE0E6] dark:bg-[#030303] min-h-screen">
      <Header />
      
      {/* Dark overlay background effect for 'modal-like' feel, though simpler to just implement as page first */}
      <div className="flex justify-center px-4 py-6">
        <div className="flex w-full max-w-[1200px] gap-6">
             
             {/* Left Sidebar */}
             <Sidebar />

             {/* Main Content - Post Detail */}
             <div className="flex-1 w-full max-w-[740px]">
                 
                 {/* Post Container */}
                 <div className="bg-white dark:bg-[#1A1A1B] rounded-[4px] border border-[#CCCCCC] dark:border-[#343536] mb-4 overflow-hidden">
                     <div className="flex">
                         {/* Vote Sidebar */}
                         <div className="w-10 bg-[#F8F9FA] dark:bg-[#151516] p-2 flex flex-col items-center gap-1 border-r border-gray-100 dark:border-[#343536]">
                             <button className="text-gray-400 hover:text-[#FF4500] hover:bg-gray-200 rounded p-1">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10zM15 12h-1v8h-4v-8H6.081L12 4.601 17.919 12H15z"/></svg>
                             </button>
                             <span className="text-sm font-bold text-[#1C1C1C] dark:text-[#D7DADC]">{post.upvotes}</span>
                             <button className="text-gray-400 hover:text-[#7193FF] hover:bg-gray-200 rounded p-1">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.92 10.281A1.003 1.003 0 0 0 2 11.5v6.5a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h.5c.277 0 .54-.108.735-.304l7.994-8a1.003 1.003 0 0 0 .079-1.39l-4.5-5.5A1.003 1.003 0 0 0 16 7.5h-5v-5a1 1 0 0 0-1-1h-.5a1.003 1.003 0 0 0-.792.384l-5.788 8.397zM18.82 11L12 17.822V12h-5v5l5-7.252V15h8.318l-1.5 1.833V11H18.82zM4 17.5V12h.71l5.29 6.5H5a1 1 0 0 1-1-1v-6.5z"/></svg>
                             </button>
                         </div>

                         {/* Content */}
                         <div className="flex-1 p-4">
                             {/* Header */}
                             <div className="flex items-center text-xs text-gray-500 mb-2 gap-1">
                                 <Link href={`/community/board/${encodeURIComponent(post.subreddit)}`} className="font-bold text-[#1C1C1C] dark:text-[#D7DADC] hover:underline">{post.subreddit}</Link>
                                 <span>•</span>
                                 <span>Posted by u/{post.author}</span>
                                 <span>{post.timeAgo}</span>
                             </div>

                             {/* Title */}
                             <h1 className="text-xl font-medium text-[#1C1C1C] dark:text-[#D7DADC] mb-4">{post.title}</h1>

                             {/* Body */}
                             <div className="text-sm text-[#1C1C1C] dark:text-[#D7DADC] leading-relaxed mb-6">
                                 {post.content}
                             </div>

                             {/* Actions */}
                             <div className="flex gap-4 text-xs font-bold text-gray-500">
                                 <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#272729] px-2 py-1 rounded">
                                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
                                     {post.comments} Comments
                                 </button>
                                 <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#272729] px-2 py-1 rounded">
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                                     Share
                                 </button>
                                 <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#272729] px-2 py-1 rounded">
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                                     Save
                                 </button>
                             </div>
                         </div>
                     </div>

                     {/* Comment Section bg (Gray) */}
                     <div className="bg-[#F6F7F8] dark:bg-[#1A1A1B] px-10 py-8">
                         {/* Comment Input */}
                         <div className="mb-8">
                             <div className="text-sm mb-1">Comment as <span className="text-[#0079D3]">trend_user</span></div>
                             <div className="border border-[#CCCCCC] dark:border-[#343536] rounded-[4px] bg-white dark:bg-[#030303] overflow-hidden focus-within:border-black focus-within:dark:border-white">
                                 <textarea 
                                    className="w-full text-sm p-3 h-32 focus:outline-none bg-transparent"
                                    placeholder="What are your thoughts?"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                 ></textarea>
                                 <div className="bg-[#F6F7F8] dark:bg-[#272729] p-2 flex justify-end">
                                     <button className="px-4 py-1 bg-[#0079D3] hover:bg-[#006CBB] text-white font-bold text-sm rounded-full disabled:opacity-50" disabled={!commentText}>
                                         Comment
                                     </button>
                                 </div>
                             </div>
                         </div>

                         {/* Comments List */}
                         <div className="space-y-6">
                             {comments.map(comment => (
                                 <div key={comment.id} className="group">
                                     <div className="flex gap-2 items-center text-xs text-gray-500 mb-1">
                                         <span className="font-bold text-[#1C1C1C] dark:text-[#D7DADC]">{comment.author}</span>
                                         <span>{comment.upvotes} points</span>
                                         <span>•</span>
                                         <span>{comment.time}</span>
                                     </div>
                                     <div className="text-sm text-[#1C1C1C] dark:text-[#D7DADC] mb-2 pl-2 border-l-2 border-transparent group-hover:border-gray-200">
                                         {comment.content}
                                     </div>
                                     <div className="flex gap-2 text-xs text-gray-400 font-bold">
                                         <button className="hover:bg-gray-200 dark:hover:bg-[#272729] px-1 rounded">Reply</button>
                                         <button className="hover:bg-gray-200 dark:hover:bg-[#272729] px-1 rounded">Share</button>
                                     </div>

                                     {/* Nested Replies */}
                                     {comment.replies && comment.replies.length > 0 && (
                                         <div className="ml-6 mt-4 pl-4 border-l border-gray-200 dark:border-[#343536]">
                                             {comment.replies.map(reply => (
                                                 <div key={reply.id} className="mb-4">
                                                     <div className="flex gap-2 items-center text-xs text-gray-500 mb-1">
                                                         <span className="font-bold text-[#1C1C1C] dark:text-[#D7DADC]">{reply.author}</span>
                                                         <span>{reply.upvotes} points</span>
                                                         <span>•</span>
                                                         <span>{reply.time}</span>
                                                     </div>
                                                     <div className="text-sm text-[#1C1C1C] dark:text-[#D7DADC] mb-2">
                                                         {reply.content}
                                                     </div>
                                                     <div className="flex gap-2 text-xs text-gray-400 font-bold">
                                                        <button className="hover:bg-gray-200 dark:hover:bg-[#272729] px-1 rounded">Reply</button>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
             </div>

             {/* Right Sidebar - Community Info (Same as parent) */}
              <div className="hidden lg:block w-[312px]">
                    <div className="bg-white dark:bg-[#1A1A1B] rounded-[4px] border border-[#ccc] dark:border-[#343536] sticky top-[65px]">
                        <div className="bg-[#0079D3] p-3 rounded-t-[4px]">
                            <h2 className="text-white font-bold text-sm">About Community</h2>
                        </div>
                        <div className="p-3">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="h-[54px] w-[54px] rounded-full border-4 border-white dark:border-[#1A1A1B] bg-[#0079D3] flex items-center justify-center text-white text-2xl font-bold">
                                   r/
                                </div>
                                <span className="text-base font-medium">{communityName}</span>
                             </div>
                             <div className="text-sm text-[#1C1C1C] dark:text-[#D7DADC] mb-4">
                                Welcome to the {communityName} community! Discuss everything related to {slug} here.
                             </div>
                             
                             <div className="flex gap-10 mb-4 border-b border-[#EDEFF1] dark:border-[#343536] pb-4">
                                  <div>
                                      <div className="text-[16px] font-bold text-[#1C1C1C] dark:text-[#D7DADC]">1.2m</div>
                                      <div className="text-[12px] font-bold text-[#7C878A] dark:text-[#818384]">Members</div>
                                  </div>
                                  <div>
                                       <div className="flex items-center gap-1">
                                         <span className="h-2 w-2 rounded-full bg-[#46D160]"></span>
                                         <div className="text-[16px] font-bold text-[#1C1C1C] dark:text-[#D7DADC]">450</div>
                                      </div>
                                      <div className="text-[12px] font-bold text-[#7C878A] dark:text-[#818384]">Online</div>
                                  </div>
                             </div>

                             <button className="w-full bg-[#0079D3] hover:bg-[#006CBB] text-white font-bold h-[32px] rounded-full text-sm mb-3">Create Post</button>
                        </div>
                    </div>
                 </div>

        </div>
      </div>
    </div>
  );
}
