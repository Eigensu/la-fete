import { AppDataSource } from '../src/data-source';
import { Product } from '../src/modules/products/entities/product.entity';
import { Category } from '../src/modules/categories/entities/category.entity';
// Note: In older imports we can just do ts-node

async function migrate() {
  await AppDataSource.initialize();
  console.log('Database connected.');

  const productRepo = AppDataSource.getRepository(Product);
  const categoryRepo = AppDataSource.getRepository(Category);

  // Mapping based on products-data.ts and the flowchart
  const mappings = [
    { slug: '465-dutch-truffle-cake', nameMatch: '46.5% dutch', subcat: 'Dark Chocolate', cat: 'signature-gateaux' },
    { slug: '545-belgium-dark-chocolate-cake', nameMatch: '54.5% belgium', subcat: 'Dark Chocolate', cat: 'signature-gateaux' },
    { slug: 'sugar-free-dark-chocolate-cake', nameMatch: 'sugar-free dark chocolate', subcat: 'Dark Chocolate', cat: 'signature-gateaux' },
    { slug: 'espresso-dark-chocolate-mousse-cake', nameMatch: 'espresso', subcat: 'Coffee', cat: 'signature-gateaux' },
    { slug: 'almond-praline-dark-chocolate', nameMatch: 'almond praline', subcat: 'Praline', cat: 'signature-gateaux' },
    { slug: 'sea-salt-caramel-hazelnut-praline-dark-chocolate', nameMatch: 'sea salt caramel hazelnut', subcat: 'Praline', cat: 'signature-gateaux' },
    { slug: 'dark-chocolate-peanut-butter-salted-caramel-cake', nameMatch: 'peanut butter', subcat: 'Dark Chocolate', cat: 'signature-gateaux' },
    { slug: 'dark-chocolate-pistachio-cake', nameMatch: 'dark chocolate pistachio', subcat: 'Pistachio', cat: 'signature-gateaux' },
    { slug: 'raspberry-pistachio-vanilla-cake', nameMatch: 'raspberry pistachio', subcat: 'Pistachio', cat: 'signature-gateaux' },
    { slug: 'rose-pistachio-vanilla-cake', nameMatch: 'rose pistachio', subcat: 'Pistachio', cat: 'signature-gateaux' },
    { slug: 'citrus-lemon-vanilla', nameMatch: 'citrus lemon', subcat: 'Citrus', cat: 'signature-gateaux' },
    { slug: 'zesty-orange-dark-chocolate', nameMatch: 'zesty orange', subcat: 'Citrus', cat: 'signature-gateaux' },
    { slug: 'vegan-dark-chocolate-cake', nameMatch: 'vegan dark chocolate', subcat: 'Dark Chocolate', cat: 'signature-gateaux' },
    { slug: 'vegan-mocha-cake', nameMatch: 'vegan mocha', subcat: 'Coffee', cat: 'signature-gateaux' },
    { slug: 'sea-salt-hazelnut-praline-vegan-dark-chocolate', nameMatch: 'sea salt hazelnut praline vegan', subcat: 'Praline', cat: 'signature-gateaux' },
    { slug: '70-dark-chocolate-vegan-orange-cake', nameMatch: '70% dark chocolate vegan orange', subcat: 'Citrus', cat: 'signature-gateaux' },
    { slug: 'raspberry-pistachio-vegan-vanilla', nameMatch: 'raspberry pistachio vegan', subcat: 'Pistachio', cat: 'signature-gateaux' },
    { slug: 'classic-gooey-dark-chocolate-cake', nameMatch: 'classic gooey', subcat: 'Dark Chocolate', cat: 'signature-gateaux' },
    { slug: 'hazelnut-dark-chocolate-cake', nameMatch: 'hazelnut dark', subcat: 'Dark Chocolate', cat: 'signature-gateaux' },
    { slug: 'almond-dark-chocolate-cake', nameMatch: 'almond dark', subcat: 'Dark Chocolate', cat: 'signature-gateaux' },
    { slug: 'baileys-coffee-crave', nameMatch: 'bailey\'s', subcat: 'Liquor Infused', cat: 'signature-gateaux' },
    { slug: 'whiskey-dutch-truffle', nameMatch: 'whiskey dutch', subcat: 'Liquor Infused', cat: 'signature-gateaux' },
    { slug: 'boozy-berry-cake', nameMatch: 'boozy berry', subcat: 'Liquor Infused', cat: 'signature-gateaux' },
    
    // Tea cakes
    { slug: 'date-and-walnut', nameMatch: 'date & walnut', subcat: '', cat: 'tea-cakes' },
    { slug: 'caramelized-orange-vanilla-cake', nameMatch: 'caramelised valencia', subcat: '', cat: 'tea-cakes' },
    { slug: 'carrot-cake', nameMatch: 'carrot', subcat: '', cat: 'tea-cakes' },
    { slug: 'banana-bread', nameMatch: 'banana bread', subcat: '', cat: 'tea-cakes' },
    { slug: 'almond-cake', nameMatch: 'flourless protein', subcat: '', cat: 'tea-cakes' },

    // Tub cakes
    { slug: 'saffron-vanilla-milk-cake', nameMatch: 'saffron vanilla', subcat: '', cat: 'tub-cakes' },
    { slug: 'tres-leches', nameMatch: 'tres leches', subcat: '', cat: 'tub-cakes' },
    { slug: 'filter-coffee-tiramisu-cake', nameMatch: 'filter coffee', subcat: '', cat: 'tub-cakes' },
    { slug: 'lotus-biscoff-cream-cheese', nameMatch: 'lotus biscoff', subcat: '', cat: 'tub-cakes' },
  ];

  // Make sure categories exist
  for (const catSlug of ['bakes', 'signature-gateaux', 'tea-cakes', 'tub-cakes']) {
    let cat = await categoryRepo.findOne({ where: { slug: catSlug } });
    if (!cat) {
      cat = categoryRepo.create({
        name: catSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: catSlug,
        isActive: true,
      });
      await categoryRepo.save(cat);
    }
  }

  const allProducts = await productRepo.find();
  for (const prod of allProducts) {
    const match = mappings.find(m => prod.name.toLowerCase().includes(m.nameMatch.toLowerCase()));
    
    if (match) {
      const cat = await categoryRepo.findOne({ where: { slug: match.cat } });
      if (cat) {
        prod.category = cat;
        prod.subcategory = match.subcat || "";
        await productRepo.save(prod);
        console.log(`Updated ${prod.name} -> ${match.cat} / ${match.subcat}`);
      }
    } else {
        // Just leave as is or default to Bakes? 
        // We will leave it as is if it's not a cake.
    }
  }

  console.log('Done mapping.');
  await AppDataSource.destroy();
}

migrate().catch(console.error);
