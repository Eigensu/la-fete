import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAddressFields1781189538881 implements MigrationInterface {
    name = 'UpdateAddressFields1781189538881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ADD "fullName" character varying`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "addressLine1" character varying`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "addressLine2" character varying`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "state" character varying`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        
        // Backfill data from street
        await queryRunner.query(`UPDATE "addresses" SET "fullName" = 'Unknown', "phone" = '0000000000', "addressLine1" = COALESCE("street", 'Unknown'), "state" = 'Unknown'`);
        
        // Set constraints
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "fullName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "addressLine1" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "state" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "updatedAt" SET NOT NULL`);
        
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "street"`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "longitude" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "createdAt" TYPE TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "longitude" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "latitude" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "street" character varying`);
        await queryRunner.query(`UPDATE "addresses" SET "street" = COALESCE("addressLine1", 'Unknown')`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "street" SET NOT NULL`);
        
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "addressLine2"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "addressLine1"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "fullName"`);
    }

}
