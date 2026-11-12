# Modelo de Dados (DER) — NotRPGpédia

## Diagrama (Mermaid)

```mermaid
erDiagram
    USUARIOS ||--o{ PERSONAGENS : "possui (1:N)"
    USUARIOS ||--o{ CAMPANHAS : "mestra (1:N)"
    USUARIOS ||--o{ CAMPANHA_JOGADORES : "participa"
    CAMPANHAS ||--o{ CAMPANHA_JOGADORES : "tem jogadores"
    CAMPANHAS ||--o{ PERSONAGENS : "agrupa"
    CAMPANHAS ||--o{ SESSOES : "agenda"
    USUARIOS ||--o{ DISPONIBILIDADES : "define"
    CAMPANHAS ||--o{ DISPONIBILIDADES : "contexto"
    SESSOES ||--o{ SESSAO_CONFLITOS : "registra aviso"

    USUARIOS {
        uuid id PK
        text nome
        text email
        text auth_provider
        timestamp criado_em
    }
    CAMPANHAS {
        uuid id PK
        uuid mestre_id FK
        text nome
        text sistema_rpg
        text descricao
        text qr_code_token
        timestamp qr_code_expira_em
        timestamp criado_em
    }
    CAMPANHA_JOGADORES {
        uuid id PK
        uuid campanha_id FK
        uuid jogador_id FK
        timestamp entrou_em
    }
    PERSONAGENS {
        uuid id PK
        uuid jogador_id FK
        uuid campanha_id FK
        text nome
        text sistema_rpg
        jsonb ficha
        text avatar_url
        timestamp criado_em
    }
    SESSOES {
        uuid id PK
        uuid campanha_id FK
        date data
        time hora_inicio
        time hora_fim
        boolean marcada_com_conflito
        timestamp criado_em
    }
    DISPONIBILIDADES {
        uuid id PK
        uuid usuario_id FK
        uuid campanha_id FK
        int dia_semana
        time hora_inicio
        time hora_fim
        boolean disponivel
    }
    SESSAO_CONFLITOS {
        uuid id PK
        uuid sessao_id FK
        uuid usuario_id FK
        text motivo
    }
```

## Decisões de modelagem

- **Disponibilidade é entidade própria** (não embutida em Sessão): ela representa a agenda recorrente do jogador por dia da semana/horário, independente de qualquer sessão específica. A Sessão referencia a Campanha; o cálculo de conflito cruza `disponibilidades` dos jogadores da campanha com a data/hora da sessão no momento da marcação.
- **`ficha` em JSONB**: como o formulário varia por sistema de RPG (D&D 5e, Tormenta20, Ordem Paranormal), os campos específicos ficam em JSONB dentro de `personagens`, evitando 3 tabelas diferentes. `sistema_rpg` indica qual schema de validação usar no backend.
- **`campanha_jogadores`** é a tabela de junção do N:N entre `usuarios` (como jogadores) e `campanhas`.
- **`sessao_conflitos`** guarda o histórico de quem estava em conflito quando o mestre decidiu marcar mesmo assim (auditoria do aviso).
- **`qr_code_token` + `qr_code_expira_em`**: token de acesso à campanha com expiração configurável (ex. 24h), validado no endpoint de entrada.

## Entidades que contam para a métrica

4 entidades de negócio (além de Usuário): **Campanha, Personagem, Sessão, Disponibilidade**. `campanha_jogadores` e `sessao_conflitos` são tabelas de apoio/junção.
