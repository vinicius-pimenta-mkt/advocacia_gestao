const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/advocacia.db');

function getDb() {
  return new sqlite3.Database(dbPath);
}

// Listar documentos de um cliente
router.get('/cliente/:cliente_id', (req, res) => {
  const { cliente_id } = req.params;
  const db = getDb();

  db.all(
    'SELECT * FROM documentos WHERE cliente_id = ? ORDER BY created_at DESC',
    [cliente_id],
    (err, documentos) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar documentos' });
      }
      res.json(documentos || []);
    }
  );
});

// Obter documento por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get('SELECT * FROM documentos WHERE id = ?', [id], (err, documento) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar documento' });
    }
    if (!documento) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    res.json(documento);
  });
});

// Criar documento
router.post('/', (req, res) => {
  const {
    cliente_id,
    titulo,
    categoria,
    url_arquivo,
    nome_arquivo,
    tamanho_arquivo,
    tipo_mime,
    descricao
  } = req.body;

  if (!cliente_id || !titulo) {
    return res.status(400).json({ error: 'Cliente e título são obrigatórios' });
  }

  const id = uuidv4();
  const db = getDb();

  db.run(
    `INSERT INTO documentos (id, cliente_id, titulo, categoria, url_arquivo, nome_arquivo, tamanho_arquivo, tipo_mime, descricao)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, cliente_id, titulo, categoria, url_arquivo, nome_arquivo, tamanho_arquivo, tipo_mime, descricao],
    function(err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar documento' });
      }
      res.status(201).json({ id, cliente_id, titulo, categoria });
    }
  );
});

// Atualizar documento
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    categoria,
    url_arquivo,
    nome_arquivo,
    tamanho_arquivo,
    tipo_mime,
    descricao
  } = req.body;

  const db = getDb();

  db.run(
    `UPDATE documentos SET titulo = ?, categoria = ?, url_arquivo = ?, nome_arquivo = ?, tamanho_arquivo = ?, tipo_mime = ?, descricao = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [titulo, categoria, url_arquivo, nome_arquivo, tamanho_arquivo, tipo_mime, descricao, id],
    function(err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar documento' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }
      res.json({ message: 'Documento atualizado com sucesso' });
    }
  );
});

// Deletar documento
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.run('DELETE FROM documentos WHERE id = ?', [id], function(err) {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar documento' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    res.json({ message: 'Documento deletado com sucesso' });
  });
});

module.exports = router;

