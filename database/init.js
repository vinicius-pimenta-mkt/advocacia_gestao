const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'advocacia.db');

function initDatabase() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erro ao conectar ao banco:', err);
      return;
    }
    console.log('✅ Banco de dados SQLite conectado');
  });

  db.serialize(() => {
    // Tabela de usuários
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de clientes
    db.run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT,
        whatsapp TEXT,
        cpf_cnpj TEXT,
        endereco TEXT,
        cidade TEXT,
        estado TEXT,
        cep TEXT,
        status TEXT DEFAULT 'ativo',
        setor_id TEXT,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (setor_id) REFERENCES setores(id)
      )
    `);

    // Tabela de setores
    db.run(`
      CREATE TABLE IF NOT EXISTS setores (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        descricao TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de processos
    db.run(`
      CREATE TABLE IF NOT EXISTS processos (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        numero_processo TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'ativo',
        vara TEXT,
        comarca TEXT,
        descricao TEXT,
        data_inicio DATE,
        data_fim DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    // Tabela de documentos
    db.run(`
      CREATE TABLE IF NOT EXISTS documentos (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        titulo TEXT NOT NULL,
        categoria TEXT,
        url_arquivo TEXT,
        nome_arquivo TEXT,
        tamanho_arquivo INTEGER,
        tipo_mime TEXT,
        descricao TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    // Tabela de conversas
    db.run(`
      CREATE TABLE IF NOT EXISTS conversas (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        assunto TEXT,
        resumo TEXT,
        ultima_mensagem TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    // Tabela de mensagens
    db.run(`
      CREATE TABLE IF NOT EXISTS mensagens (
        id TEXT PRIMARY KEY,
        conversa_id TEXT NOT NULL,
        tipo_remetente TEXT,
        nome_remetente TEXT,
        conteudo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversa_id) REFERENCES conversas(id)
      )
    `);

    // Tabela de contatos
    db.run(`
      CREATE TABLE IF NOT EXISTS contatos (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        tipo TEXT,
        label TEXT,
        valor TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    // Tabela de faturas
    db.run(`
      CREATE TABLE IF NOT EXISTS faturas (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        numero_fatura TEXT UNIQUE NOT NULL,
        descricao TEXT,
        valor DECIMAL(10, 2),
        status TEXT DEFAULT 'pendente',
        data_vencimento DATE,
        data_pagamento DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    // Tabela de atividades
    db.run(`
      CREATE TABLE IF NOT EXISTS atividades (
        id TEXT PRIMARY KEY,
        usuario_id TEXT,
        acao TEXT,
        descricao TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES users(id)
      )
    `);

    // Criar usuário padrão se não existir
    db.run(`
      INSERT OR IGNORE INTO users (id, username, password, email, role)
      VALUES ('1', 'admin', 'admin123', 'admin@advocacia.com', 'admin')
    `);

    // Criar setores padrão
    const setoresDefault = [
      { id: '1', nome: 'Atendimento', descricao: 'Setor de atendimento ao cliente' },
      { id: '2', nome: 'Financeiro', descricao: 'Setor financeiro' },
      { id: '3', nome: 'Documentos', descricao: 'Setor de documentos' },
      { id: '4', nome: 'Processos', descricao: 'Setor de processos judiciais' }
    ];

    setoresDefault.forEach(setor => {
      db.run(
        `INSERT OR IGNORE INTO setores (id, nome, descricao) VALUES (?, ?, ?)`,
        [setor.id, setor.nome, setor.descricao]
      );
    });

    console.log('✅ Tabelas do banco de dados criadas/verificadas');
  });

  db.close();
}

function getDb() {
  return new sqlite3.Database(dbPath);
}

module.exports = {
  initDatabase,
  getDb
};

