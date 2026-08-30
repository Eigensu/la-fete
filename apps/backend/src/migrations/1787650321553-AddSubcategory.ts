import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubcategory1787650321553 implements MigrationInterface {
    name = 'AddSubcategory1787650321553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "subcategory" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "subcategory"`);
    }

}
