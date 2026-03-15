'use client';

import { useState } from 'react';

export default function MagazineManagement() {
  const [articles, setArticles] = useState([
    { id: 1, title: 'The Future of Streaming: VR Integration', author: 'Editor J', date: '2026-02-01', status: 'Published' },
    { id: 2, title: 'Interview with Top Creator', author: 'Staff A', date: '2026-02-05', status: 'Draft' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Magazine Articles</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Create and publish editorial content.</p>
        </div>
        <button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-orange-500/30">
          + Write New Article
        </button>
      </div>

      <div className="grid gap-6">
        <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-200 dark:border-[#343536] shadow-sm">
             <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#343536] pb-4 mb-4">
                 <h3 className="font-bold text-lg dark:text-white">Recent Articles</h3>
             </div>
             <div className="space-y-4">
                 {articles.map(article => (
                     <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#272729] rounded-xl group hover:bg-gray-100 dark:hover:bg-[#343536] transition-colors cursor-pointer">
                         <div>
                             <h4 className="font-bold text-base dark:text-white mb-1 group-hover:text-blue-500">{article.title}</h4>
                             <p className="text-xs text-gray-500">by {article.author} • {article.date}</p>
                         </div>
                         <div className="flex items-center gap-4">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                 article.status === 'Published' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700'
                             }`}>
                                 {article.status}
                             </span>
                             <button className="text-gray-400 hover:text-blue-500">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
      </div>
    </div>
  );
}
