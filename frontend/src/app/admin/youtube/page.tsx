'use client';

import { useState } from 'react';

export default function YoutubeManagement() {
  const [videos, setVideos] = useState([
    { id: 1, title: 'Understanding AI Trends in 2026', views: '1.2M', time: '2 days ago', color: 'bg-red-900', duration: '10:35' },
    { id: 2, title: 'How to Optimize Thumbnails', views: '854K', time: '5 days ago', color: 'bg-blue-900', duration: '15:20' },
    { id: 3, title: 'Live Broadcaster Setup Guide', views: '320K', time: '1 week ago', color: 'bg-green-900', duration: '08:45' },
    { id: 4, title: 'Weekly Trend Report: Jan Week 3', views: '150K', time: '2 weeks ago', color: 'bg-purple-900', duration: '22:15' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Recent YouTube Videos</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage the video grid on the main page.</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-500/30">
          + Add Video
        </button>
      </div>

      <div className="bg-white dark:bg-[#1A1A1B] rounded-2xl border border-gray-200 dark:border-[#343536] overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-gray-50 dark:bg-[#272729] border-b border-gray-200 dark:border-[#343536]">
             <tr>
               <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Video Info</th>
               <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Stats</th>
               <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
             {videos.map((video) => (
               <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-[#212124] transition-colors">
                 <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-32 aspect-video rounded-lg ${video.color} relative flex items-center justify-center text-white flex-shrink-0`}>
                            <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded">{video.duration}</span>
                        </div>
                        <div>
                            <p className="font-bold text-sm dark:text-gray-200 line-clamp-2">{video.title}</p>
                            <p className="text-xs text-blue-500 mt-1 cursor-pointer hover:underline">https://youtu.be/example...</p>
                        </div>
                    </div>
                 </td>
                 <td className="px-6 py-4">
                    <div className="text-sm font-mono dark:text-gray-300">
                        <span className="block">{video.views} views</span>
                        <span className="text-gray-400 text-xs">{video.time}</span>
                    </div>
                 </td>
                 <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button className="px-3 py-1.5 bg-gray-100 dark:bg-[#343536] hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-lg text-xs font-bold transition-colors">Edit</button>
                        <button className="px-3 py-1.5 bg-gray-100 dark:bg-[#343536] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg text-xs font-bold transition-colors">Delete</button>
                    </div>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
        
        {videos.length === 0 && (
          <div className="p-8 text-center text-gray-400">
             No videos added yet.
          </div>
        )}
      </div>
    </div>
  );
}
