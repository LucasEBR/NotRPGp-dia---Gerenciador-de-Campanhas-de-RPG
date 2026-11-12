# Deploy — NotRPGpédia

## Banco de dados + Auth + Storage → Supabase

1. Criar um projeto em supabase.com (gratuito).
2. Em SQL Editor, rodar `backend/sql/001_init.sql` (ou `npm run migrate` apontando `DATABASE_URL` para a connection string do Supabase).
3. Em Authentication → Providers, habilitar **Google** (login social).
4. Copiar `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).

## Backend → Render

1. Novo "Web Service" apontando para a pasta `backend/`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Variáveis de ambiente: as mesmas de `backend/.env.example`, com os valores reais do Supabase.
5. Após o primeiro deploy, testar `GET /health` → `{ "status": "ok" }`.

## Frontend → Vercel

1. Novo projeto apontando para a pasta `frontend/`.
2. Framework preset: Vite.
3. Variáveis de ambiente: as de `frontend/.env.example`, com `VITE_API_URL` apontando para a URL pública do backend no Render (ex.: `https://notrpgpedia-api.onrender.com/api`).

## Checklist pós-deploy (Release 2)

- [ ] `GET /health` responde 200 em produção.
- [ ] Cadastro/login funcionando end-to-end no frontend publicado.
- [ ] Criar → listar → editar → excluir um personagem funcionando ponta a ponta (tela → API → banco).
- [ ] Tag `v0.2` criada no Git após a demonstração.
