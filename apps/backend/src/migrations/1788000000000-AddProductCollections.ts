import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductCollections1788000000000 implements MigrationInterface {
    name = 'AddProductCollections1788000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "collections" text array NOT NULL DEFAULT '{}'`);

        // Seed from the single-valued subcategory so nothing disappears from the
        // gateaux pages between this migration and the sheet import.
        await queryRunner.query(`
            UPDATE "products"
            SET "collections" = ARRAY[lower("subcategory")]
            WHERE "subcategory" IS NOT NULL AND "subcategory" <> ''
        `);

        // Collections are always filtered by a single value (":c = ANY(collections)"),
        // which GIN serves directly.
        await queryRunner.query(`CREATE INDEX "products_collections" ON "products" USING GIN ("collections")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "products_collections"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "collections"`);
    }

}
