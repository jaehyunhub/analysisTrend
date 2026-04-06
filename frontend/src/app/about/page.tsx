'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/widgets/Header/ui/Header';
import Footer from '@/widgets/Footer/ui/Footer';
import Link from 'next/link';
import { LoginModal } from '@/features/auth/ui/LoginModal';
import { useAuthStore } from '@/shared/model/authStore';

const PROBLEMS = [
  {
    icon: '🔍',
    title: '자료조사에 많은 시간이 든다',
    desc: '네이버, 구글, YouTube를 일일이 확인하며 수동으로 트렌드를 조사합니다.',
    detail: '경제·시사 주제 선정을 위한 반복 작업이 콘텐츠 제작 시간을 잠식합니다.',
  },
  {
    icon: '✂️',
    title: '채팅 분석에 많은 시간이 든다',
    desc: '라이브 채팅 로그를 눈으로 스크롤하며 하이라이트 구간을 수동으로 찾아 편집합니다.',
    detail: '쇼츠 제작·편집 효율화가 가장 시급한 병목 구간입니다.',
  },
  {
    icon: '🔀',
    title: '사이트가 뿔뿔이 흩어져 있다',
    desc: '쇼핑몰, 위폴, 커뮤니티가 각각 별도 사이트로 운영 포인트가 3곳 이상입니다.',
    detail: '관리자가 여러 사이트를 오가며 관리해야 해 비효율이 누적됩니다.',
  },
];

const SOLUTIONS = [
  {
    icon: '🧠',
    title: '콘텐츠 인텔리전스',
    desc: 'AI 기반 트렌드·채팅 분석으로 자료조사와 편집 시간을 줄입니다.',
    detail: '뉴스 키워드, YouTube 급상승, 채팅 히트맵을 하나의 대시보드에서 확인.',
  },
  {
    icon: '🗂️',
    title: '통합 운영 관리',
    desc: '쇼핑몰, 위폴(커뮤니티 투표), 매거진, 방송일정을 하나의 관리자 패널에서 운영합니다.',
    detail: '배너·일정·유튜브·상품·광고·회원까지 7개 관리 메뉴가 한 곳에.',
  },
  {
    icon: '💡',
    title: '아이디어 허브',
    desc: '커뮤니티에 보고서를 업데이트하고, 시청자·출연진의 아이디어를 수집하는 공간을 만듭니다.',
    detail: 'PD님들의 캐릭터성을 살린 코너 기획, 시청자 피드백을 데이터로 확인.',
  },
];

const IMPACTS = [
  { number: '30%+', label: '자료조사 시간 절감 목표', sub: '슈카님 영상·활동 활성화 → 수익성 향상 기대' },
  { number: '30%+', label: '편집 시간 절감 목표', sub: '아이디어 회의·촬영 시간 추가 확보 기대' },
  { number: '7개', label: '관리 메뉴 통합', sub: '배너·일정·유튜브·매거진·광고·상품·회원' },
  { number: '1곳', label: '모든 채널 정보 통합', sub: '유튜브·커뮤니티·쇼핑몰을 한 플랫폼에서' },
  { number: '3+', label: 'PD 코너화 (계획)', sub: '핫산형·조커PD·배균PD 개별 콘텐츠 다양화' },
];

const FEATURES = [
  {
    icon: '📊',
    title: '트렌드 분석',
    desc: '뉴스 키워드, YouTube 급상승, 통합 키워드를 30분 자동 갱신으로 제공합니다. 방송 주제 선정에 바로 활용하세요.',
    tags: ['실시간', '네이버 뉴스', 'YouTube API', '자동 갱신'],
  },
  {
    icon: '💬',
    title: '채팅 분석',
    desc: '라이브 채팅 파일을 업로드하면 히트맵, 피크 구간, 키워드 타임라인을 자동 생성합니다. 편집 구간 파악에 바로 활용하세요.',
    tags: ['히트맵', '피크 감지', '키워드 타임라인', 'CSV/JSON'],
  },
  {
    icon: '📈',
    title: '채널 분석',
    desc: 'YouTube 채널 통계를 대시보드로 확인합니다. 어떤 콘텐츠가 성장에 기여하는지 데이터 기반으로 판단하세요.',
    tags: ['구독자·조회수', '영상 성과', 'YouTube API'],
  },
  {
    icon: '🏘️',
    title: '커뮤니티',
    desc: '경제·방송·쇼핑·자유게시판 4개 카테고리. 게시물·댓글(트리 스레딩)·투표·검색을 지원합니다.',
    tags: ['투표', '댓글 스레딩', '검색', '카테고리'],
  },
  {
    icon: '🛍️',
    title: '쇼핑몰',
    desc: '슈카친구들 공식 상품을 관리합니다. 장바구니, Q&A, 리뷰, Cafe24 CDN 연동까지 지원합니다.',
    tags: ['상품 CRUD', '장바구니', 'Q&A', '리뷰'],
  },
  {
    icon: '📰',
    title: '매거진',
    desc: '블록 에디터 기반 아티클을 발행합니다. 텍스트와 이미지를 자유롭게 조합해 보고서를 작성하세요.',
    tags: ['블록 에디터', '즉시 발행', '카테고리'],
  },
  {
    icon: '⚙️',
    title: '관리자 패널',
    desc: '배너, 방송일정, 유튜브, 매거진, 광고, 상품, 회원관리를 하나의 어드민에서 조작합니다.',
    tags: ['7개 CRUD', '권한 관리', '셀프서비스'],
  },
  {
    icon: '📅',
    title: '방송 일정·공지',
    desc: '캘린더 기반 일정 관리. 시청자에게 다음 방송 정보를 자동 노출하고 공지를 관리합니다.',
    tags: ['캘린더', '자동 노출', '공지 관리'],
  },
];

const PERSONAS = [
  {
    emoji: '🎙️',
    name: '슈카님',
    role: '채널 운영·기획',
    needs: '실시간 트렌드로 다음 영상 주제를 빠르게 결정하고, 채널 성과 데이터로 콘텐츠 전략을 수립합니다.',
  },
  {
    emoji: '🎬',
    name: 'PD님들',
    role: '편집·쇼츠 제작',
    needs: '채팅 분석으로 하이라이트 구간을 자동 추출해 편집 시간을 절감하고, 아이디어 회의에 시간을 더 씁니다.',
  },
  {
    emoji: '📋',
    name: '알상무님·박팀장님',
    role: '리서처·작가',
    needs: '뉴스 키워드·YouTube 급상승을 한눈에 확인해 자료조사 시간을 단축합니다. 추후 자동화 예정.',
  },
  {
    emoji: '💼',
    name: '구독자 (30~40대)',
    role: '경제 관심 시청자',
    needs: '커뮤니티에서 깊이 있는 경제 토론을 하고, 채널 굿즈를 쉽게 구매합니다.',
  },
  {
    emoji: '📱',
    name: '라이트 시청자 (20대)',
    role: '커뮤니티 참여자',
    needs: '간편하게 커뮤니티에 참여하고 다른 시청자들과 소통합니다.',
  },
];

const ROADMAP = [
  {
    phase: 'v1.0 · 현재',
    title: '핵심 기능 완성',
    status: 'done',
    items: ['트렌드·채팅·채널 분석', '커뮤니티 (게시물·댓글·투표)', '쇼핑몰 + 관리자 패널', '매거진·방송일정·배너'],
  },
  {
    phase: 'Phase 2',
    title: '자동화 확장',
    status: 'plan',
    items: ['알상무님·박팀장님 자료조사 자동화', '콘텐츠 제작 워크플로우 자동화', 'PD 캐릭터별 코너 운영 지원'],
  },
  {
    phase: 'Phase 3',
    title: '업무 인텔리전스',
    status: 'plan',
    items: [
      '회계·인사 등 반복 업무 자동화 (편의점 매출 분석 경험 기반)',
      '텔레그램 증권사 분석·의견 통합 뷰어',
      '주요 리포트를 한 화면에서 실시간 수집',
    ],
  },
  {
    phase: 'Phase 4',
    title: '인프라 고도화 및 지능화',
    status: 'plan',
    items: ['AWS 배포 서버 교체', '보안·로그인 기능 개선', '쇼핑 결제 기능 추가', 'AI 기반 콘텐츠 추천'],
  },
];

const TECH_STACK = {
  '프론트엔드': ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Zustand'],
  '백엔드': ['Spring Boot 3.5', 'Java 17', 'JPA', 'QueryDSL', 'JWT·OAuth2', 'Redis'],
  '분석 엔진': ['FastAPI', 'Python', 'NLP', 'APScheduler'],
  '인프라': ['Docker', 'Nginx', 'MySQL', 'AWS (예정)'],
};

export default function AboutPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleAdminClick = () => {
    if (isAuthenticated) {
      router.push('/admin');
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-[#1A1A1B]">

        {/* 1. Hero */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full overflow-hidden mb-6 shadow-lg ring-4 ring-white/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/syuka-logo.jpg" alt="SyukaUniverse" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
              슈카월드의 모든 것을<br />하나의 플랫폼으로
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              자료조사 시간은 줄이고, 콘텐츠 제작에 집중할 수 있는<br className="hidden md:block" />
              통합 운영 플랫폼 <strong className="text-white">SyukaUniverse</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#features"
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl px-8 py-3.5 transition-colors text-sm"
              >
                기능 살펴보기 ↓
              </a>
              <button
                onClick={handleAdminClick}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-xl px-8 py-3.5 transition-colors text-sm backdrop-blur-sm"
              >
                관리자 패널 체험
              </button>
            </div>
          </div>
        </section>

        {/* 2. 문제 정의 */}
        <section className="py-20 bg-white dark:bg-[#1A1A1B]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full mb-4">현재 문제</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                현재 이런 시간이 낭비되고 있습니다
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROBLEMS.map((p) => (
                <div key={p.title} className="rounded-2xl border border-gray-200 dark:border-[#343536] p-6 border-t-4 border-t-red-500">
                  <div className="text-3xl mb-4">{p.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{p.desc}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. 솔루션 개요 */}
        <section className="py-20 bg-blue-50 dark:bg-blue-950/10">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-4">솔루션</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                하나의 플랫폼으로 해결합니다
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SOLUTIONS.map((s) => (
                <div key={s.title} className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-6 border-t-4 border-t-green-500">
                  <div className="text-3xl mb-4">{s.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{s.desc}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. 기대 효과 KPI */}
        <section className="py-20 bg-white dark:bg-[#1A1A1B]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-4">기대 효과</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                이런 변화를 기대할 수 있습니다
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {IMPACTS.map((impact) => (
                <div key={impact.label} className="bg-gray-50 dark:bg-[#1E2028] rounded-2xl border border-gray-100 dark:border-[#343536] p-5 text-center">
                  <div className="text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">{impact.number}</div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm mb-1">{impact.label}</div>
                  <div className="text-xs text-gray-400 leading-relaxed">{impact.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. 핵심 기능 쇼케이스 */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-[#111318]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold px-3 py-1 rounded-full mb-4">기능</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                이미 구현되어 있습니다
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">8개 핵심 기능이 지금 바로 사용 가능합니다</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0">{f.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{f.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{f.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 페르소나 맵 */}
        <section className="py-20 bg-white dark:bg-[#1A1A1B]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold px-3 py-1 rounded-full mb-4">사용자</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                누가 어떻게 사용하나요?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {PERSONAS.map((p) => (
                <div key={p.name} className="bg-gray-50 dark:bg-[#1E2028] rounded-2xl border border-gray-100 dark:border-[#343536] p-5 text-center">
                  <div className="text-4xl mb-3">{p.emoji}</div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">{p.name}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-3">{p.role}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{p.needs}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. 로드맵 */}
        <section className="py-20 bg-gray-50 dark:bg-[#111318]">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full mb-4">로드맵</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                앞으로의 계획
              </h2>
            </div>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-[#343536]" />
              <div className="space-y-8">
                {ROADMAP.map((r) => (
                  <div key={r.phase} className="relative flex gap-6 pl-14">
                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      r.status === 'done'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-200 dark:bg-[#343536] text-gray-500 dark:text-gray-400'
                    }`}>
                      {r.status === 'done' ? '✓' : '○'}
                    </div>
                    <div className="flex-1 bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-5">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{r.phase}</div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">{r.title}</h3>
                      <ul className="space-y-1">
                        {r.items.map((item) => (
                          <li key={item} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.status === 'done' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. 기술 스택 */}
        <section className="py-16 bg-white dark:bg-[#1A1A1B]">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">기술 스택</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">안정적인 기술 기반 위에 구축됩니다</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(TECH_STACK).map(([group, techs]) => (
                <div key={group}>
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{group}</div>
                  <div className="flex flex-wrap gap-2">
                    {techs.map((tech) => (
                      <span key={tech} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. 기술 보완점 — 뉴스 API 조회수 없음 */}
        <section className="py-20 bg-white dark:bg-[#1A1A1B]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-4">기술 보완점</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                현재 한계 &amp; 보완 방향
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 뉴스 조회수 */}
              <div className="bg-gray-50 dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📰</span>
                  <h3 className="font-bold text-gray-900 dark:text-white">뉴스 API 조회수 미제공</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  네이버 뉴스 검색 API는 <strong className="text-gray-700 dark:text-gray-300">조회수(클릭수) 데이터를 제공하지 않습니다.</strong>
                  실제 인기도를 직접 수치로 나타낼 수 없는 구조적 한계가 있습니다.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">현재 구현 방식</p>
                  <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <li className="flex gap-2"><span className="text-blue-400 shrink-0">·</span>동일 키워드가 여러 기사에 등장하는 <strong className="text-gray-700 dark:text-gray-300">언급 빈도(frequency)</strong>를 집계해 상대적 인기도를 산출</li>
                    <li className="flex gap-2"><span className="text-blue-400 shrink-0">·</span>30분 주기 APScheduler로 자동 수집 → 최신 키워드 순위 유지</li>
                    <li className="flex gap-2"><span className="text-blue-400 shrink-0">·</span>YouTube 급상승 영상(실제 조회수 제공)과 교차 검증해 트렌드 신뢰도 보완</li>
                  </ul>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  보완 방향: 빅카인즈 API(언론재단) 또는 Google Trends API 연동 시 조회 트렌드 수치 직접 반영 가능
                </p>
              </div>

              {/* 보안·로그인 */}
              <div className="bg-gray-50 dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🔐</span>
                  <h3 className="font-bold text-gray-900 dark:text-white">보안 &amp; 로그인 개선 예정</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  현재 JWT + OAuth2 소셜 로그인 기반이나, 국정원 보안감사 대응 경험을 바탕으로 취약점 점검이 필요합니다.
                </p>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-300 mb-2">보완 예정 항목</p>
                  <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <li className="flex gap-2"><span className="text-orange-400 shrink-0">·</span>XSS·CSRF·세션 만료 취약점 전수 점검 (데이터콕 경험 기반)</li>
                    <li className="flex gap-2"><span className="text-orange-400 shrink-0">·</span>쇼핑 결제 연동 시 PG사 보안 인증 처리</li>
                    <li className="flex gap-2"><span className="text-orange-400 shrink-0">·</span>AWS 이전 시 IAM·Security Group·WAF 적용</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 10. AWS 예상 인프라 비용 */}
        <section className="py-20 bg-gray-50 dark:bg-[#111318]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-4">인프라 비용 예측</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                AWS 전환 시 예상 운영 비용
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">현재 Docker 기반 → AWS 이전 시 월간 예상 비용 (서울 리전 ap-northeast-2 기준)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {/* 최소 구성 */}
              <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-6">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">최소 구성 (MVP)</div>
                <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-1">~$60<span className="text-sm font-bold text-gray-400">/월</span></div>
                <div className="text-xs text-gray-400 mb-4">약 8만원 / 월</div>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li className="flex justify-between"><span>EC2 t3.small (2vCPU/2GB)</span><span className="font-bold">~$17</span></li>
                  <li className="flex justify-between"><span>RDS MySQL db.t3.micro</span><span className="font-bold">~$15</span></li>
                  <li className="flex justify-between"><span>ElastiCache t3.micro</span><span className="font-bold">~$13</span></li>
                  <li className="flex justify-between"><span>S3 + CloudFront (10GB)</span><span className="font-bold">~$5</span></li>
                  <li className="flex justify-between"><span>데이터 전송·기타</span><span className="font-bold">~$10</span></li>
                </ul>
              </div>

              {/* 권장 구성 */}
              <div className="bg-white dark:bg-[#1E2028] rounded-2xl border-2 border-blue-500 p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full">권장</div>
                <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">안정 운영 구성</div>
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">~$150<span className="text-sm font-bold text-gray-400">/월</span></div>
                <div className="text-xs text-gray-400 mb-4">약 20만원 / 월</div>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li className="flex justify-between"><span>EC2 t3.medium × 2 (ALB)</span><span className="font-bold">~$60</span></li>
                  <li className="flex justify-between"><span>RDS MySQL db.t3.small</span><span className="font-bold">~$30</span></li>
                  <li className="flex justify-between"><span>ElastiCache t3.small</span><span className="font-bold">~$25</span></li>
                  <li className="flex justify-between"><span>S3 + CloudFront (50GB)</span><span className="font-bold">~$15</span></li>
                  <li className="flex justify-between"><span>ALB + Route53 + 기타</span><span className="font-bold">~$20</span></li>
                </ul>
              </div>

              {/* 썸네일·미디어 추가 */}
              <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-6">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">미디어 확장 시 추가</div>
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">+$30~80<span className="text-sm font-bold text-gray-400">/월</span></div>
                <div className="text-xs text-gray-400 mb-4">트래픽·용량에 따라 변동</div>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li className="flex justify-between"><span>S3 썸네일 저장 (100GB)</span><span className="font-bold">~$2</span></li>
                  <li className="flex justify-between"><span>CloudFront 전송 (100GB)</span><span className="font-bold">~$8</span></li>
                  <li className="flex justify-between"><span>이미지 리사이징 Lambda</span><span className="font-bold">~$5</span></li>
                  <li className="flex justify-between"><span>동영상 썸네일 처리 (MediaConvert)</span><span className="font-bold">~$20~50</span></li>
                  <li className="flex justify-between"><span>WAF (보안)</span><span className="font-bold">~$10</span></li>
                </ul>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />

      {/* 로그인 모달 — 관리자 패널 체험 클릭 시 */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          // 로그인 성공 후 모달 닫히면 관리자 패널로 이동
          setTimeout(() => {
            if (useAuthStore.getState().isAuthenticated) {
              router.push('/admin');
            }
          }, 100);
        }}
      />
    </>
  );
}
