import Header from '@/widgets/Header/ui/Header';
import Footer from '@/widgets/Footer/ui/Footer';
import Image from 'next/image';

const SKILLS = [
  { group: '영상기획편집', items: ['트렌드 분석', '채팅 반응 분석', '숏폼 기획'] },
  { group: '개발 (데이터 활용)', items: ['Python · FastAPI', 'Next.js · TypeScript', 'Spring Boot · Java', 'Docker · Nginx'] },
  { group: '데이터 분석', items: ['뉴스 트렌드 수집', 'YouTube Data API', '채팅 히트맵 분석', '매출 데이터 분석'] },
  { group: '어학', items: ['TOEIC 890', 'OPIc IH', 'HSK 4급 (208점)', '영국 C1 수료'] },
];

const PROJECTS = [
  {
    name: 'SyukaUniverse (analysisTrend)',
    period: '2025.12 ~ 2026.04',
    tags: ['Next.js', 'FastAPI', 'YouTube API', '네이버 뉴스 API', 'Docker'],
    desc: '슈카친구들 채널을 위해 직접 기획·제작한 통합 운영 플랫폼. 뉴스 키워드·YouTube 급상승 자동 수집, 라이브 채팅 히트맵·피크 구간 분석, 커뮤니티·쇼핑몰·매거진·방송일정 통합 관리.',
    highlight: 'PD 편집 시간 절감 목표 — 채팅 분석으로 하이라이트 구간 자동 추출',
  },
  {
    name: 'ConveniSight (SalesAnalysis)',
    period: '2026.03.15 ~ 2026.03.19',
    tags: ['Next.js', 'FastAPI', 'OCR', '기상청 API', 'Playwright'],
    desc: 'CU 편의점 매출 분석 플랫폼. 날씨·요일·공휴일 등 환경변수가 매출에 미치는 영향 분석, POS 스크린샷 OCR 데이터 추출, 수요 예측·발주 추천·폐기 위험 알림. E2E 테스트 63개 전체 통과.',
    highlight: '데이터 기반 의사결정 시스템 — 직접 운영한 편의점 매출 데이터 활용',
  },
  {
    name: 'ShareAlbum',
    period: '2024.04 ~ 2024.12',
    tags: ['Spring Boot', 'JPA', 'PostgreSQL', 'Redis', 'Next.js', 'Docker'],
    desc: '앨범 공유 풀스택 포트폴리오 프로젝트. Docker 기반 개발 환경 구축, JMeter 성능 테스트로 실무 수준의 기술 역량 심화.',
    highlight: '데이터콕 퇴사 후 자기주도 풀스택 역량 심화',
  },
];

const EXPERIENCE = [
  {
    org: '데이터콕',
    dept: '공공사업부',
    period: '2023년 02월 ~ 2023년 07월',
    role: '웹 서비스 개발·유지보수',
    items: [
      '공공기관 SI 웹 서비스 개발 및 유지보수',
      '국정원 보안감사 대응 — 중앙선거관리위원회 선거법규포털 등 담당',
      'XSS·데이터 평문 전송·불충분한 세션 만료 등 취약점 10건 1개월 내 전건 해결',
    ],
  },
  {
    org: '순천향대학교',
    dept: '빅데이터공학과',
    period: '2020년 08월 ~ 2021년 08월',
    role: '학과 조교',
    items: [
      '빅데이터공학과 수업 실습 보조 및 수강생 학습 질의 응대',
      '수강신청·성적·출결 관리 등 학사 행정 처리',
    ],
  },
];

const EDUCATION = [
  { school: '순천향대학교', major: '영어영문학과 학사', period: '2013년 03월 ~ 2020년 02월', note: '졸업' },
  { school: '쌍용강북교육센터', major: 'JAVA 기반 웹 프로그래밍 (896시간)', period: '2021년 10월 ~ 2022년 04월', note: '수료' },
  { school: 'BSC Edinburgh', major: '영어 어학연수 C1 Level', period: '2018년 03월 ~ 2018년 12월', note: '수료' },
];

const CERTS = [
  { name: 'Cambridge English FCE', score: '합격', date: '2018.12', org: 'Cambridge Assessment' },
  { name: 'HSK 4급', score: '208점', date: '2020.07', org: '중국국가한판' },
  { name: 'TOEIC', score: '890점', date: '2022.05', org: 'ETS' },
  { name: 'OPIc', score: 'IH', date: '2022.09', org: 'ACTFL' },
  { name: 'SQLD', score: '합격', date: '2022.12', org: '한국데이터산업진흥원' },
  { name: '리눅스마스터 2급', score: '합격', date: '2025.03', org: '한국정보통신인력개발센터' },
  { name: '네트워크관리사 2급', score: '합격', date: '2025.07', org: '한국정보통신자격협회' },
];

export default function ResumePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#111318] py-10 px-4">
        <div className="max-w-4xl mx-auto">

          {/* 상단 헤더 — 지원 정보 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl px-8 py-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">지원 회사 · 직무</p>
              <p className="text-white font-black text-xl">슈카친구들 · 땜빵, 만능지원</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs">작성일</p>
              <p className="text-white text-sm font-bold">2026. 04</p>
            </div>
          </div>

          {/* 인적사항 */}
          <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-8 mb-6">
            <div className="flex gap-8 items-start">
              {/* 사진 */}
              <div className="shrink-0">
                <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-[#343536] bg-gray-100">
                  <Image
                    src="/profile.jpg"
                    alt="김재현 증명사진"
                    width={112}
                    height={144}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
              {/* 기본 정보 */}
              <div className="flex-1">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">김재현</h1>
                <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-5">땜빵, 만능지원 · 데이터 기반 콘텐츠 기획</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-14 shrink-0">이메일</span>
                    <span className="text-gray-700 dark:text-gray-300">jaehyoen3@gmail.com</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-14 shrink-0">GitHub</span>
                    <span className="text-gray-700 dark:text-gray-300">github.com/jaehyunhub</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-14 shrink-0">생년월일</span>
                    <span className="text-gray-700 dark:text-gray-300">1994. 01. 06</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-14 shrink-0">학력</span>
                    <span className="text-gray-700 dark:text-gray-300">순천향대 영어영문학과 졸업</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-14 shrink-0">연락처</span>
                    <span className="text-gray-700 dark:text-gray-300">010-4301-0451</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-14 shrink-0">운전</span>
                    <span className="text-gray-700 dark:text-gray-300">1종 보통 (소지)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 자기소개 한 줄 */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl px-8 py-5 mb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              슈카친구들 채널의 팬으로서 채널 성장을 직접 돕고 싶어 <strong className="text-blue-700 dark:text-blue-300">SyukaUniverse 플랫폼을 직접 기획·개발</strong>했습니다.
              데이터 기반 트렌드 분석, 라이브 채팅 히트맵 분석, 편의점 매출 데이터 분석 경험을 바탕으로
              <strong className="text-blue-700 dark:text-blue-300"> 숫자로 콘텐츠를 기획하는 만능 땜빵</strong>이 되겠습니다.
            </p>
          </div>

          {/* 2컬럼 레이아웃 시작 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

            {/* 왼쪽: 스킬 */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-6">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">Skills</h2>
                <div className="space-y-4">
                  {SKILLS.map((s) => (
                    <div key={s.group}>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">{s.group}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.items.map((item) => (
                          <span key={item} className="px-2 py-0.5 bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-[#343536] rounded-full text-xs text-gray-600 dark:text-gray-400">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 자격증 */}
              <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-6">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">자격·어학</h2>
                <div className="space-y-2">
                  {CERTS.map((c) => (
                    <div key={c.name + c.date} className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{c.name}</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400 ml-1.5 font-bold">{c.score}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{c.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 오른쪽: 경력·학력 */}
            <div className="md:col-span-2 space-y-5">

              {/* 경력 */}
              <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-6">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-5">경력</h2>
                <div className="space-y-5">
                  {EXPERIENCE.map((e) => (
                    <div key={e.org} className="relative pl-4 border-l-2 border-blue-500">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{e.org}</span>
                          <span className="text-xs text-gray-400 ml-2">{e.dept}</span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{e.period}</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">{e.role}</p>
                      <ul className="space-y-1">
                        {e.items.map((item) => (
                          <li key={item} className="text-xs text-gray-500 dark:text-gray-400 flex gap-1.5">
                            <span className="text-gray-300 dark:text-gray-600 shrink-0 mt-0.5">·</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* 학력 */}
              <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-6">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">학력·교육</h2>
                <div className="space-y-3">
                  {EDUCATION.map((e) => (
                    <div key={e.school} className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{e.school}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{e.major}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-xs text-gray-400">{e.period}</span>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{e.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* 프로젝트 */}
          <div className="bg-white dark:bg-[#1E2028] rounded-2xl border border-gray-200 dark:border-[#343536] p-8 mb-6">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">주요 프로젝트</h2>
            <div className="space-y-6">
              {PROJECTS.map((p) => (
                <div key={p.name} className="relative pl-4 border-l-2 border-purple-500">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{p.name}</h3>
                    <span className="text-xs text-gray-400 shrink-0 ml-4">{p.period}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {p.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{p.desc}</p>
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400">→ {p.highlight}</p>
                </div>
              ))}
            </div>
          </div>


        </div>
      </main>
      <Footer />
    </>
  );
}
