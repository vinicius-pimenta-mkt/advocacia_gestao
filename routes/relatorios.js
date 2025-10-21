const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/advocacia.db');

function getDb() {
  return new sqlite3.Database(dbPath);
}

// Dashboard - Relatório geral
router.get('/dashboard', (req, res) => {
  const db = getDb();

  // Total de clientes
  db.get('SELECT COUNT(*) as total FROM clientes', (err, clientesCount) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Processos ativos
    db.get("SELECT COUNT(*) as total FROM processos WHERE status = 'ativo'", (err, processosCount) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Erro ao buscar dados' });
      }

      // Faturas pendentes
      db.get("SELECT COUNT(*) as total, SUM(valor) as valor FROM faturas WHERE status = 'pendente'", (err, faturasCount) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Erro ao buscar dados' });
        }

        // Atividades recentes
        db.all('SELECT * FROM atividades ORDER BY created_at DESC LIMIT 10', (err, atividades) => {
          db.close();
          if (err) {
            return res.status(500).json({ error: 'Erro ao buscar dados' });
          }

          res.json({
            totalClientes: clientesCount?.total || 0,
            processosAtivos: processosCount?.total || 0,
            faturasPendentes: faturasCount?.total || 0,
            valorFaturasPendentes: faturasCount?.valor || 0,
            atividadesRecentes: atividades || []
          });
        });
      });
    });
  });
});

// Relatório mensal
router.get('/mensal', (req, res) => {
  const db = getDb();

  db.all(
    `SELECT 
      strftime('%Y-%m', created_at) as mes,
      COUNT(*) as total_clientes
    FROM clientes
    GROUP BY strftime('%Y-%m', created_at)
    ORDER BY mes DESC
    LIMIT 12`,
    (err, dados) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar dados' });
      }
      res.json(dados || []);
    }
  );
});

// Webhook N8N - Receber dados do WhatsApp
router.post('/n8n', (req, res) => {
  const {
    tipo,
    cliente_nome,
    cliente_telefone,
    cliente_whatsapp,
    mensagem,
    servico,
    data,
    hora
  } = req.body;

  if (!cliente_nome || !cliente_telefone) {
    return res.status(400).json({ error: 'Nome e telefone do cliente são obrigatórios' });
  }

  const db = getDb();

  // Verificar se cliente já existe
  db.get(
    'SELECT id FROM clientes WHERE telefone = ? OR whatsapp = ?',
    [cliente_telefone, cliente_whatsapp],
    (err, cliente) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Erro ao processar cliente' });
      }

      if (cliente) {
        // Atualizar cliente existente
        db.run(
          'UPDATE clientes SET nome = ?, whatsapp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [cliente_nome, cliente_whatsapp || cliente_telefone, cliente.id],
          function(err) {
            if (err) {
              db.close();
              return res.status(500).json({ error: 'Erro ao atualizar cliente' });
            }

            // Registrar atividade
            const idAtividade = uuidv4();
            db.run(
              'INSERT INTO atividades (id, acao, descricao) VALUES (?, ?, ?)',
              [idAtividade, 'mensagem_whatsapp', `Mensagem recebida de ${cliente_nome}: ${mensagem}`],
              function(err) {
                db.close();
                if (err) {
                  return res.status(500).json({ error: 'Erro ao registrar atividade' });
                }
                res.json({ success: true, cliente_id: cliente.id, message: 'Cliente atualizado' });
              }
            );
          }
        );
      } else {
        // Criar novo cliente
        const idCliente = uuidv4();
        db.run(
          'INSERT INTO clientes (id, nome, telefone, whatsapp, status) VALUES (?, ?, ?, ?, ?)',
          [idCliente, cliente_nome, cliente_telefone, cliente_whatsapp || cliente_telefone, 'novo'],
          function(err) {
            if (err) {
              db.close();
              return res.status(500).json({ error: 'Erro ao criar cliente' });
            }

            // Registrar atividade
            const idAtividade = uuidv4();
            db.run(
              'INSERT INTO atividades (id, acao, descricao) VALUES (?, ?, ?)',
              [idAtividade, 'novo_cliente_whatsapp', `Novo cliente criado via WhatsApp: ${cliente_nome}`],
              function(err) {
                db.close();
                if (err) {
                  return res.status(500).json({ error: 'Erro ao registrar atividade' });
                }
                res.status(201).json({ success: true, cliente_id: idCliente, message: 'Cliente criado' });
              }
            );
          }
        );
      }
    }
  );
});

// Webhook para agendamentos via N8N
router.post('/agendamento', (req, res) => {
  const {
    cliente_id,
    cliente_nome,
    cliente_telefone,
    data_agendamento,
    hora_agendamento,
    descricao
  } = req.body;

  if (!cliente_nome || !data_agendamento) {
    return res.status(400).json({ error: 'Nome do cliente e data são obrigatórios' });
  }

  const db = getDb();
  const idAtividade = uuidv4();

  db.run(
    'INSERT INTO atividades (id, acao, descricao) VALUES (?, ?, ?)',
    [idAtividade, 'agendamento', `Agendamento criado para ${cliente_nome} em ${data_agendamento} às ${hora_agendamento}`],
    function(err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Erro ao registrar agendamento' });
      }
      res.status(201).json({ success: true, message: 'Agendamento registrado' });
    }
  );
});

module.exports = router;

