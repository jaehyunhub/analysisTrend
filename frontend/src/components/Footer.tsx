export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 dark:bg-[#1A1A1B] pt-12 pb-8 border-t border-gray-200 dark:border-[#343536]">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      A
                  </div>
                  <span>AnalysisTrend</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 max-w-sm">
                  Providing data-driven insights for content creators to maximize their potential. Analyze, optimize, and grow with our advanced AI tools.
              </p>
              <div className="flex gap-4">
                  {/* Social Icons Placeholder */}
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#343536]"></div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#343536]"></div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#343536]"></div>
              </div>
          </div>

          {/* Column 2: Company Info */}
          <div>
              <h3 className="font-bold mb-4">Company Info</h3>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <li>CEO: Jaehyun Kim</li>
                  <li>Reg No: 123-45-67890</li>
                  <li>Address: Teheran-ro, Gangnam-gu, Seoul</li>
                  <li>Tel: 02-1234-5678</li>
                  <li>Email: contact@analysistrend.com</li>
              </ul>
          </div>

          {/* Column 3: CS Center */}
          <div>
               <h3 className="font-bold mb-4">CS Center</h3>
               <div className="text-2xl font-bold text-purple-600 mb-2">1588-0000</div>
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                   AM 10:00 - PM 06:00 (Weekdays)<br/>
                   Closed on Weekends/Holidays
               </p>
               <button className="px-4 py-2 border border-gray-300 dark:border-[#343536] rounded text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#272729]">
                   1:1 Inquiry
               </button>
          </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 border-t border-gray-200 dark:border-[#343536] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
              © 2026 AnalysisTrend. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
              <span className="cursor-pointer hover:text-black dark:hover:text-white">Privacy Policy</span>
              <span className="cursor-pointer hover:text-black dark:hover:text-white">Terms of Service</span>
              <span className="cursor-pointer hover:text-black dark:hover:text-white">Partnership</span>
          </div>
      </div>
    </footer>
  );
}
