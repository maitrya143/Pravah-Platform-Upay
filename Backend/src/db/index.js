const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// TODO: Initialize connection and export client
// client.connect();

module.exports = client;

