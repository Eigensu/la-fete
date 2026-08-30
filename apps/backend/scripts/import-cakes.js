"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../src/data-source");
const product_entity_1 = require("../src/modules/products/entities/product.entity");
const product_variant_entity_1 = require("../src/modules/products/entities/product-variant.entity");
const category_entity_1 = require("../src/modules/categories/entities/category.entity");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sync_1 = require("csv-parse/sync");
async function importCakes() {
    await data_source_1.AppDataSource.initialize();
    console.log('Database connected.');
    const productRepo = data_source_1.AppDataSource.getRepository(product_entity_1.Product);
    const variantRepo = data_source_1.AppDataSource.getRepository(product_variant_entity_1.ProductVariant);
    const categoryRepo = data_source_1.AppDataSource.getRepository(category_entity_1.Category);
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
    const records = (0, sync_1.parse)(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });
    let importedCount = 0;
    for (const rowObj of records) {
        const row = rowObj;
        const format = row['Format']?.trim();
        if (!format)
            continue;
        const name = row['Product Name']?.trim();
        const collectionNames = row['Collection']?.split(',').map((c) => c.trim()) || [];
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
        }
        else if (dietaryTag?.toLowerCase().includes('vegan') || dietaryTag?.toLowerCase().includes('gluten free')) {
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
        });
        const savedProduct = await productRepo.save(newProduct);
        if (!isNaN(price500g)) {
            await variantRepo.save(variantRepo.create({
                product: savedProduct,
                name: '500g',
                price: price500g,
                weight: 0.5,
                stockQuantity: 100,
                sku: `${slug}-500g`,
            }));
        }
        if (!isNaN(price1kg)) {
            await variantRepo.save(variantRepo.create({
                product: savedProduct,
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
    await data_source_1.AppDataSource.destroy();
}
importCakes().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=import-cakes.js.map