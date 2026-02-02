'use client';

export default function Sidebar() {
  return (
    <div className="hidden lg:block w-[270px] shrink-0 h-[calc(100vh-49px)] overflow-y-auto sticky top-[49px] py-4 pr-3 bg-white dark:bg-[#1A1A1B] border-r border-[#EDEFF1] dark:border-[#343536]">
      <div className="pl-6 mb-4">
         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Feeds</p>
         <ul className="space-y-0.5">
           <li>
             <a className="flex items-center gap-3 p-2 text-sm text-[#1A1A1B] dark:text-[#D7DADC] bg-[#F6F7F8] dark:bg-[#272729] rounded cursor-pointer">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
                Home
             </a>
           </li>
           <li>
             <a className="flex items-center gap-3 p-2 text-sm text-[#878A8C] dark:text-[#818384] hover:bg-[#F6F7F8] dark:hover:bg-[#272729] rounded cursor-pointer">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                Popular
             </a>
           </li>
         </ul>
      </div>

      <div className="pl-6 mb-4">
         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Recent</p>
         <ul className="space-y-0.5">
           <li>
             <a className="flex items-center gap-3 p-2 text-sm text-[#1A1A1B] dark:text-[#D7DADC] hover:bg-[#F6F7F8] dark:hover:bg-[#272729] rounded cursor-pointer">
                <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white">r/</div>
                r/AnalysisTrend
             </a>
           </li>
            <li>
             <a className="flex items-center gap-3 p-2 text-sm text-[#1A1A1B] dark:text-[#D7DADC] hover:bg-[#F6F7F8] dark:hover:bg-[#272729] rounded cursor-pointer">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white">r/</div>
                r/KoreaIT
             </a>
           </li>
         </ul>
      </div>

      <div className="pl-6 mb-4">
         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Topics</p>
         <ul className="space-y-0.5">
           {['Gaming', 'Sports', 'Business', 'Crypto', 'Television', 'Celebrity'].map(topic => (
             <li key={topic}>
               <a className="flex items-center justify-between p-2 text-sm text-[#1A1A1B] dark:text-[#D7DADC] hover:bg-[#F6F7F8] dark:hover:bg-[#272729] rounded cursor-pointer group">
                  <div className="flex items-center gap-3">
                     <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>
                     {topic}
                  </div>
                  <svg className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
               </a>
             </li>
           ))}
         </ul>
      </div>

       <div className="pl-6 mt-6 pt-4 border-t border-gray-100 dark:border-[#343536]">
          <p className="text-[12px] text-gray-500 mb-2">Create an account to follow your favorite communities and start taking part in conversations.</p>
          <button className="w-full bg-[#D93A00] hover:bg-[#C13200] text-white font-bold py-2 px-4 rounded-full text-sm">Join Reddit</button>
       </div>
    </div>
  );
}
