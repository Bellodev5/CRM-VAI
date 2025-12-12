// vai-crm-backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Importa rotas
const dealRoutes = require('./deal');
const usersRoutes = require('./users');

// Registra rotas
app.use('/api/deals', dealRoutes);
app.use('/api/users', usersRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API funcionando', 
    timestamp: new Date().toISOString(),
    mode: 'open-access (sem autenticação)'
  });
});

// Serve frontend (CAMINHO CORRIGIDO)
const frontendPath = path.join(__dirname, 'dist');

// Verifica se a pasta dist existe
if (fs.existsSync(frontendPath)) {
  console.log('✅ Pasta dist/ encontrada');
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.log('❌ Pasta dist/ não encontrada');
  console.log('📁 Caminho esperado:', frontendPath);
  console.log('💡 Execute: cd vai-crm-frontend && npm run build');
  
  app.get('*', (req, res) => {
    res.status(404).json({ 
      message: 'Frontend não encontrado. Execute o build do frontend primeiro.',
      expectedPath: frontendPath
    });// vai-crm-backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Importa rotas da API
const dealRoutes = require('./deal');
const usersRoutes = require('./users');

// Rota de health check (antes das rotas de API)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API funcionando', 
    timestamp: new Date().toISOString(),
    mode: 'open-access (sem autenticação)'
  });
});

// Registra rotas da API
app.use('/api/deals', dealRoutes);
app.use('/api/users', usersRoutes);

// Serve arquivos estáticos do frontend
const frontendPath = path.join(__dirname, 'dist');

if (fs.existsSync(frontendPath)) {
  console.log('✅ Pasta dist/ encontrada em:', frontendPath);
  
  // Servir arquivos estáticos com configuração correta
  app.use(express.static(frontendPath, {
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filepath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
  
  // SPA fallback - qualquer rota não-API retorna o index.html
  app.get('*', (req, res) => {
    // Não interceptar rotas de API
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API endpoint não encontrado' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.log('❌ Pasta dist/ não encontrada em:', frontendPath);
  console.log('💡 Execute: cd vai-crm && npm run build');
  
  app.get('*', (req, res) => {
    res.status(404).json({ 
      message: 'Frontend não encontrado. Execute o build do frontend primeiro.',
      expectedPath: frontendPath
    });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor BACKEND rodando na porta ${PORT}`);
  console.log(`✅ Modo: Acesso aberto (SEM LOGIN)`);
  console.log(`✅ Rotas disponíveis:`);
  console.log(`   GET    /api/health`);
  console.log(`   GET    /api/users`);
  console.log(`   GET    /api/users/:id`);
  console.log(`   GET    /api/deals`);
  console.log(`   POST   /api/deals`);
  console.log(`   PUT    /api/deals/:id`);
  console.log(`   DELETE /api/deals/:id`);
  console.log(`\n📡 Acesse: http://localhost:${PORT}`);
});
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor BACKEND rodando na porta ${PORT}`);
  console.log(`✅ Modo: Acesso aberto (SEM LOGIN)`);
  console.log(`✅ Rotas disponíveis:`);
  console.log(`   GET    /api/health`);
  console.log(`   GET    /api/users`);
  console.log(`   GET    /api/users/:id`);
  console.log(`   GET    /api/deals`);
  console.log(`   POST   /api/deals`);
  console.log(`   PUT    /api/deals/:id`);
  console.log(`   DELETE /api/deals/:id`);
  console.log(`\n📡 Acesse: http://localhost:${PORT}`);
});