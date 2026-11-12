# Tecnologias — NotRPGpédia

| Camada | Escolha | Justificativa |
|---|---|---|
| Frontend | React + Vite | Equipe já definiu React; Vite dá build/dev rápido, fácil de configurar roteamento (react-router) e consumir a API REST. |
| Backend | Node.js + Express | Equipe já definiu Node; Express é leve para uma API REST com poucos endpoints, fácil de testar e documentar. |
| Banco de dados | PostgreSQL (hospedado no Supabase) | Suporta bem os relacionamentos 1:N e N:N exigidos; JSONB para a ficha de personagem variável por sistema de RPG; Supabase já entrega Postgres gerenciado + Auth + Storage no mesmo lugar. |
| Autenticação | Supabase Auth | Cobre cadastro/login/logout com hash de senha, login social (Google) e recuperação de senha por e-mail nativamente — reduz trabalho manual de segurança (2+1 pontos de complexidade). |
| Upload de imagem | Supabase Storage | Mesmo provedor do banco/auth, evita integrar um 3º serviço só para avatares. |
| E-mail (notificação de sessão) | Resend (ou Nodemailer + SMTP) | Envio simples via API a partir do backend quando uma sessão é marcada. |
| Deploy | Backend: Render · Frontend: Vercel · Banco/Auth: Supabase (cloud) | Todos com plano gratuito, atende exigência de URL pública sem custo para a equipe. |
| Validação | Zod | Validação de schema no backend com mensagens claras, sem depender só do frontend. |
| Acesso ao banco | `pg` (node-postgres) com queries parametrizadas | Evita SQL Injection sem a sobrecarga de um ORM completo, dado o escopo do projeto. |

## .env (exemplo, não versionado)

```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
PORT=3333
```
