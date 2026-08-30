import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNutritionalHighlight1784906788197 implements MigrationInterface {
    name = 'AddNutritionalHighlight1784906788197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "nutritionalHighlight" text`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "sweetener" character varying`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "cakeTopper" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "topperText" character varying`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "cakeMessage" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "messageText" character varying`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "sweetener" character varying`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "cakeTopper" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "topperText" character varying`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "cakeMessage" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "messageText" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "messageText"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "cakeMessage"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "topperText"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "cakeTopper"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "sweetener"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "messageText"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "cakeMessage"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "topperText"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "cakeTopper"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "sweetener"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "nutritionalHighlight"`);
    }

}
