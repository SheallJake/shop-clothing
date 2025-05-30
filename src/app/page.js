import BannerSlider from '@/components/BannerSlider';
import CategoryGrid from '@/components/СategoryGrid';

export default function HomePage() {
  return (
    <>
      <BannerSlider className="mx-0"/>
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Категорії</h2>
        <CategoryGrid />
      </div>
    </>
  );
}
