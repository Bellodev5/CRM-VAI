const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// CONFIGURAÇÕES ESSENCIAIS
// ========================================

// CORS - PERMITE TODAS AS ORIGENS (desenvolvimento)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MIDDLEWARE PARA JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// LOG DAS REQUISIÇÕES (DEBUG)
// ========================================
app.use((req, res, next) => {
  const start = Date.now();
  
  console.log(`\n📨 ${req.method} ${req.url}`);
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('📦 Body:', req.body);
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`✅ ${res.statusCode} ${req.method} ${req.url} - ${duration}ms`);
  });
  
  next();
});

// ========================================
// ROTAS DA API
// ========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Importar rotas
const dealRoutes = require('./deal');
const usersRoutes = require('./users'); // Se tiver

// Registrar rotas
app.use('/api/deals', dealRoutes);

if (usersRoutes) {
  app.use('/api/users', usersRoutes);
}

// ========================================
// ROTA DE FALLBACK PARA API NÃO ENCONTRADA
// ========================================
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint da API não encontrado',
    availableEndpoints: [
      'GET    /api/health',
      'GET    /api/deals',
      'POST   /api/deals',
      'PUT    /api/deals/:id',
      'DELETE /api/deals/:id',
      'GET    /api/deals/diagnostico',
      'POST   /api/deals/reset-teste'
    ]
  });
});

// ========================================
// SERVIR FRONTEND (SE EXISTIR)
// ========================================
const frontendPath = path.join(__dirname, 'dist');

const fs = require('fs');
if (fs.existsSync(frontendPath)) {
  console.log('✅ Frontend encontrado em:', frontendPath);
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.log('⚠️ Frontend não encontrado. Apenas API disponível.');
  
  app.get('/', (req, res) => {
    res.json({
      message: 'Backend funcionando!',
      api: 'http://localhost:5000/api',
      endpoints: [
        'GET    /api/health',
        'GET    /api/deals',
        'POST   /api/deals',
        'GET    /api/deals/diagnostico'
      ]
    });
  });
}

// ========================================
// MANUSEIO DE ERROS GLOBAL
// ========================================
app.use((err, req, res, next) => {
  console.error('🔥 ERRO GLOBAL:', err.message);
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 SERVIDOR INICIADO NA PORTA ${PORT}`);
  console.log('='.repeat(50));
  console.log('📡 Endpoints disponíveis:');
  console.log(`   🌐 http://localhost:${PORT}`);
  console.log(`   🩺 http://localhost:${PORT}/api/health`);
  console.log(`   📊 http://localhost:${PORT}/api/deals/diagnostico`);
  console.log(`   📋 http://localhost:${PORT}/api/deals`);
  console.log('='.repeat(50) + '\n');
});