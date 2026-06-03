import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthFields1771008584269 implements MigrationInterface {
  name = 'AddAuthFields1771008584269'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "googleId" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "emailVerified" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "emailVerificationTokenHash" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "passwordResetTokenHash" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "passwordResetExpiresAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "tokenVersion" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "failedLoginAttempts" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "lockedUntil" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lockedUntil"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "failedLoginAttempts"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tokenVersion"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLoginAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetTokenHash"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationTokenHash"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerified"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleId"`);
  }
}
