import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSessions1771008584271 implements MigrationInterface {
  name = 'CreateUserSessions1771008584271'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "refreshTokenHash" character varying, "ip" character varying, "userAgent" character varying, "expiresAt" TIMESTAMP, "revokedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_user_sessions_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_user_sessions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_user_sessions_user"`);
    await queryRunner.query(`DROP TABLE "user_sessions"`);
  }
}
