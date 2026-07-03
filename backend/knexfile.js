/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,     // Resolves to 'db' container within the bridge network
      database: process.env.DB_NAME, // Reads your schema name from .env
      user: process.env.DB_USER, // Reads your admin username from .env
      password: process.env.DB_PASSWORD,
      port: 5432                 // Native internal PostgreSQL container network port
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'   // Tracks migration state internally inside your DB
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: 5432
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  }

};