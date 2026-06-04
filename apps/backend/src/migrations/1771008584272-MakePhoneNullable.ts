import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePhoneNullable1771008584272 implements MigrationInterface {
  name = 'MakePhoneNullable1771008584272'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "users" SET "phone" = '' WHERE "phone" IS NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`);
  }
}
