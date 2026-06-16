import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAddressFields1781189538881 implements MigrationInterface {
    name = 'UpdateAddressFields1781189538881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "street"`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "fullName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "phone" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "addressLine1" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "addressLine2" character varying`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "state" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "latitude" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "longitude" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "createdAt" TYPE TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "longitude" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "latitude" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "addressLine2"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "addressLine1"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "fullName"`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "street" character varying NOT NULL`);
    }

}
