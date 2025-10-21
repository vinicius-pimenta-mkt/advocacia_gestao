const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/advocacia.db');

function getDb() {
  return new sqlite3.Database(dbPath);
}

// Listar clientes
router.get('/', (req, res) => {
  const { status, setor_id, search } = req.query;
  const db = getDb();

  let query = 'SELECT * FROM clientes WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (setor_id) {
    query += ' AND setor_id = ?';
    params.push(setor_id);
  }

  if (search) {
    query += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, clientes) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
    res.json(clientes || []);
  });
});

// Obter cliente por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get('SELECT * FROM clientes WHERE id = ?', [id], (err, cliente) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(cliente);
  });
});

// Criar cliente
router.post('/', (req, res) => {
  const {
    nome,
    email,
    telefone,
    whatsapp,
    cpf_cnpj,
    endereco,
    cidade,
    estado,
    cep,
    status = 'ativo',
    setor_id,
    observacoes
  } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const id = uuidv4();
  const db = getDb();

  db.run(
    `INSERT INTO clientes (id, nome, email, telefone, whatsapp, cpf_cnpj, endereco, cidade, estado, cep, status, setor_id, observacoes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, nome, email, telefone, whatsapp, cpf_cnpj, endereco, cidade, estado, cep, status, setor_id, observacoes],
    function(err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar cliente' });
      }
      res.status(201).json({ id, nome, email, status });
    }
  );
});

// Atualizar cliente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    nome,
    email,
    telefone,
    whatsapp,
    cpf_cnpj,
    endereco,
    cidade,
    estado,
    cep,
    status,
    setor_id,
    observacoes
  } = req.body;

  const db = getDb();

  db.run(
    `UPDATE clientes SET nome = ?, email = ?, telefone = ?, whatsapp = ?, cpf_cnpj = ?, endereco = ?, cidade = ?, estado = ?, cep = ?, status = ?, setor_id = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [nome, email, telefone, whatsapp, cpf_cnpj, endereco, cidade, estado, cep, status, setor_id, observacoes, id],
    function(err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar cliente' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      res.json({ message: 'Cliente atualizado com sucesso' });
    }
  );
});

// Deletar cliente
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.run('DELETE FROM clientes WHERE id = ?', [id], function(err) {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente deletado com sucesso' });
  });
});

module.exports = router;

