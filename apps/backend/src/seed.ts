import { AppDataSource } from './data-source';
import { Product } from './modules/products/entities/product.entity';
import { ProductVariant } from './modules/products/entities/product-variant.entity';
import { Category } from './modules/categories/entities/category.entity';

const productsToSeed = [
    { name: 'Classic Red Velvet', description: 'Our signature recipe with cream cheese frosting', category: 'lafete', tag: 'Bestseller', price: 520 },
    { name: 'Spring Blossom Cupcake', description: 'Light floral notes with a creamy center', category: 'lafete', price: 180 },
    { name: 'Ultimate Chocolate Dream', description: 'Triple layers of cocoa for the serious lover', category: 'lafete', price: 650 },
    { name: 'Mango Passion Delight', description: 'Tropical summer flavors in every bite', category: 'lafete', tag: 'Seasonal', price: 420 },
    { name: 'Midnight Brownie', description: 'Intense dark chocolate with a gooey molten center', category: 'lafete', price: 250 },
    { name: 'Gluten-Free Vanilla', description: 'Light and airy vanilla cake made without gluten', category: 'lafete', price: 450 },
    { name: 'Vegan Chocolate Fudge', description: 'Rich chocolate cake completely plant-based', category: 'lafete', price: 550 },
    { name: 'Oatmeal Raisin Energy', description: 'Perfect bite-sized snack for on the go', category: 'snackfest', price: 120 },
    { name: 'Keto Berry Tart', description: 'Low-carb tart packed with fresh seasonal berries', category: 'snackfest', price: 380 },
    { name: 'Peanut Butter Blast', description: 'Crunchy peanut butter with chocolate drizzle', category: 'snackfest', tag: 'Bestseller', price: 350 },
    { name: 'Salted Caramel Crunch', description: 'Perfect balance of sweet and salty', category: 'snackfest', price: 480 },
    { name: 'Sugar-Free Delight', description: 'Naturally sweetened treats for the healthy heart', category: 'snackfest', price: 320 },
    { name: 'Pumpkin Spice Mini', description: 'Warm autumn spices for cozy evenings', category: 'snackfest', price: 290 },
];

async function seed() {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);
    const variantRepo = AppDataSource.getRepository(ProductVariant);

    // Create categories
    const categories = ['lafete', 'snackfest'];
    const categoryMap: Record<string, Category> = {};

    for (const catSlug of categories) {
        let cat = await categoryRepo.findOne({ where: { slug: catSlug } });
        if (!cat) {
            cat = categoryRepo.create({
                name: catSlug === 'lafete' ? 'La Fête' : 'Snackfest',
                slug: catSlug,
                description: `${catSlug} category`,
            });
            await categoryRepo.save(cat);
        }
        categoryMap[catSlug] = cat;
    }

    // Create products
    for (const p of productsToSeed) {
        let product = await productRepo.findOne({ where: { name: p.name } });
        if (!product) {
            product = productRepo.create({
                name: p.name,
                description: p.description,
                category: categoryMap[p.category],
                images: [],
                isAvailable: true,
                isFeatured: !!p.tag,
                tag: p.tag,
                slug: p.name.toLowerCase().replace(/\s+/g, '-'),
            });
            await productRepo.save(product);

            const variant = variantRepo.create({
                name: 'Default',
                sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                price: p.price,
                stockQuantity: 100,
                product: product,
            });
            await variantRepo.save(variant);
            console.log(`Seeded: ${p.name}`);
        } else {
            console.log(`Already exists: ${p.name}`);
        }
    }

    await AppDataSource.destroy();
    console.log('Seeding complete.');
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
