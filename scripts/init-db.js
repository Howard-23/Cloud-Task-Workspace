require('dotenv').config();

const { Client } = require('pg');

const { schemaSql } = require('../server/models/schema');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing.');
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    await client.query(schemaSql);
    const tables = await client.query(
      "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
    );

    console.log('Database initialized successfully.');
    console.log('Tables:', tables.rows.map((row) => row.table_name).join(', '));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Failed to initialize database:', error.message);
  process.exit(1);
});
