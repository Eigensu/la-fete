import { MigrationInterface, QueryRunner } from "typeorm";

export class ReplaceCakeMessageWithNewToppers1788851289396 implements MigrationInterface {
    name = 'ReplaceCakeMessageWithNewToppers1788851289396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "cakeMessage"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "messageText"`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "numberTopper" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "numberTopperText" character varying`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "celebrationTopper" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "celebrationTopperType" character varying`);

        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "cakeMessage"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "messageText"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "numberTopper" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "numberTopperText" character varying`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "celebrationTopper" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "celebrationTopperType" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "celebrationTopperType"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "celebrationTopper"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "numberTopperText"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "numberTopper"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "messageText" character varying`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "cakeMessage" boolean NOT NULL DEFAULT false`);

        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "celebrationTopperType"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "celebrationTopper"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "numberTopperText"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "numberTopper"`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "messageText" character varying`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "cakeMessage" boolean NOT NULL DEFAULT false`);
    }

}
