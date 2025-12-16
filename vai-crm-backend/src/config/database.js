const { Pool } = require('pg');
require('dotenv').config();

console.log('🔌 Conectando ao PostgreSQL...');
console.log(`📊 Banco: ${process.env.DB_NAME}`);
console.log(`🏠 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'crmVai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Teste de conexão ao iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ERRO DE CONEXÃO:', err.message);
    console.error('💡 Verifique:');
    console.error('   1. PostgreSQL está rodando?');
    console.error(`   2. Banco "${process.env.DB_NAME}" existe?`);
    console.error(`   3. Usuário/senha correto?`);
    process.exit(1);
  }
  
  client.query('SELECT current_database() as db, version() as version', (err, result) => {
    release();
    
    if (err) {
      console.error('❌ ERRO AO TESTAR CONEXÃO:', err.message);
      return;
    }
    
    console.log(`✅ Conectado ao PostgreSQL!`);
    console.log(`📊 Banco: ${result.rows[0].db}`);
    console.log(`🔧 Versão: ${result.rows[0].version.split(',')[0]}`);
  });
});

module.exports = pool;