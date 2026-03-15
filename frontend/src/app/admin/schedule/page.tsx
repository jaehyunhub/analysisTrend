'use client';

import { useState } from 'react';

export default function ScheduleManagement() {
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'news'

  // Mock Data
  const [schedules, setSchedules] = useState([
    { id: 1, date: '2026-01-15', title: 'Grand Opening Special', type: 'Special' },
    { id: 2, date: '2026-01-20', title: 'Developer Q&A', type: 'Regular' },
  ]);

  const [news, setNews] = useState([
    { id: 1, date: '01.25', title: '[Notice] Server Maintenance 2024.01.28' },
    { id: 2, date: '01.24', title: 'Broadcast Schedule Changes' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold dark:text-white">Schedule & News Management</h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Manage the monthly calendar events and community news ticker.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-[#272729] p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('schedule')}
             className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'schedule' ? 'bg-white dark:bg-[#1A1A1B] text-blue-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
           >
             Calendar Events
           </button>
           <button 
             onClick={() => setActiveTab('news')}
             className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'news' ? 'bg-white dark:bg-[#1A1A1B] text-purple-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
           >
             Broadcast News
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1B] p-6 rounded-2xl border border-gray-200 dark:border-[#343536] shadow-sm min-h-[400px]">
        
        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg dark:text-white">Monthly Schedule Items</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20">
                  + Add Event
                </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#343536] text-gray-400">
                    <th className="pb-3 pl-2">Date</th>
                    <th className="pb-3">Event Title</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
                  {schedules.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors rounded-lg group">
                      <td className="py-3 pl-2 font-mono text-gray-600 dark:text-gray-300">{item.date}</td>
                      <td className="py-3 font-medium dark:text-white">{item.title}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'Special' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button className="text-gray-400 hover:text-blue-500 mr-3">Edit</button>
                        <button className="text-gray-400 hover:text-red-500">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg dark:text-white">Broadcast News Ticker</h3>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-purple-500/20">
                  + Add News
                </button>
            </div>

            <div className="space-y-3">
              {news.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-[#343536] rounded-xl hover:bg-gray-50 dark:hover:bg-[#212124] transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex flex-col items-center justify-center bg-gray-100 dark:bg-[#343536] rounded-lg text-xs font-bold text-gray-500">
                          <span>{item.date.split('.')[0]}</span>
                          <span>{item.date.split('.')[1]}</span>
                      </div>
                      <span className="font-medium dark:text-white">{item.title}</span>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Using always visible buttons for now for better UX on mobile/touch */}
                      <button className="p-2 bg-white dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg text-gray-500 hover:text-blue-500">
                        Edit
                      </button>
                      <button className="p-2 bg-white dark:bg-[#272729] border border-gray-200 dark:border-[#343536] rounded-lg text-gray-500 hover:text-red-500">
                        Del
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
