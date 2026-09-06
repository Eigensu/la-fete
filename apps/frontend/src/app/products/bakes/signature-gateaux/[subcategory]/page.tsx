import BakesCategoryPage from '@/components/BakesCategoryPage';

function slugToTitle(slug: string) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default async function SubcategoryPage({ params }: { params: Promise<{ subcategory: string }> }) {
  const resolvedParams = await params;
  const subcategory = resolvedParams.subcategory;
  const title = slugToTitle(subcategory);

  // The API matches collections case-insensitively, so send the slug's words
  // ("liquor-infused" -> "liquor infused") rather than the display title.
  const collection = subcategory.replace(/-/g, ' ');

  return (
    <BakesCategoryPage
      title={title}
      subtitle="Signature Gateaux"
      description={`Explore our selection of ${title} signature gateaux.`}
      query={`category=signature-gateaux&subcategory=${encodeURIComponent(collection)}`}
      backHref="/products/bakes/signature-gateaux"
      backLabel="Back to Signature Gateaux"
    />
  );
}
