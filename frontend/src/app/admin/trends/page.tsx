import dynamic from 'next/dynamic';

const TrendsContent = dynamic(() => import('./_content'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" aria-label="트렌드 분석 페이지 로딩 중" />
    </div>
  ),
});

export default function AdminTrendsPage() {
  return <TrendsContent />;
}
