import BakesCategoryPage from '@/components/BakesCategoryPage';

export default function SznSpecialPage() {
  // We don't have a backend filter for szn-special yet, so we could just use a mock query or all
  return (
    <BakesCategoryPage 
      title="SZN Special"
      subtitle="Limited Edition"
      description="Seasonal flavors crafted with fresh ingredients."
      query="category=szn-special" // Wait, I didn't create this category in the DB. I'll just pass a query that might return empty for now, or we can fetch all and filter. BakesCategoryPage fetches using API. I'll just use category=szn-special.
    />
  );
}
