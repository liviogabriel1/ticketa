# Ticketa — SaaS de Ingressos (Starter)

Projeto full-stack (React + Node/Express + PostgreSQL) com autenticação, CRUD de eventos, compra simulada (mock) de ingressos, emissão de QR *token* e validação de ticket.

## Stack
- **Frontend**: React + Vite + TypeScript + Tailwind
- **Backend**: Node.js + Express + TypeScript + Sequelize + PostgreSQL + JWT
- **Infra (dev)**: Docker Compose (Postgres + Adminer)

## Como rodar localmente
1. **Banco** (opcional com Docker):
   ```bash
   docker compose up -d
   # Postgres: localhost:5432 | DB: ticketa | user: ticketa | pass: ticketa
   # Adminer: http://localhost:8080
   ```
2. **Backend**:
   ```bash
   cd backend
   cp .env.example .env
   # ajuste as variáveis se necessário
   npm install
   npm run dev
   # API em http://localhost:3001
   ```
3. **Frontend**:
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   # Web em http://localhost:5173
   ```

## Deploy (VPS Hostinger — visão geral)
- Instale Node.js LTS, Nginx e PostgreSQL (ou use um serviço gerenciado).
- **Backend**: rode com `pm2` (ou Docker). Configure `.env`.
- **Frontend**: `npm run build` e sirva estático via Nginx.
- Use o arquivo de exemplo `deploy/nginx.sample.conf` para o reverse proxy e SSL (Let's Encrypt).

## Rotas principais
- `GET /healthz`
- `POST /auth/signup` | `POST /auth/login`
- `GET /events` | `POST /events` (admin/owner)
- `POST /checkout/mock` (gera Order + Tickets e QR token)
- `POST /tickets/validate` (porteiro)
- `GET /me/tickets` (meus ingressos)

> *Observação*: o **checkout** aqui é **mock** (sem Stripe/Mercado Pago). Está preparado para você plugar provedores depois (webhooks, etc.).
