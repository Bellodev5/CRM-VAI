const express = require('express');
const router = express.Router();
const pool = require('./src/config/database');

// ========================================
// MIDDLEWARE DE LOG
// ========================================
router.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ========================================
// GET - Listar todas as vendas (COMPLETO)
// ========================================
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Buscando todas as vendas...');
    
    const result = await pool.query(`
      SELECT * FROM deals 
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Encontradas ${result.rows.length} vendas`);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar vendas:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar vendas',
      error: error.message
    });
  }
});

// ========================================
// POST - Criar nova venda (CORRIGIDO - SALVA TODOS OS CAMPOS)
// ========================================
router.post('/', async (req, res) => {
  console.log('\n🎯 ====== CRIANDO NOVA VENDA ======');
  console.log('📦 Dados recebidos:', req.body);
  
  if (!req.body || !req.body.empresa) {
    console.log('❌ ERRO: Empresa é obrigatória');
    return res.status(400).json({
      success: false,
      message: 'Campo "empresa" é obrigatório',
      received: req.body
    });
  }
  
  const client = await pool.connect();
  
  // Definir query e values para usar em todo o escopo
  let query = '';
  let values = [];
  
  try {
    // Extrair TODOS os campos do frontend
    const {
      id, // ignorado, será gerado pelo banco
      createdAt,
      owner_id,
      owner,
      status = 'novo',
      produto = '',
      empresa,
      cnpj = '',
      responsavel = '',
      whatsapp = '',
      email = '',
      formaPagamento = '',
      qtdConexoes = 0,
      qtdUsuarios = 0,
      plataformaHabilitada = false,
      qtdUraCanais = 0,
      qtdIaCanais = 0,
      qtdApiOficial = 0,
      leadsValor = 0,
      desconto = 0,
      subtotal = 0,
      total = 0,
      treinamentoData = '',
      treinamentoHora = '',
      treinamentoStatus = 'pendente',
      tipoVenda = 'nova',
      pagamentoConfirmado = false,
      agendaOk = false,
      qualidadeOK = false,
      observacoes = [],
      comprovante = ''
    } = req.body;

    // Usar a data atual se não for fornecida
    const created_at = createdAt ? new Date(createdAt) : new Date();
    
    console.log(`💾 Salvando: ${empresa} (${status})`);
    console.log(`💰 Total: ${total}, Subtotal: ${subtotal}`);
    console.log(`👤 Vendedor: ${owner} (ID: ${owner_id})`);
    
    await client.query('BEGIN');
    
    // QUERY COMPLETA - INCLUI TODOS OS CAMPOS
    query = `
      INSERT INTO deals (
        created_at,
        owner_id,
        owner,
        status,
        produto,
        empresa,
        cnpj,
        responsavel,
        whatsapp,
        email,
        forma_pagamento,
        qtd_conexoes,
        qtd_usuarios,
        plataforma_habilitada,
        qtd_ura_canais,
        qtd_ia_canais,
        qtd_api_oficial,
        leads_valor,
        desconto,
        subtotal,
        total,
        treinamento_data,
        treinamento_hora,
        treinamento_status,
        tipo_venda,
        pagamento_confirmado,
        agenda_ok,
        qualidade_ok,
        observacoes,
        comprovante
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
      RETURNING *
    `;
    
    values = [
      created_at,
      owner_id || null,
      owner || '',
      status,
      produto || '',
      empresa,
      cnpj || '',
      responsavel || '',
      whatsapp || '',
      email || '',
      formaPagamento || '',
      Number(qtdConexoes) || 0,
      Number(qtdUsuarios) || 0,
      Boolean(plataformaHabilitada),
      Number(qtdUraCanais) || 0,
      Number(qtdIaCanais) || 0,
      Number(qtdApiOficial) || 0,
      Number(leadsValor) || 0,
      Number(desconto) || 0,
      Number(subtotal) || 0,
      Number(total) || 0,
      treinamentoData || '',
      treinamentoHora || '',
      treinamentoStatus || 'pendente',
      tipoVenda || 'nova',
      Boolean(pagamentoConfirmado),
      Boolean(agendaOk),
      Boolean(qualidadeOK),
      JSON.stringify(observacoes || []),
      comprovante || ''
    ];
    
    console.log('📝 Executando query com valores:', values);
    
    const result = await client.query(query, values);
    
    await client.query('COMMIT');
    
    const saved = result.rows[0];
    console.log('✅ SALVO COM SUCESSO!');
    console.log(`🆔 ID: ${saved.id}`);
    console.log(`🏢 Empresa: ${saved.empresa}`);
    console.log(`💰 Total salvo: ${saved.total}`);
    console.log(`💰 Subtotal salvo: ${saved.subtotal}`);
    console.log(`👤 Vendedor salvo: ${saved.owner}`);
    console.log(`📅 Criado em: ${saved.created_at}`);
    console.log('====== FIM ======\n');
    
    res.status(201).json({
      success: true,
      message: 'Venda criada com sucesso!',
      data: saved
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('❌ ERRO NO BANCO:', error.message);
    console.error('❌ Código do erro:', error.code);
    
    // Se erro for de coluna inexistente, precisamos atualizar a tabela
    if (error.code === '42703' || error.message.includes('column')) {
      console.log('🔨 Coluna não existe. Atualizando estrutura da tabela...');
      
      try {
        // Lista de colunas para adicionar (caso não existam)
        const columnsToAdd = [
          'owner_id INTEGER',
          'owner VARCHAR(100)',
          'forma_pagamento VARCHAR(50)',
          'qtd_conexoes INTEGER DEFAULT 0',
          'qtd_usuarios INTEGER DEFAULT 0',
          'plataforma_habilitada BOOLEAN DEFAULT false',
          'qtd_ura_canais INTEGER DEFAULT 0',
          'qtd_ia_canais INTEGER DEFAULT 0',
          'qtd_api_oficial INTEGER DEFAULT 0',
          'leads_valor DECIMAL(10,2) DEFAULT 0',
          'desconto DECIMAL(10,2) DEFAULT 0',
          'subtotal DECIMAL(10,2) DEFAULT 0',
          'total DECIMAL(10,2) DEFAULT 0',
          'treinamento_data DATE',
          'treinamento_hora TIME',
          'treinamento_status VARCHAR(20) DEFAULT \'pendente\'',
          'tipo_venda VARCHAR(20) DEFAULT \'nova\'',
          'pagamento_confirmado BOOLEAN DEFAULT false',
          'agenda_ok BOOLEAN DEFAULT false',
          'qualidade_ok BOOLEAN DEFAULT false',
          'observacoes JSONB DEFAULT \'[]\'',
          'comprovante TEXT'
        ];
        
        // Verificar e adicionar colunas que faltam
        for (const columnDef of columnsToAdd) {
          const columnName = columnDef.split(' ')[0];
          try {
            await client.query(`
              ALTER TABLE deals 
              ADD COLUMN IF NOT EXISTS ${columnDef}
            `);
            console.log(`✅ Coluna ${columnName} adicionada/verificada`);
          } catch (alterError) {
            console.log(`⚠️ Coluna ${columnName} já existe ou erro:`, alterError.message);
          }
        }
        
        console.log('✅ Estrutura atualizada! Tentando salvar novamente...');
        
        // Tenta inserir novamente
        const retryResult = await client.query(query, values);
        
        res.status(201).json({
          success: true,
          message: 'Venda criada (estrutura atualizada automaticamente)',
          data: retryResult.rows[0]
        });
        
      } catch (alterError) {
        console.error('❌ ERRO AO ATUALIZAR TABELA:', alterError.message);
        res.status(500).json({
          success: false,
          message: 'Erro ao atualizar estrutura da tabela',
          error: alterError.message
        });
      }
      
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar venda',
        error: error.message,
        code: error.code
      });
    }
    
  } finally {
    client.release();
  }
});

// ========================================
// PUT - Atualizar venda (ATUALIZADO)
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`✏️ Atualizando venda ${id}:`, updates);
    
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    // Mapear campos do frontend para colunas do banco
    const fieldMap = {
      owner_id: 'owner_id',
      owner: 'owner',
      status: 'status',
      produto: 'produto',
      empresa: 'empresa',
      cnpj: 'cnpj',
      responsavel: 'responsavel',
      whatsapp: 'whatsapp',
      email: 'email',
      formaPagamento: 'forma_pagamento',
      qtdConexoes: 'qtd_conexoes',
      qtdUsuarios: 'qtd_usuarios',
      plataformaHabilitada: 'plataforma_habilitada',
      qtdUraCanais: 'qtd_ura_canais',
      qtdIaCanais: 'qtd_ia_canais',
      qtdApiOficial: 'qtd_api_oficial',
      leadsValor: 'leads_valor',
      desconto: 'desconto',
      subtotal: 'subtotal',
      total: 'total',
      treinamentoData: 'treinamento_data',
      treinamentoHora: 'treinamento_hora',
      treinamentoStatus: 'treinamento_status',
      tipoVenda: 'tipo_venda',
      pagamentoConfirmado: 'pagamento_confirmado',
      agendaOk: 'agenda_ok',
      qualidadeOK: 'qualidade_ok'
    };
    
    // Construir dinamicamente os campos a atualizar
    for (const [key, value] of Object.entries(updates)) {
      const dbColumn = fieldMap[key];
      if (dbColumn && key !== 'id') {
        fields.push(`${dbColumn} = $${paramCount}`);
        
        // Converter tipos específicos
        if (key === 'observacoes') {
          values.push(JSON.stringify(value || []));
        } else if (typeof value === 'boolean') {
          values.push(value);
        } else if (typeof value === 'number') {
          values.push(value);
        } else {
          values.push(value);
        }
        
        paramCount++;
      }
    }
    
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo válido para atualizar'
      });
    }
    
    fields.push('updated_at = NOW()');
    values.push(id);
    
    const query = `
      UPDATE deals 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    console.log('📝 Query de atualização:', query);
    console.log('📝 Valores:', values);
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }
    
    console.log(`✅ Venda ${id} atualizada`);
    console.log(`💰 Novo total: ${result.rows[0].total}`);
    
    res.json({
      success: true,
      message: 'Venda atualizada',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar venda',
      error: error.message
    });
  }
});

// ========================================
// DELETE - Remover venda
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Removendo venda ${id}`);
    
    const result = await pool.query(
      'DELETE FROM deals WHERE id = $1 RETURNING id, empresa',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }
    
    console.log(`✅ Venda ${id} removida`);
    
    res.json({
      success: true,
      message: 'Venda removida',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao deletar:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar venda',
      error: error.message
    });
  }
});

// ========================================
// ROTA DE DIAGNÓSTICO (ATUALIZADA)
// ========================================
router.get('/diagnostico', async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log('🩺 DIAGNÓSTICO DO SISTEMA');
    
    // 1. Testa conexão
    const conexao = await client.query(`
      SELECT 
        current_database() as banco,
        current_schema() as schema,
        NOW() as hora_servidor
    `);
    
    // 2. Verifica tabela deals
    const tabela = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'deals'
      ) as existe
    `);
    
    // 3. Conta registros
    const contagem = await client.query('SELECT COUNT(*) as total FROM deals');
    
    // 4. Lista TODAS as colunas
    const colunas = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'deals'
      ORDER BY ordinal_position
    `);
    
    // 5. Mostra alguns registros com valores
    const amostra = await client.query(`
      SELECT id, empresa, total, subtotal, owner, created_at
      FROM deals 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    const resultado = {
      conexao: conexao.rows[0],
      tabela: {
        existe: tabela.rows[0].existe,
        colunas: colunas.rows,
        total_registros: parseInt(contagem.rows[0].total),
        amostra: amostra.rows
      }
    };
    
    console.log('📊 Resultado do diagnóstico:', resultado);
    
    res.json({
      success: true,
      message: 'Diagnóstico completo',
      data: resultado
    });
    
  } catch (error) {
    console.error('❌ ERRO NO DIAGNÓSTICO:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Erro no diagnóstico',
      error: error.message,
      suggestion: 'Verifique se o PostgreSQL está rodando e se o banco existe'
    });
  } finally {
    client.release();
  }
});

// ========================================
// ROTA DE RESET (COM ESTRUTURA COMPLETA)
// ========================================
router.post('/reset-teste', async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 RESETANDO PARA TESTES...');
    
    await client.query('BEGIN');
    
    // 1. Apaga tabela
    await client.query('DROP TABLE IF EXISTS deals CASCADE');
    
    // 2. Cria tabela NOVA com TODOS os campos
    await client.query(`
      CREATE TABLE deals (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        
        -- Vendedor
        owner_id INTEGER,
        owner VARCHAR(100),
        
        -- Status
        status VARCHAR(50) DEFAULT 'novo',
        
        -- Produto
        produto VARCHAR(100),
        
        -- Empresa
        empresa VARCHAR(255) NOT NULL,
        cnpj VARCHAR(20),
        responsavel VARCHAR(255),
        whatsapp VARCHAR(20),
        email VARCHAR(255),
        
        -- Pagamento
        forma_pagamento VARCHAR(50),
        
        -- Quantidades
        qtd_conexoes INTEGER DEFAULT 0,
        qtd_usuarios INTEGER DEFAULT 0,
        plataforma_habilitada BOOLEAN DEFAULT false,
        qtd_ura_canais INTEGER DEFAULT 0,
        qtd_ia_canais INTEGER DEFAULT 0,
        qtd_api_oficial INTEGER DEFAULT 0,
        
        -- Valores
        leads_valor DECIMAL(10,2) DEFAULT 0,
        desconto DECIMAL(10,2) DEFAULT 0,
        subtotal DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) DEFAULT 0,
        
        -- Treinamento
        treinamento_data DATE,
        treinamento_hora TIME,
        treinamento_status VARCHAR(20) DEFAULT 'pendente',
        
        -- Tipo de venda
        tipo_venda VARCHAR(20) DEFAULT 'nova',
        
        -- Status de aprovação
        pagamento_confirmado BOOLEAN DEFAULT false,
        agenda_ok BOOLEAN DEFAULT false,
        qualidade_ok BOOLEAN DEFAULT false,
        
        -- Outros
        observacoes JSONB DEFAULT '[]',
        comprovante TEXT
      )
    `);
    
    await client.query(`
      INSERT INTO deals (
        empresa, status, responsavel, whatsapp, owner, produto,
        qtd_conexoes, qtd_usuarios, subtotal, total, pagamento_confirmado
      ) VALUES 
      ('Empresa Alpha', 'ativo', 'Carlos Silva', '11999999999', 'Elison', 'VAI Simples', 2, 3, 1000.00, 1000.00, true),
      ('Empresa Beta', 'treinamento_pendente', 'Ana Costa', '11988888888', 'Cris', 'VAI + Canais Sociais', 3, 4, 1500.00, 1500.00, false),
      ('Empresa Gamma', 'experiencia', 'Roberto Santos', '11977777777', 'Rodrigo', 'VAI + Canais + IA', 1, 2, 2000.00, 2000.00, true)
    `);
    
    await client.query('COMMIT');
    
    console.log('✅ Reset completo! 3 registros de teste REALISTAS inseridos.');
    
    res.json({
      success: true,
      message: 'Banco resetado com estrutura completa e dados de teste'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro no reset:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro no reset',
      error: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;