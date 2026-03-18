import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MOCK_MAGAZINES } from '@/shared/mocks/magazines';
import Header from '@/widgets/Header/ui/Header';
import Footer from '@/widgets/Footer/ui/Footer';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return MOCK_MAGAZINES.map((m) => ({ id: String(m.id) }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const magazine = MOCK_MAGAZINES.find((m) => m.id === Number(id));
  if (!magazine) return { title: '매거진 | AnalysisTrend' };
  return {
    title: `${magazine.title} | AnalysisTrend`,
    description: magazine.summary,
  };
}

export default async function MagazineDetailPage({ params }: Props) {
  const { id } = await params;
  const magazine = MOCK_MAGAZINES.find((m) => m.id === Number(id));

  if (!magazine) notFound();

  const currentIndex = MOCK_MAGAZINES.findIndex((m) => m.id === magazine.id);
  const prevMagazine = currentIndex > 0 ? MOCK_MAGAZINES[currentIndex - 1] : null;
  const nextMagazine =
    currentIndex < MOCK_MAGAZINES.length - 1 ? MOCK_MAGAZINES[currentIndex + 1] : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-[#1A1A1B]">
        <article className="max-w-3xl mx-auto px-4 py-10">
          {/* 뒤로가기 */}
          <Link
            href="/magazine"
            className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
          >
            ← 매거진 목록
          </Link>

          {/* 카테고리 배지 */}
          <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold mb-4">
            {magazine.category}
          </span>

          {/* 제목 */}
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
            {magazine.title}
          </h1>

          {/* 메타 */}
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>{magazine.author}</span>
            <span>·</span>
            <span>{magazine.publishedAt}</span>
            <span>·</span>
            <span>{magazine.readTime} 읽기</span>
          </div>

          {/* 썸네일 */}
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image
              src={magazine.thumbnail}
              alt={magazine.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* 요약 본문 */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {magazine.summary}
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              이 콘텐츠는 현재 준비 중입니다. 더 많은 인사이트를 곧 공개할 예정입니다.
            </p>
          </div>

          {/* 이전/다음 네비게이션 */}
          <div className="flex justify-between gap-4 mt-12 pt-6 border-t border-gray-200 dark:border-[#343536]">
            {prevMagazine ? (
              <Link
                href={`/magazine/${prevMagazine.id}`}
                className="flex-1 p-4 rounded-xl border border-gray-200 dark:border-[#343536] hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <p className="text-xs text-gray-400 mb-1">← 이전 글</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {prevMagazine.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {nextMagazine ? (
              <Link
                href={`/magazine/${nextMagazine.id}`}
                className="flex-1 p-4 rounded-xl border border-gray-200 dark:border-[#343536] hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-right"
              >
                <p className="text-xs text-gray-400 mb-1">다음 글 →</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {nextMagazine.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
