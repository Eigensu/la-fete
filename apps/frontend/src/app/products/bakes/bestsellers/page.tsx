import BakesCategoryPage from '@/components/BakesCategoryPage';

export default function BestsellersPage() {
  return (
    <BakesCategoryPage 
      title="Bestsellers"
      subtitle="Fan Favorites"
      description="Our most loved cakes, pastries, and treats. Tried, tested, and constantly craved."
      query="featured=true"
    />
  );
}
