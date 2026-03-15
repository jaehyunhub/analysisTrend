'use client';

import { useState } from 'react';

export default function AdsManagement() {
  const [ads, setAds] = useState([
    { id: 1, title: 'PRO Analysis', subtitle: 'Free Trial', type: 'gradient', color: 'from-indigo-500 to-purple-600', link: '/pro' },
    { id: 2, title: 'AD SPACE', subtitle: 'Contact Us', type: 'placeholder', color: 'bg-gray-100', link: '/contact' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Sidebar Ad Management</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage the vertical advertisement blocks on the right sidebar.</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-500/30">
          + Add Ad Block
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="relative group bg-white dark:bg-[#1A1A1B] p-4 rounded-xl border border-gray-200 dark:border-[#343536] hover:shadow-lg transition-all hover:scale-[1.02]">
            
             {/* Preview of the Ad Component */}
             <div className="mb-4 pointer-events-none select-none transform scale-95 origin-center bg-gray-50 dark:bg-[#09090b] p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                 <p className="text-[10px] text-gray-400 text-center mb-2 uppercase tracking-wider">Preview</p>
                 <div className="bg-white dark:bg-[#1A1A1B] p-3 rounded-xl border border-gray-200 dark:border-[#343536] shadow-sm w-[160px] mx-auto">
                    <div className={`w-full h-[140px] rounded-lg mb-2 flex flex-col items-center justify-center text-center p-2 
                        ${ad.type === 'gradient' ? `bg-gradient-to-br ${ad.color} text-white` : 'bg-gray-100 dark:bg-[#272729] text-gray-400 border border-dashed border-gray-300 dark:border-gray-700'}
                    `}>
                        <span className="font-black text-lg">{ad.title}</span>
                        {ad.type === 'gradient' && <span className="text-xs opacity-90">Analysis</span>}
                        {ad.type === 'placeholder' && <span className="text-xs">Inquire</span>}
                    </div>
                    <p className="text-center text-sm font-bold dark:text-gray-300">{ad.subtitle}</p>
                </div>
             </div>

             <div className="space-y-2">
                 <div className="flex justify-between items-center">
                     <span className="text-sm font-bold dark:text-white">{ad.title}</span>
                     <span className="text-xs text-gray-400 bg-gray-100 dark:bg-[#272729] px-2 py-1 rounded">{ad.type}</span>
                 </div>
                 <p className="text-xs text-gray-500 truncate">{ad.link}</p>
             </div>

             <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-gray-200 dark:border-[#343536] hover:text-blue-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button className="p-1.5 bg-white dark:bg-black rounded-md shadow-sm border border-gray-200 dark:border-[#343536] hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
             </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button className="border-2 border-dashed border-gray-200 dark:border-[#343536] rounded-xl flex flex-col items-center justify-center p-6 text-gray-400 hover:text-green-500 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all min-h-[300px]">
            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="font-bold">Add New Ad Block</span>
        </button>
      </div>
    </div>
  );
}
