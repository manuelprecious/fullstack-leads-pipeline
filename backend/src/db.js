const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Reaches up to the root folder for secrets

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Simple lifecycle logging to catch connection issues early
pool.on('connect', () => {
  console.log('Database connection pool established successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};