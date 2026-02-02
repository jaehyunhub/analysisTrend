'use client';

interface PostProps {
  subreddit: string;
  author: string;
  timeAgo: string;
  title: string;
  content?: string;
  upvotes: string;
  comments: string;
}

export default function PostCard({ subreddit, author, timeAgo, title, content, upvotes, comments }: PostProps) {
  return (
    <div className="flex cursor-pointer bg-white dark:bg-[#1A1A1B] border border-[#ccc] dark:border-[#343536] rounded-[4px] hover:border-[#898989] dark:hover:border-[#818384] mb-[10px] overflow-hidden">
        {/* Vote Sidebar */}
        <div className="w-[40px] flex flex-col items-center bg-[#F8F9FA] dark:bg-[#151516] p-2 pt-3 gap-1">
             <button className="text-[#878A8C] hover:text-[#CC3700] hover:bg-[#EAEAEA] dark:hover:bg-[#343536] p-1 rounded">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h6v8h4v-8h6z"/></svg>
             </button>
             <span className="text-xs font-bold text-[#1A1A1B] dark:text-[#D7DADC]">{upvotes}</span>
             <button className="text-[#878A8C] hover:text-[#5A75CC] hover:bg-[#EAEAEA] dark:hover:bg-[#343536] p-1 rounded">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8h-6v-8h-4v8h-6z"/></svg>
             </button>
        </div>

        {/* Content Area */}
        <div className="p-2 pl-3 w-full bg-white dark:bg-[#1A1A1B]">
             {/* Metadata */}
             <div className="flex items-center gap-1 text-[12px] text-[#787C7E] dark:text-[#818384] mb-2">
                 <div className="h-5 w-5 bg-blue-500 rounded-full"></div>
                 <span className="font-bold text-[#1C1C1C] dark:text-[#D7DADC] hover:underline">r/{subreddit}</span>
                 <span>•</span>
                 <span>Posted by u/{author}</span>
                 <span>{timeAgo}</span>
             </div>

             {/* Title */}
             <h3 className="text-[18px] font-medium leading-[22px] text-[#222222] dark:text-[#D7DADC] mb-2 pr-4">{title}</h3>

             {/* Content Preview */}
             {content && (
                 <div className="text-[14px] leading-[21px] text-[#1C1C1C] dark:text-[#D7DADC] mb-3 relative mask-linear-fade">
                      {content}
                 </div>
             )}

             {/* Action Bar */}
             <div className="flex items-center gap-1 text-[#878A8C] font-bold text-[12px]">
                 <button className="flex items-center gap-2 p-2 hover:bg-[#EAEAEA] dark:hover:bg-[#272729] rounded-[2px] transition-colors">
                     <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
                     <span>{comments} Comments</span>
                 </button>
                 <button className="flex items-center gap-2 p-2 hover:bg-[#EAEAEA] dark:hover:bg-[#272729] rounded-[2px] transition-colors">
                     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                     <span>Share</span>
                 </button>
                 <button className="flex items-center gap-2 p-2 hover:bg-[#EAEAEA] dark:hover:bg-[#272729] rounded-[2px] transition-colors">
                     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                     <span>Save</span>
                 </button>
                 <button className="flex items-center p-2 hover:bg-[#EAEAEA] dark:hover:bg-[#272729] rounded-[2px] transition-colors">
                     <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/></svg>
                 </button>
             </div>
        </div>
    </div>
  );
}
