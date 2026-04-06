import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이력서 | SyukaUniverse',
  description: '김재현 이력서 — 슈카친구들 땜빵, 만능지원',
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
