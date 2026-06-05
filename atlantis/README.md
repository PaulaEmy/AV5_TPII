# 🏨 Sistema Atlantis Hotel — AV5

Aplicação web completa para gerenciamento do Hotel Atlantis, desenvolvida com **TypeScript + Express + MySQL**.

---

## 📁 Estrutura do Projeto

```
atlantis/
├── src/
│   ├── index.ts                  # Servidor principal
│   ├── database/
│   │   └── connection.ts         # Pool de conexão MySQL
│   ├── models/
│   │   ├── clienteModel.ts       # Queries de clientes, docs e telefones
│   │   └── hospedagemModel.ts    # Queries de quartos e hospedagens
│   ├── controllers/
│   │   ├── clienteController.ts  # Lógica de negócio - clientes
│   │   └── hospedagemController.ts
│   └── routes/
│       ├── clienteRoutes.ts      # Rotas /api/clientes
│       └── hospedagemRoutes.ts   # Rotas /api/hospedagens
├── public/                       # Frontend (HTML + CSS + JS puro)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js                # Comunicação com a API
│       ├── app.js                # Roteador de páginas
│       └── pages/
│           ├── dashboard.js
│           ├── clientes.js
│           ├── hospedagens.js
│           └── quartos.js
├── database.sql                  # Script SQL (criar banco e tabelas)
├── .env.example                  # Variáveis de ambiente
├── package.json
└── tsconfig.json
```

---

## ⚙️ Como Instalar e Rodar

### 1. Pré-requisitos
- Node.js 18+
- MySQL 8.0+

### 2. Banco de dados
Abra o MySQL e execute o script:
```sql
source caminho/para/database.sql
```
Ou use o MySQL Workbench para importar o arquivo `database.sql`.

### 3. Variáveis de ambiente
Copie o arquivo de exemplo e preencha com suas credenciais:
```bash
cp .env.example .env
```
Edite o `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=SUA_SENHA
DB_NAME=atlantis_hotel
PORT=3000
```

### 4. Instalar dependências
```bash
npm install
```

### 5. Rodar em desenvolvimento
```bash
npm run dev
```

### 6. Build e produção
```bash
npm run build
npm start
```

Acesse: **http://localhost:3000**

---

## 🗄️ Modelo de Dados

```
clientes        — id, nome, email, tipo(titular/dependente), titular_id, data_nascimento
documentos      — id, cliente_id, tipo(CPF/RG/CNH/Passaporte/Outro), numero
telefones       — id, cliente_id, numero, tipo(celular/residencial/comercial)
quartos         — id, numero, tipo(single/double/suite/deluxe), capacidade, preco_diaria, disponivel
hospedagens     — id, cliente_id, quarto_id, data_checkin, data_checkout, status, valor_total
```

---

## 🔌 Endpoints da API

### Clientes
| Método | Rota | Descrição |
|--------|------|-----------|
| GET    | /api/clientes | Lista todos os clientes |
| GET    | /api/clientes/:id | Detalhes + documentos + telefones |
| POST   | /api/clientes | Cadastrar cliente |
| PUT    | /api/clientes/:id | Atualizar cliente |
| DELETE | /api/clientes/:id | Excluir cliente |
| POST   | /api/clientes/:id/documentos | Adicionar documento |
| DELETE | /api/clientes/:id/documentos/:docId | Remover documento |
| POST   | /api/clientes/:id/telefones | Adicionar telefone |
| DELETE | /api/clientes/:id/telefones/:telId | Remover telefone |

### Hospedagens e Quartos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET    | /api/hospedagens/quartos | Lista quartos (query: ?disponivel=true) |
| GET    | /api/hospedagens | Lista todas as hospedagens |
| GET    | /api/hospedagens/dashboard | Estatísticas do sistema |
| POST   | /api/hospedagens | Criar hospedagem (check-in) |
| PATCH  | /api/hospedagens/:id/checkout | Realizar check-out |
| PATCH  | /api/hospedagens/:id/cancelar | Cancelar hospedagem |

---

## ✅ Funcionalidades

- [x] Dashboard com estatísticas em tempo real
- [x] Cadastro de clientes titulares e dependentes
- [x] Gerenciamento de documentos (CPF, RG, CNH, Passaporte)
- [x] Gerenciamento de telefones por tipo
- [x] Listagem e status de quartos
- [x] Check-in de hospedagem (bloqueia quarto automaticamente)
- [x] Check-out com cálculo automático do valor total
- [x] Cancelamento de hospedagem (libera quarto)
- [x] Transações MySQL para garantir consistência dos dados
