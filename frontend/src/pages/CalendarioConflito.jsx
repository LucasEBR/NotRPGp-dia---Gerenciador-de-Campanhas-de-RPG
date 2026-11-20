import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { Layout } from "../components/Layout";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const FAIXA_PADRAO = { hora_inicio: "19:00", hora_fim: "23:00" };

// "2026-11-20" -> "20/11/2026"
function formatarData(iso) {
  const [ano, mes, dia] = String(iso).slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

export function CalendarioConflito() {
  const { id: campanhaId } = useParams();
  const { usuario } = useAuth();
  const [campanha, setCampanha] = useState(null);
  const [disponibilidade, setDisponibilidade] = useState([]); // marcações do próprio jogador
  const [todasDisponibilidades, setTodasDisponibilidades] = useState([]); // visão do mestre
  const [sessoes, setSessoes] = useState([]);
  const [remarcandoId, setRemarcandoId] = useState(null); // id da sessão que está sendo remarcada
  const [data, setData] = useState("");
  const [conflito, setConflito] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const souMestre = campanha?.mestre_id === usuario?.id;

  function carregarDisponibilidades() {
    api.get(`/campanhas/${campanhaId}/disponibilidade`).then((lista) => {
      setTodasDisponibilidades(lista);
      // preenche "Minha disponibilidade" com o que este jogador já tinha salvo
      setDisponibilidade(
        lista
          .filter((d) => d.usuario_id === usuario?.id)
          .map((d) => ({
            dia_semana: d.dia_semana,
            hora_inicio: d.hora_inicio,
            hora_fim: d.hora_fim,
            disponivel: d.disponivel,
          }))
      );
    });
  }

  function carregarSessoes() {
    api.get(`/campanhas/${campanhaId}/sessoes`).then(setSessoes);
  }

  useEffect(() => {
    api.get(`/campanhas/${campanhaId}`).then(setCampanha);
    carregarDisponibilidades();
    carregarSessoes();
  }, [campanhaId]);

  function alternarDia(diaIndex) {
    setDisponibilidade((atual) => {
      const existe = atual.find((d) => d.dia_semana === diaIndex);
      if (existe) return atual.filter((d) => d.dia_semana !== diaIndex);
      return [...atual, { dia_semana: diaIndex, ...FAIXA_PADRAO, disponivel: false }];
    });
  }

  async function salvarDisponibilidade() {
    try {
      await api.put(`/campanhas/${campanhaId}/disponibilidade`, { itens: disponibilidade });
      setMensagem("Disponibilidade salva! Por padrão todo o resto da semana segue disponível.");
      carregarDisponibilidades();
    } catch (e) {
      setMensagem(e.message);
    }
  }

  async function marcarSessao(forcar = false) {
    setConflito(null);
    setMensagem(null);
    const corpo = {
      data,
      hora_inicio: FAIXA_PADRAO.hora_inicio,
      hora_fim: FAIXA_PADRAO.hora_fim,
      forcar_com_conflito: forcar,
    };
    try {
      if (remarcandoId) {
        await api.put(`/campanhas/${campanhaId}/sessoes/${remarcandoId}`, corpo);
        setMensagem("Sessão remarcada com sucesso!");
      } else {
        await api.post(`/campanhas/${campanhaId}/sessoes`, corpo);
        setMensagem("Sessão marcada com sucesso! Jogadores foram notificados por e-mail.");
      }
      setRemarcandoId(null);
      setData("");
      carregarSessoes();
    } catch (e) {
      if (e.status === 409) {
        setConflito(e.body);
      } else {
        setMensagem(e.message);
      }
    }
  }

  function iniciarRemarcacao(sessao) {
    setRemarcandoId(sessao.id);
    setData(sessao.data); // vem como "AAAA-MM-DD", formato do <input type="date">
    setConflito(null);
    setMensagem(null);
  }

  function cancelarRemarcacao() {
    setRemarcandoId(null);
    setData("");
    setConflito(null);
  }

  async function excluirSessao(sessao) {
    if (!confirm(`Excluir a sessão de ${formatarData(sessao.data)}?`)) return;
    try {
      await api.del(`/campanhas/${campanhaId}/sessoes/${sessao.id}`);
      if (remarcandoId === sessao.id) cancelarRemarcacao();
      carregarSessoes();
    } catch (e) {
      setMensagem(e.message);
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

      {souMestre && (
        <div className="cartao">
          <strong>{remarcandoId ? "Remarcar sessão (mestre)" : "Marcar sessão (mestre)"}</strong>
          <label>Data</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="primario" onClick={() => marcarSessao(false)}>
              {remarcandoId ? "Salvar nova data" : "Marcar sessão"}
            </button>
            {remarcandoId && (
              <button className="secundario" onClick={cancelarRemarcacao}>Cancelar</button>
            )}
          </div>

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
        </div>
      )}

      {mensagem && <p style={{ color: "var(--cor-sucesso)" }}>{mensagem}</p>}

      <div className="cartao">
        <strong>Sessões marcadas</strong>
        {sessoes.length === 0 && (
          <p style={{ color: "var(--cor-texto-fraco)" }}>Nenhuma sessão marcada ainda.</p>
        )}
        {sessoes.map((s) => (
          <div
            key={s.id}
            style={{
              padding: "0.5rem 0",
              borderTop: "1px solid #332f45",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <span>
              {formatarData(s.data)} · {String(s.hora_inicio).slice(0, 5)}–{String(s.hora_fim).slice(0, 5)}
              {s.marcada_com_conflito ? " · ⚠ com conflito" : ""}
            </span>
            {souMestre && (
              <span style={{ display: "flex", gap: "0.5rem" }}>
                <button className="secundario" onClick={() => iniciarRemarcacao(s)}>Remarcar</button>
                <button className="secundario" onClick={() => excluirSessao(s)}>Excluir</button>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="cartao">
        <strong>Disponibilidade de todos os jogadores</strong>
        {todasDisponibilidades.length === 0 && (
          <p style={{ color: "var(--cor-texto-fraco)" }}>Ninguém marcou indisponibilidade ainda.</p>
        )}
        {todasDisponibilidades.map((d) => (
          <div key={d.id} style={{ padding: "0.35rem 0", borderTop: "1px solid #332f45" }}>
            {d.usuario_nome} — indisponível {DIAS[d.dia_semana]} {String(d.hora_inicio).slice(0, 5)}–{String(d.hora_fim).slice(0, 5)}
          </div>
        ))}
      </div>
    </Layout>
  );
}
