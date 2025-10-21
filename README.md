# Sistema de Gestão para Escritórios de Advocacia

Sistema completo de gerenciamento para escritórios de advocacia, desenvolvido em **Node.js + Express** com banco de dados **SQLite**, autenticação **JWT** e integração com **N8N** para automação de WhatsApp.

## 🎯 Funcionalidades

- ✅ **Autenticação segura** com JWT
- ✅ **Gestão de clientes** completa
- ✅ **Gestão de setores** (Atendimento, Financeiro, Documentos, Processos)
- ✅ **Gestão de processos judiciais**
- ✅ **Gestão de documentos** com upload
- ✅ **Dashboard** com estatísticas
- ✅ **Integração com N8N** para WhatsApp
- ✅ **Relatórios** e atividades
- ✅ **Deploy na Vercel** (sem dependências externas)

## 📋 Pré-requisitos

- **Node.js 18+** instalado
- **npm** ou **yarn**
- **Git** para versionamento

## 🚀 Instalação Local

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/advocacia-sistema.git
cd advocacia-sistema
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-super-segura
ADMIN_USER=admin
ADMIN_PASS=admin123
```

### 4. Iniciar o servidor

**Modo desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

O servidor estará disponível em **http://localhost:3000**

### 5. Acessar o sistema

- **URL**: http://localhost:3000
- **Usuário**: admin
- **Senha**: admin123

⚠️ **IMPORTANTE**: Mude as credenciais padrão após o primeiro acesso!

## 📁 Estrutura do Projeto

```
advocacia-sistema/
├── server.js                 # Servidor principal Express
├── package.json             # Dependências
├── vercel.json             # Configuração Vercel
├── .env.example            # Exemplo de variáveis
├── README.md               # Esta documentação
│
├── database/
│   └── init.js             # Inicialização SQLite
│
├── routes/
│   ├── auth.js             # Autenticação
│   ├── clientes.js         # Gestão de clientes
│   ├── setores.js          # Gestão de setores
│   ├── processos.js        # Gestão de processos
│   ├── documentos.js       # Gestão de documentos
│   └── relatorios.js       # Relatórios e webhooks
│
└── public/                 # Frontend estático (HTML/CSS/JS)
    ├── index.html
    ├── login.html
    ├── dashboard.html
    ├── clientes.html
    ├── css/
    └── js/
```

## 🔌 API Endpoints

### Autenticação

```bash
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@advocacia.com",
    "role": "admin"
  }
}
```

### Clientes

```bash
# Listar clientes
GET /api/clientes
GET /api/clientes?status=ativo&setor_id=1&search=João

# Obter cliente
GET /api/clientes/:id

# Criar cliente
POST /api/clientes
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "whatsapp": "(11) 99999-9999",
  "cpf_cnpj": "123.456.789-00",
  "endereco": "Rua A, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "status": "ativo",
  "setor_id": "1",
  "observacoes": "Cliente importante"
}

# Atualizar cliente
PUT /api/clientes/:id

# Deletar cliente
DELETE /api/clientes/:id
```

### Setores

```bash
# Listar setores
GET /api/setores

# Criar setor
POST /api/setores
{
  "nome": "Atendimento",
  "descricao": "Setor de atendimento ao cliente"
}
```

### Processos

```bash
# Listar processos
GET /api/processos
GET /api/processos?status=ativo&cliente_id=123

# Criar processo
POST /api/processos
{
  "cliente_id": "123",
  "numero_processo": "0000000-00.0000.0.00.0000",
  "status": "ativo",
  "vara": "Cível",
  "comarca": "São Paulo",
  "descricao": "Processo de cobrança",
  "data_inicio": "2025-01-01",
  "data_fim": null
}
```

### Documentos

```bash
# Listar documentos de um cliente
GET /api/documentos/cliente/:cliente_id

# Criar documento
POST /api/documentos
{
  "cliente_id": "123",
  "titulo": "Contrato de Serviços",
  "categoria": "Contrato",
  "url_arquivo": "https://...",
  "nome_arquivo": "contrato.pdf",
  "tamanho_arquivo": 102400,
  "tipo_mime": "application/pdf",
  "descricao": "Contrato assinado"
}
```

### Relatórios

```bash
# Dashboard
GET /api/relatorios/dashboard

# Relatório mensal
GET /api/relatorios/mensal

# Webhook N8N - Novo cliente via WhatsApp
POST /api/relatorios/n8n
{
  "tipo": "novo_cliente",
  "cliente_nome": "João Silva",
  "cliente_telefone": "(11) 99999-9999",
  "cliente_whatsapp": "(11) 99999-9999",
  "mensagem": "Olá, gostaria de agendar uma consulta"
}

# Webhook N8N - Agendamento
POST /api/relatorios/agendamento
{
  "cliente_id": "123",
  "cliente_nome": "João Silva",
  "cliente_telefone": "(11) 99999-9999",
  "data_agendamento": "2025-01-15",
  "hora_agendamento": "14:30",
  "descricao": "Consulta jurídica"
}
```

## 🔐 Autenticação

Todos os endpoints (exceto `/api/auth/login` e `/api/relatorios`) requerem um token JWT no header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Exemplo com curl:**
```bash
curl -H "Authorization: Bearer seu-token" \
  http://localhost:3000/api/clientes
```

## 🌐 Deploy na Vercel

### Método 1: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel
```

### Método 2: Via GitHub (Recomendado)

1. **Criar repositório no GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/advocacia-sistema.git
   git push -u origin main
   ```

2. **Conectar na Vercel**
   - Acesse https://vercel.com
   - Clique em "New Project"
   - Selecione seu repositório do GitHub
   - Clique em "Import"

3. **Configurar variáveis de ambiente**
   - Na página do projeto, vá em "Settings" > "Environment Variables"
   - Adicione:
     - `JWT_SECRET`: sua-chave-secreta
     - `NODE_ENV`: production

4. **Deploy automático**
   - Clique em "Deploy"
   - Pronto! Seu projeto estará disponível em `https://seu-projeto.vercel.app`

## 🔗 Integração com N8N (WhatsApp)

### Configurar webhook no N8N

1. **No N8N, crie um novo workflow**
2. **Adicione um nó "Webhook"**
3. **Configure:**
   - **Method**: POST
   - **URL**: `https://seu-projeto.vercel.app/api/relatorios/n8n`
   - **Authentication**: None (ou adicione token se desejar)

4. **Mapeie os dados:**
   ```json
   {
     "tipo": "novo_cliente",
     "cliente_nome": "{{$node.WhatsApp.json.body.name}}",
     "cliente_telefone": "{{$node.WhatsApp.json.body.phone}}",
     "cliente_whatsapp": "{{$node.WhatsApp.json.body.phone}}",
     "mensagem": "{{$node.WhatsApp.json.body.message}}"
   }
   ```

5. **Teste o webhook**
   - Envie uma mensagem via WhatsApp
   - Verifique se o cliente foi criado no sistema

## 🗄️ Banco de Dados

O sistema usa **SQLite** que é criado automaticamente em `database/advocacia.db`.

### Tabelas principais

- **users**: Usuários do sistema
- **clientes**: Clientes cadastrados
- **setores**: Setores da empresa
- **processos**: Processos judiciais
- **documentos**: Documentos anexados
- **conversas**: Histórico de conversas
- **mensagens**: Mensagens das conversas
- **contatos**: Contatos adicionais
- **faturas**: Cobranças e pagamentos
- **atividades**: Log de atividades

## 🔄 Fluxo de Dados

### Novo Cliente via WhatsApp

1. Cliente envia mensagem no WhatsApp
2. N8N recebe a mensagem
3. N8N envia POST para `/api/relatorios/n8n`
4. Sistema cria/atualiza cliente no banco
5. Atividade é registrada
6. Resposta é enviada ao N8N

### Agendamento

1. Cliente agenda via WhatsApp
2. N8N recebe agendamento
3. N8N envia POST para `/api/relatorios/agendamento`
4. Sistema registra agendamento
5. Notificação é enviada ao advogado (opcional)

## 🐛 Troubleshooting

### Erro: "Cannot find module 'sqlite3'"
```bash
npm install sqlite3
```

### Erro: "EADDRINUSE: address already in use :::3000"
```bash
# Mude a porta no .env
PORT=3001
```

### Erro: "Token inválido"
- Verifique se o token está sendo enviado corretamente
- Verifique se `JWT_SECRET` é o mesmo em `.env`

### Banco de dados não está sendo criado
- Verifique se a pasta `database/` existe
- Verifique permissões de escrita

## 📊 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | 3000 |
| `NODE_ENV` | Ambiente (development/production) | development |
| `JWT_SECRET` | Chave para assinar tokens JWT | - |
| `ADMIN_USER` | Usuário padrão | admin |
| `ADMIN_PASS` | Senha padrão | admin123 |
| `N8N_API_KEY` | Chave API do N8N | - |
| `N8N_WEBHOOK_URL` | URL do webhook N8N | - |

## 📝 Scripts Disponíveis

```bash
npm start    # Inicia em modo produção
npm run dev  # Inicia em modo desenvolvimento com auto-reload
```

## 🤝 Compatibilidade com EasyPanel

Este projeto é totalmente compatível com **EasyPanel** (hospedagem em VPS):

1. **Fazer upload via SFTP**
   - Conecte via SFTP ao seu servidor
   - Faça upload dos arquivos

2. **Instalar dependências**
   ```bash
   cd /caminho/do/projeto
   npm install
   ```

3. **Configurar variáveis de ambiente**
   ```bash
   nano .env
   ```

4. **Iniciar com PM2 (recomendado)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "advocacia"
   pm2 save
   pm2 startup
   ```

5. **Configurar reverse proxy no EasyPanel**
   - Aponte o domínio para a porta 3000 (ou a porta configurada)

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do servidor
2. Consulte a documentação da API
3. Teste os endpoints com Postman/Insomnia
4. Verifique se o banco de dados foi inicializado

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido por

Manus AI - Outubro 2025

---

**Versão**: 1.0.0  
**Última atualização**: Outubro 2025

