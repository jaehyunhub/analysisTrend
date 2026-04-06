import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '소개 | SyukaUniverse',
  description: '슈카월드 운영팀을 위한 통합 콘텐츠 인텔리전스 플랫폼 — 자료조사 시간을 줄이고 콘텐츠 제작에 집중하세요.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
