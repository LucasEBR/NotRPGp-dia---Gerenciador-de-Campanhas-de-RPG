# Checklist de Requisitos — NotRPGpédia

## Métrica (1/3): Produto e Dados

| Requisito | Mínimo exigido | Como cumprimos | Status |
|---|---|---|---|
| Telas | 8 distintas | Login/Cadastro · Seleção de Perfil · Home Mestre · Home Jogador · Criar/Detalhe de Campanha · Criar Ficha · Editar/Visualizar Ficha · Calendário de Disponibilidade/Conflito | A construir (R2–R3) |
| Entidades | 4 + Usuário | `campanhas`, `personagens`, `sessoes`, `disponibilidades` (+ `usuarios`, `campanha_jogadores` como apoio) | Modelado (R1) |
| CRUD completo | 3 entidades | **Personagem** (prioridade R2), Campanha, Sessão | Personagem pronto no backend (R2) |
| Relacionamentos | 1:N e N:N | 1:N: Jogador → Personagens · N:N: Jogadores ↔ Campanhas (`campanha_jogadores`) | Modelado (R1) |
| Regra de negócio | 1 além do CRUD | Conflito de Horário (disponibilidade x marcação de sessão) | Lógica implementada no backend (R2), UI na R3 |
| Listagens | busca/filtro + paginação | Filtro de personagens por campanha (mestre) com paginação | A construir (R3) |

## Métrica (2/3): Segurança e Engenharia

| Requisito | Mínimo exigido | Como cumprimos | Status |
|---|---|---|---|
| Autenticação | cadastro/login/logout, hash | Supabase Auth (bcrypt internamente, JWT) | Integrado (R2) |
| Autorização | 2 perfis, checado no backend | `mestre` / `jogador` via claim no JWT + middleware | Implementado (R2) |
| Proteção | rotas privadas bloqueadas | Middleware `requireAuth` em todas rotas `/api/*` exceto health check | Implementado (R2) |
| Validação | backend, mensagens claras | `zod` validando body de cada rota | Implementado (R2) |
| Boas práticas | ORM/queries parametrizadas, .env | `pg` com queries parametrizadas, segredos em `.env` (gitignored) | Implementado (R2) |
| Git | commits de todos, README completo | Repositório compartilhado, README na raiz | A configurar pela equipe |
| Deploy | URL pública | Backend: Render · Frontend: Vercel · Banco: Supabase | Instruções em `docs/DEPLOY.md` (R2) |

## Métrica (3/3): Pontos de Complexidade (mínimo 8)

| Item | Pontos | Status |
|---|---:|---|
| Login social (Google via Supabase Auth) | 2 | A habilitar no painel Supabase (R2) |
| Layout responsivo | 1 | CSS mobile-first no frontend (R3) |
| Upload de imagem (avatar do personagem) | 1 | Supabase Storage (R3/R4) |
| Recuperação de senha por e-mail | 1 | Supabase Auth (fluxo nativo) (R3) |
| Notificações por e-mail (sessão marcada) | 2 | Resend/Nodemailer a partir do backend (R3) |
| Exportação de relatório (uso interno da equipe, não ficha) | 1 | Rota `/api/admin/export` → CSV (R4) |
| **Total** | **8** | |

## Releases

- **Release 1 (hoje):** este checklist, backlog, DER, telas esboçadas, stack definida. ✅
- **Release 2:** auth (Supabase) + CRUD de Personagem ponta a ponta + deploy inicial + schema completo no banco.
- **Release 3:** Campanha e Sessão com CRUD completo, perfis/autorização, conflito de horário com UI, filtro/paginação.
- **Release 4:** extras restantes, tratamento de erros, dados de demo, README final com seção "Uso de IA".
