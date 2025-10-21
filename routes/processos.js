const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/advocacia.db');

function getDb() {
  return new sqlite3.Database(dbPath);
}

// Listar processos
router.get('/', (req, res) => {
  const { status, cliente_id } = req.query;
  const db = getDb();

  let query = 'SELECT * FROM processos WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (cliente_id) {
    query += ' AND cliente_id = ?';
    params.push(cliente_id);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, processos) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar processos' });
    }
    res.json(processos || []);
  });
});

// Obter processo por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get('SELECT * FROM processos WHERE id = ?', [id], (err, processo) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar processo' });
    }
    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }
    res.json(processo);
  });
});

// Criar processo
router.post('/', (req, res) => {
  const {
    cliente_id,
    numero_processo,
    status = 'ativo',
    vara,
    comarca,
    descricao,
    data_inicio,
    data_fim
  } = req.body;

  if (!cliente_id || !numero_processo) {
    return res.status(400).json({ error: 'Cliente e número do processo são obrigatórios' });
  }

  const id = uuidv4();
  const db = getDb();

  db.run(
    `INSERT INTO processos (id, cliente_id, numero_processo, status, vara, comarca, descricao, data_inicio, data_fim)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, cliente_id, numero_processo, status, vara, comarca, descricao, data_inicio, data_fim],
    function(err) {
      db.close();
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Processo com este número já existe' });
        }
        return res.status(500).json({ error: 'Erro ao criar processo' });
      }
      res.status(201).json({ id, cliente_id, numero_processo, status });
    }
  );
});

// Atualizar processo
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    numero_processo,
    status,
    vara,
    comarca,
    descricao,
    data_inicio,
    data_fim
  } = req.body;

  const db = getDb();

  db.run(
    `UPDATE processos SET numero_processo = ?, status = ?, vara = ?, comarca = ?, descricao = ?, data_inicio = ?, data_fim = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [numero_processo, status, vara, comarca, descricao, data_inicio, data_fim, id],
    function(err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar processo' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Processo não encontrado' });
      }
      res.json({ message: 'Processo atualizado com sucesso' });
    }
  );
});

// Deletar processo
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.run('DELETE FROM processos WHERE id = ?', [id], function(err) {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar processo' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }
    res.json({ message: 'Processo deletado com sucesso' });
  });
});

module.exports = router;

