
require('dotenv').config();
const { Client } = require('pg');

console.log('Testing connection to database...');
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('DATABASE_URL is not set in environment!');
    process.exit(1);
}
console.log('DATABASE_URL starts with:', dbUrl.substring(0, 20) + '...');

const client = new Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to database!');
    const res = await client.query('SELECT NOW()');
    console.log('Time from DB:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
    console.error('Error code:', err.code);
    console.error('Error details:', err.message);
  }
}

testConnection();
