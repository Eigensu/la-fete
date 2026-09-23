/* eslint-disable no-console */
/**
 * Fails when the database at DATABASE_URL doesn't match the entities:
 * either a migration hasn't been run, or the migrated schema differs from
 * what the entities declare (an entity changed without a migration, or a
 * migration that doesn't do what the entity expects).
 *
 * Run after `migration:run` on an empty database — CI does exactly that.
 */
import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/data-source';

async function main() {
  const ds = await new DataSource({
    ...AppDataSource.options,
    logging: false,
  }).initialize();
  try {
    if (await ds.showMigrations()) {
      console.error('Pending migrations: run `pnpm migration:run` first.');
      process.exit(1);
    }

    const { upQueries } = await ds.driver.createSchemaBuilder().log();
    if (upQueries.length > 0) {
      console.error(
        'Schema drift: the migrated database does not match the entities.'
      );
      console.error(
        'Generate a migration for these changes (pnpm migration:generate):\n'
      );
      for (const q of upQueries) console.error(`  ${q.query};`);
      process.exit(1);
    }

    console.log('Migrations and entities are in sync.');
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
