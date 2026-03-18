import Link from 'next/link';
import Image from 'next/image';
import { MOCK_MAGAZINES } from '@/shared/mocks/magazines';
import Header from '@/widgets/Header/ui/Header';
import Footer from '@/widgets/Footer/ui/Footer';

const CATEGORIES = ['전체', '트렌드', '마케팅', '테크', '라이프'];

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '매거진 | AnalysisTrend',
  description: '트렌드 분석 매거진',
};

export default function MagazinePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#1A1A1B]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">매거진</h1>
            <p className="text-gray-500 dark:text-gray-400">
              트렌드 분석과 크리에이터를 위한 인사이트
            </p>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-[#272729] border border-gray-200 dark:border-[#343536] text-gray-700 dark:text-gray-300 cursor-pointer hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* 피처드 아티클 */}
          {MOCK_MAGAZINES[0] && (
            <Link
              href={`/magazine/${MOCK_MAGAZINES[0].id}`}
              className="block mb-8 group"
            >
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
                <Image
                  src={MOCK_MAGAZINES[0].thumbnail}
                  alt={MOCK_MAGAZINES[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <span className="inline-block px-2.5 py-1 bg-blue-600 rounded-full text-xs font-bold mb-2">
                    {MOCK_MAGAZINES[0].category}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black mb-1 line-clamp-2">
                    {MOCK_MAGAZINES[0].title}
                  </h2>
                  <p className="text-sm text-white/80">
                    {MOCK_MAGAZINES[0].author} · {MOCK_MAGAZINES[0].readTime} 읽기
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* 매거진 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_MAGAZINES.slice(1).map((magazine) => (
              <Link
                key={magazine.id}
                href={`/magazine/${magazine.id}`}
                className="group bg-white dark:bg-[#1E1E1F] rounded-xl overflow-hidden border border-gray-200 dark:border-[#343536] hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={magazine.thumbnail}
                    alt={magazine.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-bold mb-2">
                    {magazine.category}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {magazine.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {magazine.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>{magazine.author}</span>
                    <span>{magazine.readTime} 읽기</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
