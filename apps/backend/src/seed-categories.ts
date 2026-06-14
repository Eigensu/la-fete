import { AppDataSource } from './data-source';
import { Product } from './modules/products/entities/product.entity';
import { ProductVariant } from './modules/products/entities/product-variant.entity';
import { Category } from './modules/categories/entities/category.entity';

const productsToSeed = [
    { name: 'Classic Red Velvet', description: 'Our signature recipe with cream cheese frosting', category: 'les-gateaux', tag: 'Bestseller', price: 520 },
    { name: 'Spring Blossom Cupcake', description: 'Light floral notes with a creamy center', category: 'les-gateaux', price: 180 },
    { name: 'Ultimate Chocolate Dream', description: 'Triple layers of cocoa for the serious lover', category: 'les-gateaux', price: 650 },
    
    { name: 'Mango Passion Delight', description: 'Tropical summer flavors in every bite', category: 'petit-indulgences', tag: 'Seasonal', price: 420 },
    { name: 'Midnight Brownie', description: 'Intense dark chocolate with a gooey molten center', category: 'petit-indulgences', price: 250 },
    
    { name: 'Gluten-Free Vanilla', description: 'Light and airy vanilla cake made without gluten', category: 'by-diet', price: 450 },
    { name: 'Vegan Chocolate Fudge', description: 'Rich chocolate cake completely plant-based', category: 'by-diet', price: 550 },
    
    { name: 'Oatmeal Raisin Energy', description: 'Perfect bite-sized snack for on the go', category: 'granola', price: 120 },
    { name: 'Keto Berry Tart', description: 'Low-carb tart packed with fresh seasonal berries', category: 'granola', price: 380 },
    
    { name: 'Peanut Butter Blast', description: 'Crunchy peanut butter with chocolate drizzle', category: 'spreads', tag: 'Bestseller', price: 350 },
    { name: 'Salted Caramel Crunch', description: 'Perfect balance of sweet and salty', category: 'spreads', price: 480 },
    
    { name: 'Sugar-Free Delight', description: 'Naturally sweetened treats for the healthy heart', category: 'cake-mixes', price: 320 },
    { name: 'Pumpkin Spice Mini', description: 'Warm autumn spices for cozy evenings', category: 'cake-mixes', price: 290 },
];

const categoryNames: Record<string, string> = {
    'les-gateaux': 'Les Gâteaux',
    'petit-indulgences': 'Petit Indulgences',
    'by-diet': 'By Diet',
    'granola': 'Granola',
    'spreads': 'Spreads',
    'cake-mixes': 'Cake Mixes'
};

async function seed() {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);
    const variantRepo = AppDataSource.getRepository(ProductVariant);

    // Create sub-categories
    const categoryMap: Record<string, Category> = {};

    for (const catSlug of Object.keys(categoryNames)) {
        let cat = await categoryRepo.findOne({ where: { slug: catSlug } });
        if (!cat) {
            cat = categoryRepo.create({
                name: categoryNames[catSlug],
                slug: catSlug,
                description: `${categoryNames[catSlug]} category`,
            });
            await categoryRepo.save(cat);
        }
        categoryMap[catSlug] = cat;
    }

    // Update existing products with correct categories
    for (const p of productsToSeed) {
        let product = await productRepo.findOne({ where: { name: p.name } });
        if (product) {
            product.category = categoryMap[p.category];
            await productRepo.save(product);
            console.log(`Updated category for: ${p.name}`);
        } else {
            console.log(`Missing product: ${p.name}`);
        }
    }

    await AppDataSource.destroy();
    console.log('Category realignment complete.');
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
