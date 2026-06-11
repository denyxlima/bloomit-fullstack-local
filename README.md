# Bloomit Systems — Projeto Fullstack Local

Projeto completo para rodar localmente com:

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco local: SQLite
- ORM: Prisma
- Autenticação: JWT
- Senhas criptografadas com bcryptjs

## Como rodar

### 1. Instalar dependências

Abra o terminal na pasta raiz do projeto e rode:

```bash
npm run install:all
```

### 2. Criar o banco local

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

### 3. Rodar o backend

Em um terminal:

```bash
cd backend
npm run dev
```

Backend: http://localhost:3333

### 4. Rodar o frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173

## Login de teste após rodar o seed

```txt
E-mail: teste@empresa.com
Senha: 123456
```

## Funcionalidades incluídas

- Cadastro empresarial com dados importantes para gestão de EPI/NR-06
- Login real com API e token JWT
- Dashboard protegido
- Cadastro de colaboradores
- Cadastro de EPIs/mercadorias em estoque
- Movimentações de estoque
- Solicitações de EPI
- Acompanhamento de status de solicitações
- Registro de entrega de EPI
- Assinatura simples por aceite eletrônico
- Relatórios simulados com dados reais do banco
- Logs de auditoria básicos

## Observação importante

Este projeto é uma base local/MVP. Para uso real em produção, ainda é recomendado implementar validações adicionais, política LGPD, backups, assinatura eletrônica avançada, armazenamento de documentos e HTTPS.
