const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/advocacia.db');

function getDb() {
  return new sqlite3.Database(dbPath);
}

// Listar setores
router.get('/', (req, res) => {
  const db = getDb();

  db.all('SELECT * FROM setores ORDER BY nome', (err, setores) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar setores' });
    }
    res.json(setores || []);
  });
});

// Obter setor por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get('SELECT * FROM setores WHERE id = ?', [id], (err, setor) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar setor' });
    }
    if (!setor) {
      return res.status(404).json({ error: 'Setor não encontrado' });
    }
    res.json(setor);
  });
});

// Criar setor
router.post('/', (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const id = uuidv4();
  const db = getDb();

  db.run(
    'INSERT INTO setores (id, nome, descricao) VALUES (?, ?, ?)',
    [id, nome, descricao],
    function(err) {
      db.close();
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Setor com este nome já existe' });
        }
        return res.status(500).json({ error: 'Erro ao criar setor' });
      }
      res.status(201).json({ id, nome, descricao });
    }
  );
});

// Atualizar setor
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;

  const db = getDb();

  db.run(
    'UPDATE setores SET nome = ?, descricao = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nome, descricao, id],
    function(err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar setor' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Setor não encontrado' });
      }
      res.json({ message: 'Setor atualizado com sucesso' });
    }
  );
});

// Deletar setor
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.run('DELETE FROM setores WHERE id = ?', [id], function(err) {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar setor' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Setor não encontrado' });
    }
    res.json({ message: 'Setor deletado com sucesso' });
  });
});

module.exports = router;

