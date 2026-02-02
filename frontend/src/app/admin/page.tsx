'use client';

import Header from "@/components/Header";
import { useState } from 'react';

const ANALYSIS_RESULT_MOCK = {
  thumbnailAnalysis: {
    score: 85,
    feedback: "High contrast and clear text. Consider increasing the saturation of the main subject.",
    keywords: ["Vibrant", "Clear Font", "Face Visible"]
  },
  titleAnalysis: {
    score: 92,
    feedback: "Strong emotional hook. The use of 'Startling' creates curiosity.",
    suggestions: ["Try adding a number", "Use a question format"]
  },
  trendContext: {
    currentTrends: ["AI Shorts", "Tech Reviews", "ASMR"],
    relevance: "High"
  }
};

export default function AdminPage() {
  const [analysisUrl, setAnalysisUrl] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleAnalyze = () => {
    // Mock analysis delay
    setTimeout(() => setShowResult(true), 1500);
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen text-black dark:text-white">
      <Header />
      <div className="flex max-w-[1400px] mx-auto mt-6">
        {/* Admin Sidebar */}
        <aside className="w-64 p-4 border-r border-gray-200 dark:border-[#343536]">
            <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
            <nav className="flex flex-col gap-2">
                <button className="text-left px-4 py-2 bg-gray-100 dark:bg-[#1A1A1B] rounded font-bold">Dashboard</button>
                <button className="text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#272729] rounded text-gray-600 dark:text-gray-400">User Management</button>
                <button className="text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#272729] rounded text-gray-600 dark:text-gray-400">Content Moderation</button>
                <button className="text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#272729] rounded text-gray-600 dark:text-gray-400">Settings</button>
            </nav>
        </aside>

        {/* Admin Content */}
        <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-lg bg-blue-50 dark:bg-[#1A1A1B] border border-blue-100 dark:border-blue-900">
                    <h3 className="text-sm text-gray-500 font-bold uppercase mb-1">Total Users</h3>
                    <div className="text-4xl font-black text-blue-600">12,450</div>
                    <div className="text-green-500 text-sm mt-2 flex items-center">▲ 12% from last week</div>
                </div>
                <div className="p-6 rounded-lg bg-purple-50 dark:bg-[#1A1A1B] border border-purple-100 dark:border-purple-900">
                    <h3 className="text-sm text-gray-500 font-bold uppercase mb-1">Active Analysis</h3>
                    <div className="text-4xl font-black text-purple-600">856</div>
                    <div className="text-green-500 text-sm mt-2 flex items-center">▲ 5% from yesterday</div>
                </div>
                <div className="p-6 rounded-lg bg-pink-50 dark:bg-[#1A1A1B] border border-pink-100 dark:border-pink-900">
                    <h3 className="text-sm text-gray-500 font-bold uppercase mb-1">Pending Reports</h3>
                    <div className="text-4xl font-black text-pink-600">24</div>
                    <div className="text-red-500 text-sm mt-2 flex items-center">Requires attention</div>
                </div>
            </div>

            {/* AI Trend Analysis Section */}
            <div className="bg-white dark:bg-[#1A1A1B] rounded-lg border border-gray-200 dark:border-[#343536] p-6 mb-8">
               <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                 AI Trend Analysis
               </h2>
               <p className="mb-6 text-gray-600 dark:text-gray-300">
                 Analyze video implementation for AI-powered insights on thumbnails and titles.
               </p>

               <div className="flex gap-2 mb-8">
                 <input 
                   type="text" 
                   placeholder="Paste YouTube Video or Channel URL" 
                   className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-[#343536] bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                   value={analysisUrl}
                   onChange={(e) => setAnalysisUrl(e.target.value)}
                 />
                 <button 
                   onClick={handleAnalyze}
                   className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 transition-all"
                 >
                   Analyze
                 </button>
               </div>

               {showResult && (
                 <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                    <div className="bg-white dark:bg-black p-4 rounded-lg border border-purple-200 dark:border-purple-900">
                       <h3 className="font-bold text-lg mb-2">Thumbnail Score</h3>
                       <div className="text-4xl font-black text-purple-600 mb-2">{ANALYSIS_RESULT_MOCK.thumbnailAnalysis.score}/100</div>
                       <p className="text-sm text-gray-600 dark:text-gray-400">{ANALYSIS_RESULT_MOCK.thumbnailAnalysis.feedback}</p>
                    </div>
                    <div className="bg-white dark:bg-black p-4 rounded-lg border border-pink-200 dark:border-pink-900">
                       <h3 className="font-bold text-lg mb-2">Title Impact</h3>
                       <div className="text-4xl font-black text-pink-600 mb-2">{ANALYSIS_RESULT_MOCK.titleAnalysis.score}/100</div>
                       <ul className="text-sm list-disc list-inside text-gray-600 dark:text-gray-400">
                         {ANALYSIS_RESULT_MOCK.titleAnalysis.suggestions.map(s => <li key={s}>{s}</li>)}
                       </ul>
                    </div>
                    <div className="col-span-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-[#222] dark:to-[#333] p-4 rounded-lg mt-2">
                      <h3 className="font-bold mb-2">Weekly Trend Context</h3>
                      <div className="flex gap-2 flex-wrap">
                         {ANALYSIS_RESULT_MOCK.trendContext.currentTrends.map(t => (
                           <span key={t} className="px-3 py-1 bg-white dark:bg-black rounded-full text-xs font-bold border border-gray-300 dark:border-gray-600">#{t}</span>
                         ))}
                      </div>
                    </div>
                 </div>
               )}
            </div>

            <div className="bg-white dark:bg-[#1A1A1B] rounded-lg border border-gray-200 dark:border-[#343536] p-6">
                <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-[#343536]">
                            <th className="pb-3 text-gray-500">User</th>
                            <th className="pb-3 text-gray-500">Action</th>
                            <th className="pb-3 text-gray-500">Time</th>
                            <th className="pb-3 text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#343536]">
                        <tr>
                            <td className="py-3 font-medium">user_123</td>
                            <td className="py-3">Ran extensive analysis</td>
                            <td className="py-3 text-gray-500">2 mins ago</td>
                            <td className="py-3 text-green-500">Completed</td>
                        </tr>
                         <tr>
                            <td className="py-3 font-medium">admin_jenny</td>
                            <td className="py-3">Updated community rules</td>
                            <td className="py-3 text-gray-500">1 hour ago</td>
                            <td className="py-3 text-blue-500">Logged</td>
                        </tr>
                         <tr>
                            <td className="py-3 font-medium">new_user_99</td>
                            <td className="py-3">Account verify failed</td>
                            <td className="py-3 text-gray-500">3 hours ago</td>
                            <td className="py-3 text-red-500">Error</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
      </div>
    </div>
  );
}
