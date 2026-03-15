'use client';

import { useState } from 'react';

export default function BannerManagement() {
  const [banners, setBanners] = useState([
    { id: 1, title: 'Unlock Your Trend Potential', subtitle: 'Data-driven insights for content creators', image: 'bg-gradient-to-r from-blue-900 to-purple-900', active: true },
    { id: 2, title: 'Winter Season Special', subtitle: 'Warm up your stats', image: 'bg-gradient-to-r from-blue-500 to-cyan-500', active: false },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Main Banner Management</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage the rotating hero banners on the main page.</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-500/30"
        >
          {isEditing ? 'Cancel' : '+ Add Banner'}
        </button>
      </div>

      {/* Add/Edit Form Area */}
      {isEditing && (
        <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-200 dark:border-[#343536] shadow-sm animate-fade-in-down">
          <h3 className="font-bold mb-4 dark:text-white">Create New Banner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Title</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter headline..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Subtitle</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter description..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-1">Background Style / Image URL</label>
              <div className="flex gap-2">
                 <input type="text" className="flex-1 bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. bg-gradient-to-r from-blue-900..." />
                 <button className="px-4 py-2 bg-gray-100 dark:bg-[#343536] rounded-lg text-sm font-medium dark:text-gray-300">Upload</button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">Preview</button>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/30">Save Banner</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="grid gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="group bg-white dark:bg-[#1A1A1B] p-4 rounded-xl border border-gray-200 dark:border-[#343536] flex flex-col md:flex-row gap-4 items-center">
            {/* Preview Box */}
            <div className={`w-full md:w-48 h-24 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs ${banner.image}`}>
                [Preview]
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-lg dark:text-white">{banner.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{banner.subtitle}</p>
            </div>

            <div className="flex items-center gap-4">
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${banner.active ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                 {banner.active ? 'Active' : 'Draft'}
               </span>
               <div className="flex gap-2">
                 <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 </button>
                 <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
