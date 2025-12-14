
import 'dotenv/config';
import { Client } from 'pg';

console.log('Testing connection to database...');
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) + '...');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
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
  }
}

testConnection();
