const { Pool } = require('pg');

const { AppError } = require('../utils/errors');

require('dotenv').config();

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function createPool() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

const globalScope = globalThis;

if (!globalScope.__cloudTaskPool) {
  globalScope.__cloudTaskPool = createPool();
}

function ensurePool() {
  if (!globalScope.__cloudTaskPool) {
    throw new AppError(
      'DATABASE_URL is missing. Configure Neon PostgreSQL before calling protected APIs.',
      503,
      'database_not_configured',
    );
  }

  return globalScope.__cloudTaskPool;
}

async function query(text, params = [], client) {
  const executor = client || ensurePool();
  return executor.query(text, params);
}

async function withTransaction(callback) {
  const pool = ensurePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  withTransaction,
  pool: globalScope.__cloudTaskPool,
  isDatabaseConfigured,
};
