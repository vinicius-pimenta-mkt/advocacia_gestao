const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./database/init.js');
const authRoutes = require('./routes/auth.js');
const clientesRoutes = require('./routes/clientes.js');
const setoresRoutes = require('./routes/setores.js');
const processosRoutes = require('./routes/processos.js');
const documentosRoutes = require('./routes/documentos.js');
const relatoriosRoutes = require('./routes/relatorios.js');

// Inicializar banco de dados
initDatabase();

const app = express();
// Variável de HOST é essencial para contêineres/Docker
const HOST = '0.0.0.0'; 
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || '35b75ccd96165e47c2308a85d821bb4daa84c91efbd282895f176db2eeb945a7';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', authenticateToken, clientesRoutes);
app.use('/api/setores', authenticateToken, setoresRoutes);
app.use('/api/processos', authenticateToken, processosRoutes);
app.use('/api/documentos', authenticateToken, documentosRoutes);
app.use('/api/relatorios', relatoriosRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
// O host é explicitamente definido como 0.0.0.0 para aceitar conexões externas ao contêiner
app.listen(PORT, HOST, () => { 
  console.log(`✅ Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`📊 Dashboard: http://${HOST}:${PORT}/dashboard`);
  console.log(`🔐 Login: http://${HOST}:${PORT}/login`);
});

module.exports = app;
