import { notFound } from 'next/navigation';
import { MOCK_MAGAZINES } from '@/shared/mocks/magazines';
import Header from '@/widgets/Header/ui/Header';
import Footer from '@/widgets/Footer/ui/Footer';
import MagazineDetailContent from './_content';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return MOCK_MAGAZINES.map((m) => ({ id: String(m.id) }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const magazine = MOCK_MAGAZINES.find((m) => m.id === Number(id));
  if (!magazine) return { title: '매거진 | SyukaUniverse' };
  return {
    title: `${magazine.title} | SyukaUniverse`,
    description: magazine.summary,
  };
}

export default async function MagazineDetailPage({ params }: Props) {
  const { id } = await params;
  const fallback = MOCK_MAGAZINES.find((m) => m.id === Number(id));

  if (!fallback) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-[#1A1A1B]">
        <MagazineDetailContent id={Number(id)} fallback={fallback} />
      </main>
      <Footer />
    </>
  );
}
