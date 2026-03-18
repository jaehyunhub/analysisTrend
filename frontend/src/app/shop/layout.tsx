import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '쇼핑 | AnalysisTrend',
  description: '트렌드 굿즈 쇼핑몰',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
