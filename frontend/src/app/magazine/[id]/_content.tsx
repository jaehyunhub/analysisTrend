'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMagazineStore } from '@/shared/model/magazineStore';
import type { Magazine } from '@/shared/types/magazine';

interface Props {
  id: number;
  fallback: Magazine;
}

export default function MagazineDetailContent({ id, fallback }: Props) {
  const { magazines } = useMagazineStore();
  const magazine = magazines.find((m) => m.id === id) ?? fallback;

  const currentIndex = magazines.findIndex((m) => m.id === magazine.id);
  const prevMagazine = currentIndex > 0 ? magazines[currentIndex - 1] : null;
  const nextMagazine =
    currentIndex < magazines.length - 1 ? magazines[currentIndex + 1] : null;

  return (
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
      <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          {magazine.summary}
        </p>
      </div>

      {/* ── 블록 콘텐츠 (신규) ── */}
      {magazine.blocks && magazine.blocks.length > 0 ? (
        <div className="space-y-6">
          {magazine.blocks.map((block, i) =>
            block.type === 'text' ? (
              <div key={i} className="space-y-3">
                {block.value
                  .split('\n\n')
                  .filter(Boolean)
                  .map((para, j) => (
                    <p
                      key={j}
                      className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
                    >
                      {para}
                    </p>
                  ))}
              </div>
            ) : (
              <div key={i} className="relative w-full rounded-xl overflow-hidden">
                <Image
                  src={block.url}
                  alt={`${magazine.title} - ${i + 1}`}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
            ),
          )}
        </div>
      ) : (
        /* ── 레거시 폴백 ── */
        <div className="space-y-4">
          {magazine.content && (
            <div className="space-y-3">
              {magazine.content.split('\n\n').map((para, i) => (
                <p
                  key={i}
                  className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
                >
                  {para}
                </p>
              ))}
            </div>
          )}
          {magazine.images?.map((src, i) => (
            <div key={i} className="relative w-full rounded-xl overflow-hidden">
              <Image
                src={src}
                alt={`${magazine.title} - ${i + 1}페이지`}
                width={800}
                height={600}
                className="w-full h-auto"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      {/* 원본 링크 */}
      {magazine.sourceUrl && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#343536]">
          <a
            href={magazine.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            슈카친구들 원본 보기 →
          </a>
        </div>
      )}

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
  );
}
