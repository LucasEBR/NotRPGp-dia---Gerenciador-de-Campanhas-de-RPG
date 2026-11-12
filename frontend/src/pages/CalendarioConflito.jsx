import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const FAIXA_PADRAO = { hora_inicio: "19:00", hora_fim: "23:00" };

export function CalendarioConflito() {
  const { id: campanhaId } = useParams();
  const [disponibilidade, setDisponibilidade] = useState([]); // marcações do próprio jogador
  const [todasDisponibilidades, setTodasDisponibilidades] = useState([]); // visão do mestre
  const [data, setData] = useState("");
  const [conflito, setConflito] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    api.get(`/campanhas/${campanhaId}/disponibilidade`).then(setTodasDisponibilidades);
  }, [campanhaId]);

  function alternarDia(diaIndex) {
    setDisponibilidade((atual) => {
      const existe = atual.find((d) => d.dia_semana === diaIndex);
      if (existe) return atual.filter((d) => d.dia_semana !== diaIndex);
      return [...atual, { dia_semana: diaIndex, ...FAIXA_PADRAO, disponivel: false }];
    });
  }

  async function salvarDisponibilidade() {
    await api.put(`/campanhas/${campanhaId}/disponibilidade`, { itens: disponibilidade });
    setMensagem("Disponibilidade salva! Por padrão todo o resto da semana segue disponível.");
  }

  async function marcarSessao(forcar = false) {
    setConflito(null);
    setMensagem(null);
    try {
      await api.post(`/campanhas/${campanhaId}/sessoes`, {
        data,
        hora_inicio: FAIXA_PADRAO.hora_inicio,
        hora_fim: FAIXA_PADRAO.hora_fim,
        forcar_com_conflito: forcar,
      });
      setMensagem("Sessão marcada com sucesso! Jogadores foram notificados por e-mail.");
    } catch (e) {
      if (e.status === 409) {
        setConflito(e.body);
      } else {
        setMensagem(e.message);
      }
    }
  }

  return (
    <Layout>
      <h2>Calendário de Disponibilidade</h2>

      <div className="cartao">
        <strong>Minha disponibilidade (jogador)</strong>
        <p style={{ color: "var(--cor-texto-fraco)" }}>
          Por padrão tudo está disponível. Clique nos dias em que você NÃO pode jogar no horário {FAIXA_PADRAO.hora_inicio}–{FAIXA_PADRAO.hora_fim}.
        </p>
        <div className="grade-opcoes">
          {DIAS.map((dia, i) => {
            const marcado = disponibilidade.some((d) => d.dia_semana === i);
            return (
              <button
                key={dia}
                className={marcado ? "primario" : "secundario"}
                onClick={() => alternarDia(i)}
                type="button"
              >
                {dia}
              </button>
            );
          })}
        </div>
        <button className="primario" style={{ marginTop: "0.75rem" }} onClick={salvarDisponibilidade}>
          Salvar disponibilidade
        </button>
      </div>

      <div className="cartao">
        <strong>Marcar sessão (mestre)</strong>
        <label>Data</label>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        <button className="primario" onClick={() => marcarSessao(false)}>Marcar sessão</button>

        {conflito && (
          <div className="aviso-conflito" style={{ marginTop: "0.75rem" }}>
            <strong>⚠ Conflito de horário</strong>
            <p>
              Jogadores indisponíveis:{" "}
              {conflito.jogadores_indisponiveis.map((j) => j.nome).join(", ")}
            </p>
            <button className="secundario" onClick={() => marcarSessao(true)}>
              Marcar mesmo assim
            </button>
          </div>
        )}

        {mensagem && <p style={{ color: "var(--cor-sucesso)" }}>{mensagem}</p>}
      </div>

      <div className="cartao">
        <strong>Disponibilidade de todos os jogadores</strong>
        {todasDisponibilidades.length === 0 && (
          <p style={{ color: "var(--cor-texto-fraco)" }}>Ninguém marcou indisponibilidade ainda.</p>
        )}
        {todasDisponibilidades.map((d) => (
          <div key={d.id} style={{ padding: "0.35rem 0", borderTop: "1px solid #332f45" }}>
            {d.usuario_nome} — indisponível {DIAS[d.dia_semana]} {d.hora_inicio}–{d.hora_fim}
          </div>
        ))}
      </div>
    </Layout>
  );
}
