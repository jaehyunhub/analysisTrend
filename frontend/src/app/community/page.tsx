'use client';

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import Image from "next/image";

export default function Home() {
  const posts = [
    {
      id: 1,
      subreddit: "MachineLearning",
      author: "trend_master",
      timeAgo: "2 hours ago",
      title: "Exploring the new specific trend analysis algorithm",
      content: "I've been working on a new way to analyze YouTube trends using a combination of NLP and time-series forecasting. The results show a significant improvement in predicting viral content before it peaks. I utilized the Youtube Data API to gather dataset...",
      upvotes: "1.2k",
      comments: "89"
    },
    {
      id: 2,
      subreddit: "WebDev",
      author: "coding_ninja",
      timeAgo: "4 hours ago",
      title: "Next.js 15 is a game changer for server actions",
      content: "The new stability improvements and the caching strategies are simply amazing. I've migrated a large scale e-commerce app and the performance boost is real. The developer experience with Server Components is becoming...",
      upvotes: "3.4k",
      comments: "256"
    },
    {
       id: 3,
       subreddit: "KoreaTrends",
       author: "seoul_vibe",
       timeAgo: "5 hours ago",
       title: "Top 10 rising keywords in Korean search engines today",
       content: "Looking at the data from Naver and Google, there is a massive spike in interest for 'Zero Sugar' products again. This seems to be correlated with the new summer season marketing campaigns starting early...",
       upvotes: "856",
       comments: "42"
    }
  ];

  return (
    <div className="bg-[#DAE0E6] dark:bg-[#030303] min-h-screen">
      <Header />
      
      <div className="flex justify-center">
        {/* Max Width Container */}
        <div className="flex w-full max-w-[1200px] gap-6">
             
             {/* Left Sidebar - Sticky */}
             <Sidebar />

             {/* Main Content Area */}
             <div className="flex-1 py-5 flex gap-6">
                 {/* Feed Container */}
                 <div className="flex-1 max-w-[640px]">
                    {/* Create Post Input */}
                    <div className="flex items-center gap-2 bg-white dark:bg-[#1A1A1B] p-2 rounded-[4px] border border-[#CCCCCC] dark:border-[#343536] mb-4">
                        <div className="h-[38px] w-[38px] bg-gray-200 rounded-full overflow-hidden relative">
                             <Image src="/next.svg" alt="User" fill className="object-cover opacity-50 p-1" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Create Post" 
                            className="flex-1 bg-[#F6F7F8] dark:bg-[#272729] border border-[#EDEFF1] dark:border-[#343536] hover:bg-white hover:border-[#0079D3] rounded-[4px] h-[38px] px-4 text-sm focus:outline-none"
                        />
                        <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272729] rounded">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>
                        </button>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex items-center gap-4 bg-white dark:bg-[#1A1A1B] p-3 mb-4 rounded-[4px] border border-[#CCCCCC] dark:border-[#343536]">
                        <button className="flex items-center gap-1 text-[#0079D3] font-bold text-[14px] bg-[#F6F7F8] dark:bg-[#272729] px-3 py-1 rounded-full">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                            Best
                        </button>
                        <button className="flex items-center gap-1 text-[#878A8C] font-bold text-[14px] px-2 py-1 hover:bg-[#F6F7F8] dark:hover:bg-[#272729] rounded-full">
                             <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/></svg>
                             Hot
                        </button>
                        <button className="flex items-center gap-1 text-[#878A8C] font-bold text-[14px] px-2 py-1 hover:bg-[#F6F7F8] dark:hover:bg-[#272729] rounded-full">
                             <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                             New
                        </button>
                         <button className="flex items-center gap-1 text-[#878A8C] font-bold text-[14px] px-2 py-1 hover:bg-[#F6F7F8] dark:hover:bg-[#272729] rounded-full">
                             <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 00-1-1H3zm6 3.5a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0zm6-5a1 1 0 11-2 0 1 1 0 012 0zm0 5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"/></svg>
                             Top
                        </button>
                    </div>

                    {/* Posts */}
                    {posts.map(post => (
                    <PostCard 
                        key={post.id}
                        {...post}
                    />
                    ))}
                 </div>

                 {/* Right Sidebar - Hidden on typical mobile */}
                 <div className="hidden lg:block w-[312px]">
                    {/* Community Details */}
                    <div className="bg-white dark:bg-[#1A1A1B] rounded-[4px] border border-[#ccc] dark:border-[#343536] mb-4">
                        <div className="h-8 bg-[#33A8FF] rounded-t-[4px]"></div>
                        <div className="px-3 pb-3">
                             <div className="flex items-end gap-2 -mt-4 mb-2">
                                <div className="h-[54px] w-[54px] rounded-full border-4 border-white dark:border-[#1A1A1B] bg-white flex items-center justify-center overflow-hidden">
                                     <div className="h-full w-full bg-[#FF4500] flex items-center justify-center text-white text-3xl font-bold">r/</div>
                                </div>
                                <h1 className="text-[16px] font-bold text-[#1C1C1C] dark:text-[#D7DADC] pb-1">r/AnalysisTrend</h1>
                             </div>
                             <p className="text-[14px] text-[#1C1C1C] dark:text-[#D7DADC] mb-3">
                                Your go-to place for analyzing the latest trends across the web. Join us to discuss data, insights, and predictions.
                             </p>
                             <div className="flex gap-10 mb-3 border-b border-[#EDEFF1] dark:border-[#343536] pb-3">
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
                             
                             <div className="h-[1px] bg-[#EDEFF1] dark:border-[#343536] mb-3"></div>
                             
                             <div className="flex justify-between items-center mb-1">
                                 <span className="text-[10px] font-bold uppercase text-[#7C878A]">Community Options</span>
                                 <svg className="h-4 w-4 text-[#7C878A]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                             </div>
                        </div>
                    </div>

                    {/* Footer / Rules / Premium Ad */}
                    <div className="bg-white dark:bg-[#1A1A1B] p-3 rounded-[4px] border border-[#ccc] dark:border-[#343536] sticky top-[65px]">
                          <div className="flex gap-2 mb-2">
                               <div className="flex-1 text-[12px] text-[#7C878A]">
                                   User Agreement
                               </div>
                               <div className="flex-1 text-[12px] text-[#7C878A]">
                                   Privacy Policy
                               </div>
                          </div>
                          <div className="text-[12px] text-[#7C878A] text-center">Trendit © 2025. All rights reserved.</div>
                    </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
}
