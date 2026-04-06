import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '매거진 | SyukaUniverse',
  description: '트렌드 분석 매거진',
};

export default function MagazineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
