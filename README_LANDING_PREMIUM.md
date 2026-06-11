# Bloomit Fullstack Local — Landing Premium Restaurada

Esta versão mantém o backend local com SQLite e restaura a página inicial premium do projeto anterior.

## O que foi ajustado

- Landing page voltou para o visual moderno com hero, dashboard simulado, estatísticas, recursos, solicitação mobile, estoque, conformidade, planos, FAQ e CTA.
- Botões da landing agora apontam para o fluxo real do projeto fullstack:
  - Entrar -> tela de login conectada ao backend
  - Criar Conta -> cadastro empresarial conectado ao backend
- Mantida a logo Bloomit no menu e no rodapé.
- Mantidas as telas internas: dashboard, colaboradores, EPIs, estoque, solicitações, entregas, relatórios e logs.
- Campos de login/cadastro/dashboard continuam com fundo claro e texto escuro para boa visualização.

## Como rodar

Na raiz do projeto:

```bash
npm run install:all
```

Depois rode o backend:

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Em outro terminal rode o frontend:

```bash
cd frontend
npm run dev
```

## Login de teste

```txt
E-mail: teste@empresa.com
Senha: 123456
```

## URLs

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:3333
```
