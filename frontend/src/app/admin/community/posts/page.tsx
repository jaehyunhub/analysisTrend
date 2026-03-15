'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PostManagement() {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Check out this totally legal free download site', author: 'spammer_bot', subreddit: 'r/Games', date: '2026-02-08', reports: 12, status: 'Reported' },
    { id: 2, title: 'My honest review of existing trend analysis', author: 'trend_master', subreddit: 'r/AnalysisTrend', date: '2026-02-09', reports: 0, status: 'Active' },
    { id: 3, title: 'Hate speech example title', author: 'toxic_user', subreddit: 'r/Politics', date: '2026-02-07', reports: 5, status: 'Reported' },
  ]);

  const removePost = (id: number) => {
      if (confirm('Are you sure you want to delete this post?')) {
          setPosts(posts.filter(p => p.id !== id));
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Post Moderation</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Review reported content and remove guideline violations.</p>
        </div>
      </div>

      <div className="grid gap-4">
          {posts.map(post => (
              <div key={post.id} className={`bg-white dark:bg-[#1A1A1B] p-4 rounded-xl border ${post.status === 'Reported' ? 'border-red-200 dark:border-red-900/50' : 'border-gray-200 dark:border-[#343536]'} shadow-sm flex items-center justify-between`}>
                  <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              post.status === 'Reported' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                              {post.status}
                          </span>
                          <span className="text-xs text-gray-500 font-bold">{post.subreddit}</span>
                          <span className="text-xs text-gray-400">• Posted by {post.author} • {post.date}</span>
                      </div>
                      <h3 className="font-bold text-base dark:text-white truncate">{post.title}</h3>
                      {post.reports > 0 && (
                          <div className="text-xs text-red-500 font-bold mt-1">⚠️ {post.reports} User Reports</div>
                      )}
                  </div>
                  <div className="flex items-center gap-2">
                      <Link href={`/community/r/${post.subreddit.replace('r/', '')}/comments/${post.id}`} className="px-3 py-2 bg-gray-50 dark:bg-[#272729] text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100">
                          View
                      </Link>
                      <button 
                        onClick={() => removePost(post.id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100"
                      >
                          Delete
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}
