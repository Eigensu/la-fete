import { AppDataSource } from '../src/data-source';
import { Product } from '../src/modules/products/entities/product.entity';
import { ProductVariant } from '../src/modules/products/entities/product-variant.entity';
import { Category } from '../src/modules/categories/entities/category.entity';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

async function importCakes() {
  await AppDataSource.initialize();
  console.log('Database connected.');

  const productRepo = AppDataSource.getRepository(Product);
  const variantRepo = AppDataSource.getRepository(ProductVariant);
  const categoryRepo = AppDataSource.getRepository(Category);

  const oldCakeProducts = await productRepo.find({
    relations: ['category', 'variants'],
  });

  let deletedCount = 0;
  for (const product of oldCakeProducts) {
    if (product.category && !['granola', 'spreads'].includes(product.category.slug)) {
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          await variantRepo.softDelete(variant.id);
        }
      }
      await productRepo.softDelete(product.id);
      deletedCount++;
    }
  }
  console.log(`Deleted ${deletedCount} old cake products.`);

  const csvPath = path.resolve(__dirname, '../../../costing - LF_cakes.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  let importedCount = 0;

  for (const rowObj of records) {
    const row = rowObj as any;
    const format = row['Format']?.trim();
    if (!format) continue;

    const name = row['Product Name']?.trim();
    const collectionNames = row['Collection']?.split(',').map((c: string) => c.trim()) || [];
    const dietaryTag = row['Deitary Tag']?.trim();
    const otherTags = row['Other Tags']?.trim();
    const ingredients = row['Ingredients']?.trim();
    const description = row['description']?.trim();
    const price500g = parseFloat(row['Price 500g']);
    const price1kg = parseFloat(row['price 1kg']);
    const sweetener1 = row['sweetner base 1']?.trim();
    const sweetener2 = row['sweetner base 2']?.trim();
    const sweetener3 = row['sweetner 3']?.trim();
    const shelfLife = row['shelf life & serving instructions (same for all)']?.trim();
    const allergyInfo = row['allergy information']?.trim();
    const deliveryInstructions = row['delivery & shipping instructions']?.trim();

    let primaryCategorySlug = 'les-gateaux';
    if (format.toLowerCase().includes('tea cake') || format.toLowerCase().includes('tub cake')) {
      primaryCategorySlug = 'petit-indulgences';
    } else if (dietaryTag?.toLowerCase().includes('vegan') || dietaryTag?.toLowerCase().includes('gluten free')) {
      primaryCategorySlug = 'by-diet';
    }

    let category = await categoryRepo.findOne({ where: { slug: primaryCategorySlug } });
    if (!category) {
      category = categoryRepo.create({ name: primaryCategorySlug, slug: primaryCategorySlug });
      await categoryRepo.save(category);
    }

    const sweeteners = [sweetener1, sweetener2, sweetener3].filter(s => s && s !== '-');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProduct = productRepo.create({
      name,
      slug,
      description: description || name,
      format,
      dietaryTags: dietaryTag,
      otherTags: otherTags,
      ingredients,
      sweetenerOptions: sweeteners,
      shelfLife,
      allergyInformation: allergyInfo,
      deliveryInstructions: deliveryInstructions,
      category,
      images: [],
      isAvailable: true,
      isFeatured: otherTags?.toLowerCase().includes('bestseller'),
    } as any);

    const savedProduct = await productRepo.save(newProduct);

    if (!isNaN(price500g)) {
      await variantRepo.save(variantRepo.create({
        product: savedProduct as any,
        name: '500g',
        price: price500g,
        weight: 0.5,
        stockQuantity: 100,
        sku: `${slug}-500g`,
      }));
    }
    
    if (!isNaN(price1kg)) {
      await variantRepo.save(variantRepo.create({
        product: savedProduct as any,
        name: '1kg',
        price: price1kg,
        weight: 1.0,
        stockQuantity: 100,
        sku: `${slug}-1kg`,
      }));
    }

    importedCount++;
    console.log(`Imported: ${name}`);
  }

  console.log(`Successfully imported ${importedCount} cakes.`);
  await AppDataSource.destroy();
}

importCakes().catch(err => {
  console.error(err);
  process.exit(1);
});
