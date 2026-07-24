import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCakeFields1784882444280 implements MigrationInterface {
    name = 'AddCakeFields1784882444280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "sweetener"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "cakeMessage"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "cakeTopper"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "sweetener"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "cakeMessage"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "cakeTopper"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "format" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "products" ADD "dietaryTags" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD "otherTags" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD "ingredients" text`);
        await queryRunner.query(`ALTER TABLE "products" ADD "sweetenerOptions" text`);
        await queryRunner.query(`ALTER TABLE "products" ADD "shelfLife" text`);
        await queryRunner.query(`ALTER TABLE "products" ADD "allergyInformation" text`);
        await queryRunner.query(`ALTER TABLE "products" ADD "deliveryInstructions" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deliveryInstructions"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "allergyInformation"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "shelfLife"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sweetenerOptions"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "ingredients"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "otherTags"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "dietaryTags"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "format"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "cakeTopper" text`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "cakeMessage" text`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "sweetener" character varying`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "cakeTopper" text`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "cakeMessage" text`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "sweetener" character varying`);
    }

}
