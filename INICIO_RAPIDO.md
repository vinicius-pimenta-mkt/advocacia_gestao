# 🚀 Guia de Início Rápido

## Para Iniciantes - Passo a Passo

### 1️⃣ Pré-requisitos (Instale antes de começar)

#### Windows
1. Baixe e instale **Node.js** em: https://nodejs.org/
   - Escolha a versão **LTS** (recomendada)
   - Durante a instalação, marque "Add to PATH"

2. Baixe e instale **Git** em: https://git-scm.com/

3. Abra o **PowerShell** ou **CMD** e verifique:
   ```bash
   node --version
   npm --version
   git --version
   ```

#### macOS
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node

# Instalar Git
brew install git
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm git
```

---

### 2️⃣ Clonar o Projeto

```bash
# Abra o terminal/PowerShell na pasta onde quer o projeto
git clone https://github.com/seu-usuario/advocacia-sistema.git
cd advocacia-sistema
```

---

### 3️⃣ Instalar Dependências

```bash
npm install
```

Isso vai baixar todas as bibliotecas necessárias (~200MB).

---

### 4️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# No Windows (PowerShell):
# copy .env.example .env
```

Abra o arquivo `.env` com um editor de texto e verifique:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-super-segura
ADMIN_USER=admin
ADMIN_PASS=admin123
```

---

### 5️⃣ Iniciar o Servidor

```bash
npm run dev
```

Você verá algo como:
```
✅ Servidor rodando em http://localhost:3000
📊 Dashboard: http://localhost:3000/dashboard
🔐 Login: http://localhost:3000/login
```

---

### 6️⃣ Acessar o Sistema

1. Abra seu navegador
2. Vá para: **http://localhost:3000**
3. Faça login com:
   - **Usuário**: `admin`
   - **Senha**: `admin123`

---

## 🐛 Troubleshooting Comum

### "npm: comando não encontrado"
- Node.js não foi instalado corretamente
- Reinicie o computador após instalar Node.js
- Verifique se foi marcado "Add to PATH" durante instalação

### "Porta 3000 já está em uso"
```bash
# Mude a porta no arquivo .env
PORT=3001

# Ou mate o processo usando a porta
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

### "Erro ao conectar ao banco de dados"
- O banco SQLite é criado automaticamente
- Verifique se tem permissão de escrita na pasta `database/`
- Tente deletar `database/advocacia.db` e reiniciar

### "Erro de CORS"
- Verifique se está acessando `http://localhost:3000` (não `127.0.0.1`)

---

## 📱 Testar a API com Postman

1. Baixe **Postman**: https://www.postman.com/downloads/
2. Crie uma nova requisição:
   - **Método**: POST
   - **URL**: http://localhost:3000/api/auth/login
   - **Body** (JSON):
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
3. Clique em "Send"
4. Você receberá um token JWT

---

## 🌐 Deploy na Vercel (Simples)

### Método 1: Via GitHub (Recomendado)

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
   - Clique em "Sign Up" (ou "Log In" se já tem conta)
   - Clique em "New Project"
   - Selecione seu repositório do GitHub
   - Clique em "Import"

3. **Configurar variáveis**
   - Na página do projeto, vá em "Settings" > "Environment Variables"
   - Adicione:
     ```
     JWT_SECRET = sua-chave-secreta-super-segura
     NODE_ENV = production
     ```

4. **Deploy**
   - Clique em "Deploy"
   - Espere ~2 minutos
   - Seu projeto estará em: `https://seu-projeto.vercel.app`

### Método 2: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel
```

---

## 📁 Estrutura de Pastas Explicada

```
advocacia-sistema/
├── server.js              ← Arquivo principal (não mexer)
├── package.json           ← Dependências (não mexer)
├── .env                   ← Suas configurações (MUDE AQUI)
├── .env.example           ← Exemplo (não mexer)
│
├── database/
│   └── advocacia.db       ← Banco de dados (criado automaticamente)
│
├── routes/                ← APIs do backend
│   ├── auth.js           ← Login
│   ├── clientes.js       ← Clientes
│   ├── setores.js        ← Setores
│   ├── processos.js      ← Processos
│   ├── documentos.js     ← Documentos
│   └── relatorios.js     ← Relatórios
│
└── public/                ← Frontend (páginas HTML)
    ├── index.html        ← Página inicial
    ├── login.html        ← Tela de login
    └── dashboard.html    ← Dashboard
```

---

## 🔐 Segurança Importante

⚠️ **ANTES DE FAZER DEPLOY:**

1. Mude a senha padrão:
   - Edite `database/init.js`
   - Procure por `admin123`
   - Mude para uma senha forte

2. Gere uma chave JWT segura:
   ```bash
   # No Node.js:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Copie o resultado
   - Coloque em `JWT_SECRET` no `.env`

3. Nunca compartilhe o arquivo `.env`
   - Ele está no `.gitignore` (não vai para GitHub)

---

## 📞 Próximos Passos

1. ✅ Sistema rodando localmente
2. ✅ Deploy na Vercel
3. 📝 Personalizar para seu cliente (cores, logo, dados)
4. 🔗 Integrar com N8N para WhatsApp
5. 📊 Adicionar mais funcionalidades

---

## 🆘 Precisa de Ajuda?

- Verifique os logs no terminal
- Procure a mensagem de erro no Google
- Consulte a documentação: `README.md`
- Teste os endpoints com Postman

---

**Boa sorte! 🚀**

