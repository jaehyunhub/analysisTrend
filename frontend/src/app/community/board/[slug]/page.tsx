'use client';

import { useParams } from 'next/navigation';
import { useModalStore } from "@/shared/model/modalStore";
import { useCommunityStore } from "@/shared/model/communityStore";
import { useAuthStore } from "@/shared/model/authStore";
import { useToastStore } from "@/shared/model/toastStore";
import Header from "@/widgets/Header/ui/Header";
import Sidebar from "@/widgets/Sidebar/ui/Sidebar";
import PostCard from "@/entities/post/ui/PostCard";
import Link from "next/link";
import { useState } from 'react';

export default function CommunityPage() {
  const params = useParams();
  const slug = params.slug as string; // e.g., 'AnalysisTrend', 'KoreaIT'
  const communityName = `r/${slug}`;
  const { openCreatePost } = useModalStore();
  const { isMember, joinCommunity } = useCommunityStore();
  const { isAuthenticated } = useAuthStore();
  const toastSuccess = useToastStore((state) => state.success);
  const toastError = useToastStore((state) => state.error);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);

  // Mock Data based on slug
  const communityInfo = {
      banner: 'bg-blue-600',
      icon: 'bg-white',
      members: '1.2m',
      online: '450',
      description: `Welcome to the ${communityName} community! Discuss everything related to ${slug} here.`
  };

  const [posts, setPosts] = useState([
    {
      id: 1,
      subreddit: slug,
      author: "trend_master",
      timeAgo: "2 hours ago",
      title: `Welcome to ${communityName}! Read the rules first.`,
      content: "We are glad to have you here. Please make sure to follow the community guidelines...",
      upvotes: "520",
      comments: "34"
    },
    {
      id: 2,
      subreddit: slug,
      author: "daily_poster",
      timeAgo: "5 hours ago",
      title: "What do you think about the recent updates?",
      content: "I personally think it's a step in the right direction, but...",
      upvotes: "125",
      comments: "12"
    }
  ]);

  const handleJoinClick = () => {
    if (!isAuthenticated) {
      toastError('로그인이 필요합니다.');
      return;
    }
    setShowJoinConfirm(true);
  };

  const handleJoinConfirm = () => {
    joinCommunity(slug);
    setShowJoinConfirm(false);
    toastSuccess(`'${slug}' 커뮤니티에 가입했습니다.`);
  };

  const joined = isMember(slug);

  return (
    <div className="bg-[#DAE0E6] dark:bg-[#030303] min-h-screen">
      <Header />
      
      <div className="flex justify-center px-4 pt-4">
        <div className="flex w-full max-w-[1200px] gap-6">
             
             {/* Left Sidebar (Global Nav) - Now sits on the left of everything */}
             <Sidebar />

             {/* Main Content Area (Banner + Feed + Right Sidebar) */}
             <div className="flex-1 min-w-0">
                 
                 {/* Community Header Section (Moved Inside) */}
                 <div className="mb-4">
                    {/* Banner */}
                    <div className={`h-[150px] ${communityInfo.banner} w-full rounded-t-[4px]`}></div>
                    
                    {/* Header Info */}
                    <div className="bg-white dark:bg-[#1A1A1B] px-4 pb-4 rounded-b-[4px] shadow-sm border border-[#ccc] dark:border-[#343536] border-t-0">
                        <div className="flex items-end relative">
                             {/* Icon - overlapped */}
                             <div className="absolute -top-6 left-0">
                                <div className="h-20 w-20 rounded-full border-4 border-white dark:border-[#1A1A1B] bg-white flex items-center justify-center overflow-hidden">
                                    <div className={`h-full w-full ${communityInfo.banner} flex items-center justify-center text-white text-3xl font-bold`}>
                                        {slug.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                             </div>
                             
                             <div className="ml-24 pt-2 flex-1 flex justify-between items-end">
                                 <div>
                                    <h1 className="text-2xl font-bold text-[#1C1C1C] dark:text-[#D7DADC]">{communityName}</h1>
                                    <p className="text-sm text-gray-500">{communityName}</p>
                                 </div>
                                 <button
                                    onClick={handleJoinClick}
                                    disabled={joined}
                                    className={`px-8 py-2 font-bold rounded-full text-sm transition-colors mb-1 ${
                                      joined
                                        ? 'bg-gray-100 dark:bg-[#272729] text-gray-500 dark:text-gray-400 cursor-default border border-gray-300 dark:border-[#343536]'
                                        : 'bg-[#0079D3] hover:bg-[#006CBB] text-white'
                                    }`}
                                 >
                                    {joined ? '가입됨' : 'Join'}
                                 </button>
                             </div>
                        </div>
                    </div>
                 </div>

                 {/* Feed Layout */}
                 <div className="flex gap-6">
                     {/* Feed Container */}
                     <div className="flex-1 max-w-[640px]">
                        {/* Filter Bar */}
                        <div className="flex items-center gap-4 bg-white dark:bg-[#1A1A1B] p-3 mb-4 rounded-[4px] border border-[#CCCCCC] dark:border-[#343536]">
                            <button className="flex items-center gap-1 text-[#0079D3] font-bold text-[14px] bg-[#F6F7F8] dark:bg-[#272729] px-3 py-1 rounded-full">Hot</button>
                            <button className="flex items-center gap-1 text-[#878A8C] font-bold text-[14px] px-2 py-1 hover:bg-[#F6F7F8] dark:hover:bg-[#272729] rounded-full">New</button>
                            <button className="flex items-center gap-1 text-[#878A8C] font-bold text-[14px] px-2 py-1 hover:bg-[#F6F7F8] dark:hover:bg-[#272729] rounded-full">Top</button>
                        </div>

                        {/* Posts */}
                        {posts.map(post => (
                        <PostCard 
                            key={post.id}
                            {...post}
                        />
                        ))}
                     </div>

                     {/* Right Sidebar - Community Info */}
                     <div className="hidden lg:block w-[312px]">
                        <div className="bg-white dark:bg-[#1A1A1B] rounded-[4px] border border-[#ccc] dark:border-[#343536] sticky top-[65px]">
                            <div className="bg-[#0079D3] p-3 rounded-t-[4px]">
                                <h2 className="text-white font-bold text-sm">About Community</h2>
                            </div>
                            <div className="p-3">
                                <div className="text-sm text-[#1C1C1C] dark:text-[#D7DADC] mb-4">
                                    {communityInfo.description}
                                </div>
                                
                                <div className="flex gap-10 mb-4 border-b border-[#EDEFF1] dark:border-[#343536] pb-4">
                                    <div>
                                        <div className="text-[16px] font-bold text-[#1C1C1C] dark:text-[#D7DADC]">{communityInfo.members}</div>
                                        <div className="text-[12px] font-bold text-[#7C878A] dark:text-[#818384]">Members</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-[#46D160]"></span>
                                            <div className="text-[16px] font-bold text-[#1C1C1C] dark:text-[#D7DADC]">{communityInfo.online}</div>
                                        </div>
                                        <div className="text-[12px] font-bold text-[#7C878A] dark:text-[#818384]">Online</div>
                                    </div>
                                </div>

                                <button 
                                    onClick={openCreatePost}
                                    className="w-full bg-[#0079D3] hover:bg-[#006CBB] text-white font-bold h-[32px] rounded-full text-sm mb-3"
                                >
                                    Create Post
                                </button>
                                
                            </div>
                        </div>
                     </div>
                 </div>

             </div>
        </div>
      </div>

      {/* 커뮤니티 가입 확인 모달 */}
      {showJoinConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowJoinConfirm(false)}
        >
          <div
            className="bg-white dark:bg-[#1A1A1B] rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">커뮤니티 가입</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{slug}</span> 커뮤니티에 가입하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowJoinConfirm(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleJoinConfirm}
                className="px-5 py-2 text-sm font-bold bg-[#0079D3] hover:bg-[#006CBB] text-white rounded-xl transition-colors"
              >
                가입하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
