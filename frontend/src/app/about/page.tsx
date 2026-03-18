import Header from '@/widgets/Header/ui/Header';
import Footer from '@/widgets/Footer/ui/Footer';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '소개 | AnalysisTrend',
  description: 'AnalysisTrend 서비스 소개',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-[#1A1A1B]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* 히어로 */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-black text-3xl mb-6 shadow-lg">
              A
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              AnalysisTrend
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              방송인과 크리에이터를 위한 트렌드 분석 플랫폼
            </p>
          </div>

          {/* 서비스 소개 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              서비스 소개
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              AnalysisTrend는 유튜브 방송인 및 콘텐츠 크리에이터가 실시간 트렌드를 파악하고
              데이터에 기반한 의사결정을 내릴 수 있도록 돕는 종합 플랫폼입니다. 채팅 분석,
              뉴스 키워드 추적, YouTube 트렌딩 모니터링을 하나의 대시보드에서 경험할 수
              있습니다.
            </p>
          </section>

          {/* 핵심 기능 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">핵심 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: '📊',
                  title: '채팅 분석',
                  desc: 'CSV/JSON/TXT 형식의 채팅 파일을 업로드하면 실시간 히트맵, 피크 구간, 핵심 키워드를 자동 분석합니다.',
                },
                {
                  icon: '📰',
                  title: '뉴스 키워드',
                  desc: '30분마다 최신 뉴스를 수집해 핵심 키워드 트렌드를 추적합니다. 방송 주제 선정에 바로 활용하세요.',
                },
                {
                  icon: '🎬',
                  title: 'YouTube 트렌딩',
                  desc: '국가·카테고리별 급상승 동영상을 실시간으로 모니터링합니다. 경쟁 채널 분석에 활용하세요.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-xl bg-gray-50 dark:bg-[#1E1E1F] border border-gray-200 dark:border-[#343536]"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 기술 스택 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">기술 스택</h2>
            <div className="flex flex-wrap gap-2">
              {[
                'Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4',
                'Zustand', 'Spring Boot 3.5', 'FastAPI', 'MySQL', 'Redis',
                'Docker', 'Nginx',
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
