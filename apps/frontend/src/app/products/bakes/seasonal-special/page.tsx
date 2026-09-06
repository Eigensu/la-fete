import BakesCategoryPage from '@/components/BakesCategoryPage';

export default function SeasonalSpecialPage() {
  // No product carries a seasonal tag yet, and the API has no filter for one, so
  // this deliberately matches nothing and shows the "nothing yet" state until a
  // seasonal range exists. Swap in a real filter when the range launches.
  return (
    <BakesCategoryPage
      title="Seasonal Special"
      subtitle="Limited Edition"
      description="Seasonal flavours crafted with fresh ingredients."
      query="category=seasonal-special"
    />
  );
}
