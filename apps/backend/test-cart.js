const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_fw0JPEFUY4gA@ep-twilight-frog-aidt0ee0.c-4.us-east-1.aws.neon.tech/neondb?sslmode=verify-full' });
async function check() {
  await client.connect();
  const res = await client.query('SELECT c.id, c."userId", u.email FROM carts c LEFT JOIN users u ON c."userId" = u.id;');
  console.log('Carts:', JSON.stringify(res.rows, null, 2));
  await client.end();
}
check();
