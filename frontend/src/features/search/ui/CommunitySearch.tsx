'use client';

import { useState } from 'react';
import { useModalStore } from '@/shared/model/modalStore';

interface CommunitySearchProps {
  onSearch: (query: string) => void;
}

export default function CommunitySearch({ onSearch }: CommunitySearchProps) {
  const [query, setQuery] = useState('');
  const { openCreatePost } = useModalStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-[#1A1A1B] p-2 rounded-xl border border-gray-200 dark:border-[#343536] mb-3 shadow-sm">
        <div className="h-[38px] w-[38px] bg-gray-200 rounded-full overflow-hidden relative shrink-0">
             <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
             </div>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1">
            <input
                type="text"
                placeholder="게시물 또는 커뮤니티 검색..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] hover:bg-white hover:border-blue-500 rounded-xl h-[38px] px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
            />
        </form>

        {/* Create Post Button */}
        <button
           onClick={openCreatePost}
           className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors whitespace-nowrap"
           title="글 작성"
        >
             <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
             글 작성
        </button>
    </div>
  );
}
