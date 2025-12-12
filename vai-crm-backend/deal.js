// vai-crm-backend/deal.js
const express = require('express');
const router = express.Router();
const pool = require('./config/database');

// GET - Listar todas as vendas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.*,
        u.name as owner_name
      FROM deals d
      LEFT JOIN users u ON d.owner_id = u.id
      ORDER BY d.created_at DESC
    `);
    
    // Converter snake_case para camelCase para compatibilidade com frontend
    const deals = result.rows.map(row => ({
      id: row.id.toString(),
      createdAt: row.created_at,
      owner_id: row.owner_id,
      owner: row.owner || row.owner_name,
      status: row.status,
      produto: row.produto || '',
      empresa: row.empresa,
      cnpj: row.cnpj || '',
      responsavel: row.responsavel || '',
      whatsapp: row.whatsapp || '',
      email: row.email || '',
      formaPagamento: row.forma_pagamento || '',
      qtdConexoes: row.qtd_conexoes || 0,
      qtdUsuarios: row.qtd_usuarios || 0,
      plataformaHabilitada: row.plataforma_habilitada || false,
      qtdUraCanais: row.qtd_ura_canais || 0,
      qtdIaCanais: row.qtd_ia_canais || 0,
      qtdApiOficial: row.qtd_api_oficial || 0,
      leadsValor: parseFloat(row.leads_valor) || 0,
      desconto: parseFloat(row.desconto) || 0,
      subtotal: row.subtotal ? parseFloat(row.subtotal) : undefined,
      valorManual: row.valor_manual,
      total: row.total ? parseFloat(row.total) : undefined,
      treinamentoData: row.treinamento_data || '',
      treinamentoHora: row.treinamento_hora || '',
      treinamentoStatus: row.treinamento_status || 'pendente',
      tipoVenda: row.tipo_venda || 'nova',
      comprovante: row.comprovante,
      pagamentoConfirmado: row.pagamento_confirmado || false,
      agendaOk: row.agenda_ok || false,
      qualidadeOK: row.qualidade_ok || false,
      observacoes: row.observacoes || []
    }));
    
    res.json({
      success: true,
      count: deals.length,
      data: deals
    });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar vendas',
      error: error.message
    });
  }
});

// POST - Criar nova venda
router.post('/', async (req, res) => {
  try {
    const deal = req.body;
    
    const result = await pool.query(`
      INSERT INTO deals (
        owner_id, owner, status, produto,
        empresa, cnpj, responsavel, whatsapp, email,
        forma_pagamento,
        qtd_conexoes, qtd_usuarios, plataforma_habilitada,
        qtd_ura_canais, qtd_ia_canais, qtd_api_oficial, leads_valor,
        desconto, subtotal, valor_manual, total,
        treinamento_data, treinamento_hora, treinamento_status,
        tipo_venda, comprovante,
        pagamento_confirmado, agenda_ok, qualidade_ok,
        observacoes
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10,
        $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19, $20, $21,
        $22, $23, $24,
        $25, $26,
        $27, $28, $29,
        $30::jsonb
      )
      RETURNING *
    `, [
      deal.owner_id || null,
      deal.owner || null,
      deal.status || 'novo',
      deal.produto || '',
      deal.empresa,
      deal.cnpj || null,
      deal.responsavel || null,
      deal.whatsapp || null,
      deal.email || null,
      deal.formaPagamento || '',
      deal.qtdConexoes || 0,
      deal.qtdUsuarios || 0,
      deal.plataformaHabilitada || false,
      deal.qtdUraCanais || 0,
      deal.qtdIaCanais || 0,
      deal.qtdApiOficial || 0,
      deal.leadsValor || 0,
      deal.desconto || 0,
      deal.subtotal || null,
      deal.valorManual || null,
      deal.total || null,
      deal.treinamentoData || null,
      deal.treinamentoHora || null,
      deal.treinamentoStatus || 'pendente',
      deal.tipoVenda || 'nova',
      deal.comprovante || null,
      deal.pagamentoConfirmado || false,
      deal.agendaOk || false,
      deal.qualidadeOK || false,
      JSON.stringify(deal.observacoes || [])
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Venda criada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(400).json({
      success: false,
      message: 'Erro ao criar venda',
      error: error.message
    });
  }
});

// PUT - Atualizar venda
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deal = req.body;
    
    const result = await pool.query(`
      UPDATE deals SET
        owner_id = COALESCE($1, owner_id),
        owner = COALESCE($2, owner),
        status = COALESCE($3, status),
        produto = COALESCE($4, produto),
        empresa = COALESCE($5, empresa),
        cnpj = COALESCE($6, cnpj),
        responsavel = COALESCE($7, responsavel),
        whatsapp = COALESCE($8, whatsapp),
        email = COALESCE($9, email),
        forma_pagamento = COALESCE($10, forma_pagamento),
        qtd_conexoes = COALESCE($11, qtd_conexoes),
        qtd_usuarios = COALESCE($12, qtd_usuarios),
        plataforma_habilitada = COALESCE($13, plataforma_habilitada),
        qtd_ura_canais = COALESCE($14, qtd_ura_canais),
        qtd_ia_canais = COALESCE($15, qtd_ia_canais),
        qtd_api_oficial = COALESCE($16, qtd_api_oficial),
        leads_valor = COALESCE($17, leads_valor),
        desconto = COALESCE($18, desconto),
        subtotal = COALESCE($19, subtotal),
        valor_manual = COALESCE($20, valor_manual),
        total = COALESCE($21, total),
        treinamento_data = COALESCE($22, treinamento_data),
        treinamento_hora = COALESCE($23, treinamento_hora),
        treinamento_status = COALESCE($24, treinamento_status),
        tipo_venda = COALESCE($25, tipo_venda),
        comprovante = COALESCE($26, comprovante),
        pagamento_confirmado = COALESCE($27, pagamento_confirmado),
        agenda_ok = COALESCE($28, agenda_ok),
        qualidade_ok = COALESCE($29, qualidade_ok),
        observacoes = COALESCE($30::jsonb, observacoes)
      WHERE id = $31
      RETURNING *
    `, [
      deal.owner_id,
      deal.owner,
      deal.status,
      deal.produto,
      deal.empresa,
      deal.cnpj,
      deal.responsavel,
      deal.whatsapp,
      deal.email,
      deal.formaPagamento,
      deal.qtdConexoes,
      deal.qtdUsuarios,
      deal.plataformaHabilitada,
      deal.qtdUraCanais,
      deal.qtdIaCanais,
      deal.qtdApiOficial,
      deal.leadsValor,
      deal.desconto,
      deal.subtotal,
      deal.valorManual,
      deal.total,
      deal.treinamentoData,
      deal.treinamentoHora,
      deal.treinamentoStatus,
      deal.tipoVenda,
      deal.comprovante,
      deal.pagamentoConfirmado,
      deal.agendaOk,
      deal.qualidadeOK,
      deal.observacoes ? JSON.stringify(deal.observacoes) : null,
      id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Venda atualizada',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar venda',
      error: error.message
    });
  }
});

// DELETE - Remover venda
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM deals WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Venda removida',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar venda',
      error: error.message
    });
  }
});

module.exports = router;