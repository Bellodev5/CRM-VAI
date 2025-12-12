// vai-crm-backend/users.js
const express = require('express');
const router = express.Router();

const users = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@vai.com',
    role: 'Gerencia',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Vendedor Teste',
    email: 'vendedor@vai.com',
    role: 'Vendedor',
    createdAt: new Date().toISOString()
  }
];

router.get('/', (req, res) => {
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado'
    });
  }
  
  res.json({
    success: true,
    data: user
  });
});

module.exports = router;