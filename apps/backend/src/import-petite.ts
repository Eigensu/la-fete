import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { AppDataSource } from './data-source';
import { Product } from './modules/products/entities/product.entity';
import { ProductVariant } from './modules/products/entities/product-variant.entity';
import { Category } from './modules/categories/entities/category.entity';

async function importPetite() {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);
    const variantRepo = AppDataSource.getRepository(ProductVariant);

    // Create or find Petite Indulgences category
    let category = await categoryRepo.findOne({ where: { slug: 'petite-indulgences' } });
    if (!category) {
        category = categoryRepo.create({
            name: 'Petite Indulgences',
            slug: 'petite-indulgences',
            description: 'Tea Cakes and Tub Cakes',
        });
        await categoryRepo.save(category);
    }

    const csvPath = '/Users/jaimeenbhagat/Desktop/Jaimeen Bhagat/Eigensu/La - fete/la-fete/costing - LF_petite indulgences.csv';
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records: any[] = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    let count = 0;

    for (const record of records) {
        if (!record['Product Name'] || !record['Format']) continue;

        const name = record['Product Name'];
        const format = record['Format'];
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        let product = await productRepo.findOne({ where: { slug } });
        
        if (!product) {
            product = productRepo.create({
                name,
                slug,
                description: record['description'] || '',
                format: format,
                tag: record['Other Tags'] || '',
                dietaryTags: record['Deitary Tag'] || '', // typo in CSV
                otherTags: record['Other Tags'] || '',
                ingredients: '', // No ingredients column in this CSV
                nutritionalHighlight: record['nutritional highlight'] || '',
                shelfLife: record['shelf life & serving instructions'] || '',
                allergyInformation: record['allergy information'] || '',
                deliveryInstructions: record['delivery & shipping instructions'] || '',
                images: [],
                isAvailable: true,
                isFeatured: record['Other Tags']?.toLowerCase().includes('bestseller') || false,
                category: category,
            });
            await productRepo.save(product);
            console.log(`Saved product: ${name}`);
            count++;
        }

        // Handle variants for 300g, 500g, 1kg
        const weights = [
            { label: '300g', value: 300, priceCol: 'price 300g' },
            { label: '500g', value: 500, priceCol: 'Price 500g' },
            { label: '1kg', value: 1000, priceCol: 'price 1kg' }
        ];

        for (const w of weights) {
            const priceStr = record[w.priceCol];
            if (priceStr && priceStr !== '-') {
                const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) {
                    let variant = await variantRepo.findOne({ where: { product: { id: product.id }, name: w.label } });
                    if (!variant) {
                        variant = variantRepo.create({
                            name: w.label,
                            sku: `SKU-${slug.substring(0,4).toUpperCase()}-${w.value}`,
                            price,
                            weight: w.value,
                            stockQuantity: 100,
                            isAvailable: true,
                            product: product,
                        });
                        await variantRepo.save(variant);
                        console.log(`Saved variant: ${w.label} for ${name}`);
                    }
                }
            }
        }
    }

    console.log(`Successfully imported ${count} new products!`);
    await AppDataSource.destroy();
}

importPetite().catch(err => {
    console.error(err);
    process.exit(1);
});
