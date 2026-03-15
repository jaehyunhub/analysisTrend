'use client';

import Header from "@/widgets/Header/ui/Header";
import Sidebar from "@/widgets/Sidebar/ui/Sidebar";
import { useState } from 'react';
import Link from "next/link";

export default function CreatePostPage() {
  const [selectedTab, setSelectedTab] = useState('post'); // post, image, link, poll
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('r/AnalysisTrend');

  return (
    <div className="bg-[#DAE0E6] dark:bg-[#030303] min-h-screen">
      <Header />
      
      <div className="flex justify-center px-4 py-8">
        <div className="flex w-full max-w-[1200px] gap-6">
             
             {/* Left Sidebar - Reuse Global Sidebar */}
             <Sidebar />

             {/* Main Content Area */}
             <div className="flex-1 w-full max-w-[740px]">
                 
                 <div className="flex justify-between items-end mb-4 border-b border-white dark:border-[#343536] pb-2">
                     <h1 className="text-lg font-medium text-[#1C1C1C] dark:text-[#D7DADC]">Create a post</h1>
                     <button className="text-xs font-bold text-[#0079D3] uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-[#272729] px-2 py-1 rounded">
                         Drafts <span className="text-gray-500 rounded bg-gray-200 dark:bg-[#343536] px-1 ml-1">0</span>
                     </button>
                 </div>

                 {/* Department/Community Selector */}
                 <div className="bg-white dark:bg-[#1A1A1B] w-[300px] h-10 rounded-[4px] border border-[#EDEFF1] dark:border-[#343536] flex items-center px-2 mb-4 relative">
                     <div className="h-6 w-6 bg-gray-200 rounded-full mr-2"></div>
                     <select 
                        value={selectedCommunity}
                        onChange={(e) => setSelectedCommunity(e.target.value)}
                        className="flex-1 appearance-none bg-transparent text-sm font-bold text-[#1C1C1C] dark:text-[#D7DADC] outline-none"
                     >
                         <option>r/AnalysisTrend</option>
                         <option>r/KoreaIT</option>
                         <option>r/GameDev</option>
                         <option>r/WebDesign</option>
                     </select>
                     <svg className="w-4 h-4 text-gray-500 absolute right-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                 </div>

                 {/* Post Creation Form */}
                 <div className="bg-white dark:bg-[#1A1A1B] rounded-[4px] overflow-hidden">
                     {/* Tabs */}
                     <div className="flex border-b border-[#EDEFF1] dark:border-[#343536]">
                         {['post', 'image', 'link', 'poll'].map(tab => (
                             <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`flex-1 flex items-center justify-center py-4 text-sm font-bold border-r border-[#EDEFF1] dark:border-[#343536] hover:bg-[#F6F7F8] dark:hover:bg-[#272729] capitalize ${
                                    selectedTab === tab 
                                    ? 'text-[#0079D3] border-b-2 border-b-[#0079D3] bg-[#F6F7F8] dark:bg-[#272729]' 
                                    : 'text-[#878A8C] dark:text-[#818384]'
                                }`}
                             >
                                 {tab}
                             </button>
                         ))}
                     </div>

                     <div className="p-4">
                         <div className="mb-4">
                             <input 
                                type="text" 
                                placeholder="Title" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-sm p-3 border border-[#EDEFF1] dark:border-[#343536] rounded-[4px] bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                                maxLength={300}
                             />
                             <div className="text-right text-[10px] text-gray-400 mt-1">{title.length}/300</div>
                         </div>

                         {selectedTab === 'post' && (
                             <div className="mb-4">
                                 <textarea 
                                    placeholder="Text (optional)" 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full text-sm p-3 min-h-[200px] border border-[#EDEFF1] dark:border-[#343536] rounded-[4px] bg-transparent focus:outline-none focus:border-black dark:focus:border-white resize-y"
                                 ></textarea>
                             </div>
                         )}
                         
                         {selectedTab === 'image' && (
                             <div className="mb-4 py-20 border-2 border-dashed border-[#EDEFF1] dark:border-[#343536] rounded-[4px] flex flex-col items-center justify-center text-gray-500">
                                 <p className="mb-2">Drag and drop images or</p>
                                 <button className="px-4 py-2 border border-[#0079D3] text-[#0079D3] font-bold rounded-full text-sm hover:bg-[#F6F7F8]">Upload</button>
                             </div>
                         )}

                         <div className="flex flex-col md:flex-row items-center justify-between border-t border-[#EDEFF1] dark:border-[#343536] pt-4 gap-4">
                             <div className="flex gap-2">
                                 <button className="px-3 py-1 text-xs font-bold text-gray-500 border border-transparent hover:bg-gray-100 rounded-full flex items-center gap-1">
                                     <span className="text-lg">+</span> OC
                                 </button>
                                 <button className="px-3 py-1 text-xs font-bold text-gray-500 border border-transparent hover:bg-gray-100 rounded-full flex items-center gap-1">
                                     <span className="text-lg">+</span> Spoiler
                                 </button>
                                 <button className="px-3 py-1 text-xs font-bold text-gray-500 border border-transparent hover:bg-gray-100 rounded-full flex items-center gap-1">
                                     <span className="text-lg">+</span> NSFW
                                 </button>
                             </div>
                             <div className="flex gap-2 w-full md:w-auto">
                                 <button className="flex-1 md:flex-none px-6 py-2 border border-[#0079D3] text-[#0079D3] font-bold rounded-full text-sm hover:bg-[#F6F7F8] dark:hover:bg-[#272729]">
                                     Save Draft
                                 </button>
                                 <button 
                                    className={`flex-1 md:flex-none px-6 py-2 bg-[#0079D3] text-white font-bold rounded-full text-sm hover:bg-[#006CBB] disabled:opacity-50 disabled:cursor-not-allowed`}
                                    disabled={!title}
                                 >
                                     Post
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Posting Rules Sidebar (Inline for cleaner layout on mobile/desktop hybrid) */}
                 <div className="mt-8 bg-white dark:bg-[#1A1A1B] p-4 rounded-[4px] border border-[#ccc] dark:border-[#343536]">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#EDEFF1] dark:border-[#343536]">
                         <div className="h-8 w-8 bg-black rounded-full text-white flex items-center justify-center font-serif font-bold">r/</div>
                         <h3 className="font-bold text-sm">Posting to {selectedCommunity}</h3>
                     </div>
                     <ol className="list-decimal pl-5 text-sm space-y-2 text-[#1C1C1C] dark:text-[#D7DADC]">
                         <li>Remember the human</li>
                         <li>Behave like you would in real life</li>
                         <li>Look for the original source of content</li>
                         <li>Search for duplicates before posting</li>
                         <li>Read the community's rules</li>
                     </ol>
                 </div>

             </div>
        </div>
      </div>
    </div>
  );
}
