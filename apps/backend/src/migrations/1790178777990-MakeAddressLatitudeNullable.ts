import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Address coordinates are optional (entity + CreateAddressDto), but only
 * longitude was ever relaxed — UpdateAddressFields left latitude NOT NULL, so
 * saving an address without coordinates failed on a migrated database.
 *
 * DROP NOT NULL is a no-op on a column that is already nullable, so this is
 * safe on databases whose schema was fixed by hand.
 */
export class MakeAddressLatitudeNullable1790178777990 implements MigrationInterface {
  name = 'MakeAddressLatitudeNullable1790178777990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "latitude" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "latitude" SET NOT NULL`
    );
  }
}
