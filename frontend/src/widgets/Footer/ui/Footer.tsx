import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 dark:bg-[#1A1A1B] pt-12 pb-8 border-t border-gray-200 dark:border-[#343536]">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                  <div className="h-9 w-9 rounded-full overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/syuka-logo.jpg" alt="SyukaUniverse" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xl font-black text-gray-900 dark:text-white">슈카유니버스</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 max-w-sm">
                  경제·시사 뉴스를 조사하여 PPT로 정리하고 시청자에게 소개하는 유튜브 채널의 공식 통합 플랫폼입니다.
              </p>
              <div className="flex gap-3">
                  <a href="#" aria-label="유튜브" className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#343536] hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  </a>
                  <a href="#" aria-label="인스타그램" className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#343536] hover:bg-pink-100 dark:hover:bg-pink-900/30 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  <a href="#" aria-label="카카오채널" className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#343536] hover:bg-yellow-100 dark:hover:bg-yellow-900/30 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C5.9 3 1 6.9 1 11.8c0 3.2 2.1 6 5.4 7.6-.1.6-.4 2.1-.4 2.2 0 .2 0 .4.3.5.1 0 .2.1.3.1.2 0 .4-.1.6-.2.4-.3 3.8-2.6 4.3-3 .2 0 .5.1.8.1 6.1 0 11-3.9 11-8.8C23 6.9 18.1 3 12 3z"/></svg>
                  </a>
              </div>
          </div>

          {/* Column 2: Company Info */}
          <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4">회사 정보</h3>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <li>대표: 슈카</li>
                  <li>사업자등록번호: 123-45-67890</li>
                  <li>주소: 서울 강남구 테헤란로 123</li>
                  <li>전화: 02-1234-5678</li>
                  <li>이메일: syuka@syukafriends.com</li>
              </ul>
          </div>

          {/* Column 3: CS Center */}
          <div>
               <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4">고객센터</h3>
               <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-2">1588-0000</div>
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                   평일 오전 10:00 - 오후 06:00<br/>
                   주말·공휴일 휴무
               </p>
               <button className="px-5 py-2 border border-gray-300 dark:border-[#343536] rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors text-gray-700 dark:text-gray-300">
                   1:1 문의하기
               </button>
          </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1200px] mx-auto px-6 pt-6 border-t border-gray-200 dark:border-[#343536] flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400">
              © 2026 슈카유니버스. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-gray-400">
              <Link href="#" className="hover:text-gray-700 dark:hover:text-white transition-colors">개인정보처리방침</Link>
              <Link href="#" className="hover:text-gray-700 dark:hover:text-white transition-colors">이용약관</Link>
              <Link href="#" className="hover:text-gray-700 dark:hover:text-white transition-colors">광고 · 제휴 문의</Link>
          </div>
      </div>
    </footer>
  );
}
