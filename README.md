# NotRPGpédia

**NotRPGpédia** é um gerenciador de campanhas de RPG de mesa, desenvolvido para facilitar a organização de grupos e, principalmente, o agendamento de sessões de jogo.

A plataforma busca solucionar um problema comum entre jogadores: a dificuldade de encontrar horários compatíveis para reunir todos os participantes e realizar uma sessão.

## Público-alvo

Jogadores de RPG de mesa que enfrentam dificuldades para organizar campanhas e conciliar horários entre os participantes.

## Funcionalidades

### Gerenciamento de contas

- **Mestre:** pode criar e gerenciar campanhas, organizar personagens e agendar sessões.
- **Jogador:** pode participar de campanhas e criar fichas de personagens.

### Gerenciamento de campanhas

- Criação e gerenciamento de campanhas pelo mestre.
- Geração de QR Code para acesso à campanha.
- Entrada de jogadores por meio da leitura do QR Code.
- Criação de fichas de personagens vinculadas às campanhas.
- Filtragem e gerenciamento dos personagens participantes.

### Agendamento de sessões

- O mestre define a data e o horário das sessões.
- Envio de notificações por e-mail aos jogadores participantes.
- Identificação de conflitos de horário entre os participantes.

## Funcionalidade diferencial

**Conflito de Horário:** funcionalidade destinada a identificar incompatibilidades de disponibilidade entre os jogadores, auxiliando o mestre na escolha de datas e horários para as sessões.

## Relacionamentos do banco de dados

- **1:N (Jogador → Personagens):** um jogador pode possuir vários personagens.
- **N:N (Jogadores ↔ Campanhas):** vários jogadores podem participar de várias campanhas.

## Requisitos e pontuação

| Requisito                       | Pontuação |
| ------------------------------- | --------: |
| Login social                    |         2 |
| Layout responsivo               |         1 |
| Upload de imagens               |         1 |
| Recuperação de senha por e-mail |         1 |
| Notificações por e-mail         |         2 |
| Exportação de relatórios        |         1 |
| **Total**                       |   **8/8** |

## Equipe

| Responsabilidade        | Integrante |
| ----------------------- | ---------- |
| Product Owner (PO)      | Mikael     |
| Front-end               | Gustavo    |
| Back-end                | Lucas      |
| Banco de dados / Deploy | Vinícius   |

---