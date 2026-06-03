import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailVerificationExpiry1771008584270 implements MigrationInterface {
  name = 'AddEmailVerificationExpiry1771008584270'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "emailVerificationExpiresAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationExpiresAt"`);
  }
}
