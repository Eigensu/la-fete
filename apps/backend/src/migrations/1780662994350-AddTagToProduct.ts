import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTagToProduct1780662994350 implements MigrationInterface {
    name = 'AddTagToProduct1780662994350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_user_sessions_user"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_categoryId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_createdById"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_productId"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "UQ_product_variants_product_id_name"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "tag" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationExpiresAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetExpiresAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLoginAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastLoginAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lockedUntil"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lockedUntil" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD "expiresAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "revokedAt"`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD "revokedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "UQ_1edbb278083e7043c0d178bbcb5" UNIQUE ("productId", "name")`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_55fa4db8406ed66bc7044328427" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_de1043dff8f68e83a20480b00f7" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_de1043dff8f68e83a20480b00f7"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_55fa4db8406ed66bc7044328427"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "UQ_1edbb278083e7043c0d178bbcb5"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "slug" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "revokedAt"`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD "revokedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD "expiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lockedUntil"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lockedUntil" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLoginAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastLoginAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetExpiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationExpiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "tag"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "category" character varying`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "UQ_product_variants_product_id_name" UNIQUE ("name", "productId")`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_createdById" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_user_sessions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
