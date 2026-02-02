'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link"; 

export default function Home() {
  // Mock Data
  const SCHEDULE_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const BOARD_ITEMS = [
      { id: 1, title: "[Notice] Server Maintenance 2024.01.28", date: "01.25" },
      { id: 2, title: "Broadcast Schedule Changes", date: "01.24" },
      { id: 3, title: "New Trend Analysis Features", date: "01.23" },
      { id: 4, title: "Community Guidelines Update", date: "01.22" },
      { id: 5, title: "January Event Winners", date: "01.21" },
  ];

  const RECENT_VIDEOS = [
      { id: 1, title: "Understanding AI Trends in 2026", views: "1.2M", time: "2 days ago", color: "bg-red-900" },
      { id: 2, title: "How to Optimize Thumbnails", views: "854K", time: "5 days ago", color: "bg-blue-900" },
      { id: 3, title: "Live Broadcaster Setup Guide", views: "320K", time: "1 week ago", color: "bg-green-900" },
      { id: 4, title: "Weekly Trend Report: Jan Week 3", views: "150K", time: "2 weeks ago", color: "bg-purple-900" },
  ];

  const POPULAR_POSTS = {
      Economy: [
          { rank: 1, title: "Bitcoin hits new ATH!", comments: 124 },
          { rank: 2, title: "Interest rate discussion", comments: 85 },
          { rank: 3, title: "Best savings accounts 2026", comments: 42 },
          { rank: 4, title: "Real estate bubble?", comments: 38 },
          { rank: 5, title: "My stock portfolio review", comments: 22 },
      ],
      Freedom: [
          { rank: 1, title: "Look at this cat!", comments: 512 },
          { rank: 2, title: "Weekend travel recs?", comments: 230 },
          { rank: 3, title: "Just quit my job today", comments: 189 },
          { rank: 4, title: "Anyone watching the game?", comments: 150 },
          { rank: 5, title: "Favorite lunch spots", comments: 98 },
      ],
      Shopping: [
          { rank: 1, title: "RTX 6090 Stock Alert", comments: 445 },
          { rank: 2, title: "Keyboard GB Open", comments: 120 },
          { rank: 3, title: "Is this jacket worth it?", comments: 88 },
          { rank: 4, title: "Deal: 50% off Monitors", comments: 76 },
          { rank: 5, title: "Sneaker drop discussion", comments: 54 },
      ],
      Broadcast: [
          { rank: 1, title: "Streamer A moved to Platform B", comments: 890 },
          { rank: 2, title: "Last night's broadcast clip", comments: 432 },
          { rank: 3, title: "Schedule update discussion", comments: 210 },
          { rank: 4, title: "Fan Art Contest", comments: 150 },
          { rank: 5, title: "Mic recommendation?", comments: 90 },
      ]
  };

  const SHOP_ITEMS = [
      { id: 1, title: "Official Merchandise Hoodie", price: "$49.99", discount: "20% OFF", image: "bg-gray-200" },
      { id: 2, title: "Trend Analyzer Subscription", price: "$29.99/mo", discount: "HOT", image: "bg-purple-200" },
      { id: 3, title: "Broadcaster Starter Kit", price: "$199.99", discount: "New", image: "bg-blue-200" },
      { id: 4, title: "Custom Keycap Set", price: "$39.99", discount: "", image: "bg-pink-200" },
  ];

  return (
    <div className="bg-white dark:bg-black min-h-screen text-black dark:text-white">
      <Header />
      
      <main className="flex flex-col gap-8 pb-20">
        {/* 1. Hero / Main Banner */}
        <section className="w-full h-[400px] bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <div className="text-center z-10 text-white">
                 <h1 className="text-5xl font-bold mb-4 drop-shadow-md">Unlock Your Trend Potential</h1>
                 <p className="text-xl opacity-90">Data-driven insights for content creators</p>
             </div>
        </section>

        {/* Content Container - Added relative for sidebar positioning */}
        <div className="max-w-[1200px] mx-auto w-full px-6 flex flex-col gap-12 relative">
            
            {/* Side Banner (Ad) - Positioned relative to content width */}
            <aside className="hidden 2xl:block absolute -right-[190px] top-0 h-full w-[160px]">
                {/* Sticky container stops at bottom of parent */}
                <div className="sticky top-24 flex flex-col gap-4">
                    <div className="bg-white dark:bg-[#1A1A1B] p-3 rounded-xl border border-gray-200 dark:border-[#343536] shadow-lg cursor-pointer hover:-translate-y-1 transition-transform">
                        <div className="w-full h-[140px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-2 flex flex-col items-center justify-center text-white p-2 text-center">
                            <span className="font-black text-lg">PRO</span>
                            <span className="text-xs opacity-90">Analysis</span>
                        </div>
                        <p className="text-center text-sm font-bold">Free Trial</p>
                    </div>
                
                    <div className="bg-white dark:bg-[#1A1A1B] p-3 rounded-xl border border-gray-200 dark:border-[#343536] shadow-lg cursor-pointer hover:-translate-y-1 transition-transform">
                        <div className="w-full h-[140px] bg-gray-100 dark:bg-[#272729] rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs text-center border border-dashed border-gray-300 dark:border-gray-700">
                            AD SPACE<br/>Contact Us
                        </div>
                        <p className="text-center text-xs text-gray-500">Inquire</p>
                    </div>
                </div>
            </aside>

            {/* 2. Schedule + Board */}
            <section className="flex flex-col md:flex-row gap-8">
                {/* Left: Schedule */}
                <div className="flex-1 bg-gray-50 dark:bg-[#1A1A1B] p-6 rounded-xl border border-gray-200 dark:border-[#343536]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-6 bg-red-500 rounded-full"></span>
                            Broadcast Schedule
                        </h2>
                        <span className="text-xs text-gray-500">January 2026</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {SCHEDULE_DAYS.map(d => <div key={d} className="text-xs font-bold text-gray-400">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {[...Array(31)].map((_, i) => (
                             <div key={i} className={`aspect-square flex items-center justify-center text-sm rounded ${i === 14 ? 'bg-red-500 text-white font-bold' : 'bg-white dark:bg-[#272729] hover:bg-gray-100 dark:hover:bg-[#343536]'} cursor-pointer transition-colors`}>
                                 {i + 1}
                             </div>
                        ))}
                    </div>
                </div>

                {/* Right: Broadcast Board */}
                <div className="flex-1 bg-white dark:bg-black p-6 rounded-xl border border-gray-200 dark:border-[#343536]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                             <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                             Broadcast News
                        </h2>
                        <Link href="/community" className="text-sm text-gray-400 hover:text-blue-500">More +</Link>
                    </div>
                    <ul className="flex flex-col divide-y divide-gray-100 dark:divide-[#343536]">
                        {BOARD_ITEMS.map(item => (
                            <li key={item.id} className="py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-[#1A1A1B] px-2 rounded cursor-pointer transition-colors">
                                <span className="text-sm truncate pr-4">{item.title}</span>
                                <span className="text-xs text-gray-400 font-mono">{item.date}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* 3. Recent YouTube Videos */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <svg className="w-8 h-8 text-red-600 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    Recent YouTube Videos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {RECENT_VIDEOS.map(video => (
                        <div key={video.id} className="group cursor-pointer">
                            <div className={`aspect-video rounded-lg mb-3 ${video.color} relative overflow-hidden`}>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">10:35</span>
                            </div>
                            <h3 className="font-bold leading-tight group-hover:text-blue-500 transition-colors mb-1 line-clamp-2">{video.title}</h3>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                <span>{video.views} views</span>
                                <span>•</span>
                                <span>{video.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Community Boards */}
            <section className="bg-gray-50 dark:bg-[#1A1A1B] p-8 rounded-2xl mx-auto w-full">
                 <h2 className="text-2xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                     🔥 Popular on Community
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     {Object.entries(POPULAR_POSTS).map(([category, posts]) => (
                         <div key={category} className="bg-white dark:bg-black p-4 rounded-xl border border-gray-100 dark:border-[#343536] shadow-sm">
                             <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-[#343536] pb-2">
                                <h3 className="font-bold text-lg">{category}</h3>
                                <Link href="/community" className="text-xs text-gray-400 hover:text-blue-500">View All</Link>
                             </div>
                             <ul className="flex flex-col gap-3">
                                 {posts.map((post, i) => (
                                     <li key={i} className="flex gap-3 items-start group cursor-pointer">
                                         <span className={`text-sm font-bold w-4 text-center ${post.rank <= 3 ? 'text-red-500' : 'text-gray-400'}`}>{post.rank}</span>
                                         <div className="flex-1 min-w-0">
                                             <div className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-500 group-hover:underline transition-colors">
                                                 {post.title}
                                             </div>
                                             <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                                                 {post.comments}
                                             </div>
                                         </div>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     ))}
                 </div>
            </section>

             {/* 5. Shop Section */}
             <section className="pb-10">
                <div className="flex justify-between items-end mb-6 border-b border-gray-200 dark:border-[#343536] pb-2">
                    <h2 className="text-2xl font-bold">Trend Shop</h2>
                    <span className="text-sm text-gray-500">Best deals for creators</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                    {SHOP_ITEMS.map(product => (
                        <div key={product.id} className="group cursor-pointer">
                            <div className={`aspect-[1/1] rounded-xl mb-4 overflow-hidden ${product.image} relative`}>
                               {product.discount && (
                                   <span className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10">
                                       {product.discount}
                                   </span>
                               )}
                               <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                            </div>
                            <h3 className="font-medium text-base mb-1 group-hover:text-purple-600 transition-colors">{product.title}</h3>
                            <p className="font-bold text-lg">{product.price}</p>
                        </div>
                    ))}
                </div>
            </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
