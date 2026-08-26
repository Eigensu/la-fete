import BakesCategoryPage from '@/components/BakesCategoryPage';

function slugToTitle(slug: string) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default async function SubcategoryPage({ params }: { params: Promise<{ subcategory: string }> }) {
  const resolvedParams = await params;
  const subcategory = resolvedParams.subcategory;
  const title = slugToTitle(subcategory);

  return (
    <BakesCategoryPage 
      title={title}
      subtitle="Signature Gateaux"
      description={`Explore our selection of ${title} signature gateaux.`}
      query={`category=signature-gateaux&subcategory=${encodeURIComponent(title)}`}
    />
  );
}
