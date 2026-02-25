const { Client } = require('pg');

const client = new Client({
  host: 'lynkapp-db.cq3yg4600cbl.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'lynkapp',
  user: 'lynkadmin',
  password: 'Lynkapp2024!'
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Database connection successful!');
    const result = await client.query('SELECT NOW()');
    console.log('📅 Server time:', result.rows[0].now);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
