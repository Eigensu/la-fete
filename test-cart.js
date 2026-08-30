const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://admin:admin@localhost:5433/lafete-db' });
async function check() {
  await client.connect();
  const res = await client.query('SELECT count(*) FROM cart_items;');
  console.log('Cart items count:', res.rows[0].count);
  await client.end();
}
check();
