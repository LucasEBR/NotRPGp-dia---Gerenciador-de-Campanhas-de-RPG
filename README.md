# NotRPGpédia

**NotRPGpédia** é um gerenciador de campanhas de RPG de mesa, desenvolvido para facilitar a organização de grupos e, principalmente, o agendamento de sessões de jogo.

A plataforma busca solucionar um problema comum entre jogadores: a dificuldade de encontrar horários compatíveis para reunir todos os participantes e realizar uma sessão.

## Público-alvo

Jogadores de RPG de mesa que enfrentam dificuldades para organizar campanhas e conciliar horários entre os participantes.

## Funcionalidade diferencial: Conflito de Horário

Por padrão, a grade de disponibilidade de cada jogador está toda livre; o jogador marca apenas os horários em que **não** pode. Quando o mestre tenta marcar uma sessão em um horário com algum jogador indisponível, o sistema bloqueia a marcação na primeira tentativa e mostra quem está em conflito. Se o mestre insistir, a sessão é marcada mesmo assim, ficando sinalizada com um aviso de possível ausência.

## Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Banco de dados:** PostgreSQL (Supabase)
- **Autenticação:** Supabase Auth (e-mail/senha + login social Google)

Justificativa completa em [`docs/TECNOLOGIAS.md`](docs/TECNOLOGIAS.md).

## Estrutura do repositório

```
notrpgpedia/
├── backend/        # API Node/Express
│   ├── sql/         # migrações SQL
│   └── src/
├── frontend/       # React + Vite
│   └── src/
└── docs/           # documentação do projeto
    ├── BACKLOG.md       # histórias de usuário
    ├── CHECKLIST.md     # requisitos x pontos de complexidade
    ├── DER.md           # modelo de dados
    ├── TELAS.md         # as 8 telas
    ├── TECNOLOGIAS.md   # stack justificada
    └── DEPLOY.md        # passo a passo de publicação
```

## Rodando localmente

```bash
# Banco (Supabase local ou cloud) — aplicar schema
cd backend
cp .env.example .env   # preencher com suas credenciais
npm install
npm run migrate
npm run dev             # API em http://localhost:3333

# Frontend
cd ../frontend
cp .env.example .env    # preencher com suas credenciais
npm install
npm run dev              # app em http://localhost:5173
```

## Equipe

| Responsabilidade        | Integrante |
| ----------------------- | ---------- |
| Product Owner (PO)      | Mikael     |
| Front-end               | Gustavo    |
| Back-end                | Lucas      |
| Banco de dados / Deploy | Vinícius   |

## Requisitos e pontuação (8/8)

| Requisito                       | Pontuação |
| ------------------------------- | --------: |
| Login social                    |         2 |
| Layout responsivo               |         1 |
| Upload de imagens               |         1 |
| Recuperação de senha por e-mail |         1 |
| Notificações por e-mail         |         2 |
| Exportação de relatórios        |         1 |
| **Total**                       |   **8/8** |

Status detalhado por requisito e por release em [`docs/CHECKLIST.md`](docs/CHECKLIST.md).

## Releases

- **Release 1 (concluída):** proposta, backlog, DER, telas, stack — ver `docs/`.
- **Release 2 (este commit, tag `v0.2`):** schema do banco completo, autenticação (Supabase), CRUD completo de Personagem ponta a ponta (tela → API → banco), regra de Conflito de Horário implementada no backend, layout base navegável, instruções de deploy.
- **Release 3 (próxima):** CRUD completo de Campanha e Sessão na interface, perfis/autorização lapidados, UI de conflito refinada, filtro/paginação na listagem.
- **Release 4:** extras restantes (upload de avatar, e-mail real, exportação), tratamento de erros, dados de demonstração.

## Uso de IA

Claude foi usado para: estruturar o backlog e o checklist de requisitos a partir das notas da equipe, modelar o DER, e gerar o scaffold inicial de backend (Express/Postgres/Supabase Auth) e frontend (React) cobrindo as Releases 1 e 2 — incluindo a lógica de conflito de horário. O time revisou as decisões de modelagem (ex.: disponibilidade como entidade própria) e deve validar e testar o código gerado antes da demonstração, sendo capaz de explicar qualquer parte dele.
