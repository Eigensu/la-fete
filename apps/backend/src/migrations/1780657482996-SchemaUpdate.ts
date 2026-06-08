import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1780657482996 implements MigrationInterface {
    name = 'SchemaUpdate1780657482996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "imageUrl" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_categories_name" UNIQUE ("name"), CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"), CONSTRAINT "PK_categories" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" ADD "slug" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "UQ_products_slug" UNIQUE ("slug")`);
        await queryRunner.query(`ALTER TABLE "products" ADD "isFeatured" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "products" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "products" ADD "categoryId" uuid`);
        await queryRunner.query(`ALTER TABLE "products" ADD "createdById" uuid`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "discountPrice" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "weight" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "carts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "productId" uuid`);
        await queryRunner.query(`ALTER TABLE "cart_items" RENAME COLUMN "priceAtAdd" TO "unitPrice"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_createdById" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        await queryRunner.query(`CREATE INDEX "products_slug" ON "products" ("slug")`);
        await queryRunner.query(`CREATE INDEX "products_category_id" ON "products" ("categoryId")`);
        await queryRunner.query(`CREATE INDEX "products_is_available" ON "products" ("isAvailable")`);
        await queryRunner.query(`CREATE INDEX "products_is_featured" ON "products" ("isFeatured")`);
        await queryRunner.query(`CREATE INDEX "product_variants_product_id" ON "product_variants" ("productId")`);
        await queryRunner.query(`CREATE INDEX "product_variants_sku" ON "product_variants" ("sku")`);
        await queryRunner.query(`CREATE INDEX "carts_user_id" ON "carts" ("userId")`);
        await queryRunner.query(`CREATE INDEX "cart_items_cart_id" ON "cart_items" ("cartId")`);
        await queryRunner.query(`CREATE INDEX "cart_items_product_id" ON "cart_items" ("productId")`);
        await queryRunner.query(`CREATE INDEX "cart_items_variant_id" ON "cart_items" ("variantId")`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "UQ_product_variants_product_id_name" UNIQUE ("productId", "name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "UQ_product_variants_product_id_name"`);
        await queryRunner.query(`DROP INDEX "cart_items_variant_id"`);
        await queryRunner.query(`DROP INDEX "cart_items_product_id"`);
        await queryRunner.query(`DROP INDEX "cart_items_cart_id"`);
        await queryRunner.query(`DROP INDEX "carts_user_id"`);
        await queryRunner.query(`DROP INDEX "product_variants_sku"`);
        await queryRunner.query(`DROP INDEX "product_variants_product_id"`);
        await queryRunner.query(`DROP INDEX "products_is_featured"`);
        await queryRunner.query(`DROP INDEX "products_is_available"`);
        await queryRunner.query(`DROP INDEX "products_category_id"`);
        await queryRunner.query(`DROP INDEX "products_slug"`);
        
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_productId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_createdById"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_categoryId"`);
        
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "cart_items" RENAME COLUMN "unitPrice" TO "priceAtAdd"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "productId"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "discountPrice"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "isFeatured"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "UQ_products_slug"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "slug"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }
}
