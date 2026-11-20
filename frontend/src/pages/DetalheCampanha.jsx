import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { Layout } from "../components/Layout";

const TAM_PAGINA = 10;

export function DetalheCampanha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [campanha, setCampanha] = useState(null);
  const [personagens, setPersonagens] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.get(`/campanhas/${id}`).then(setCampanha).catch((e) => setErro(e.message));
    recarregarPersonagens(1);
  }, [id]);

  // busca a página p da lista de personagens, aplicando o filtro de nome atual
  function recarregarPersonagens(p = 1) {
    api
      .get(
        `/campanhas/${id}/personagens?nome=${encodeURIComponent(filtro)}&page=${p}&pageSize=${TAM_PAGINA}`
      )
      .then((r) => {
        setPersonagens(r.dados);
        setTotal(r.total);
        setPagina(p);
      })
      .catch((e) => setErro(e.message));
  }

  async function gerarNovoQrCode() {
    try {
      // devolve a campanha com token, link e QR Code novos
      const resultado = await api.post(`/campanhas/${id}/qrcode`, {});
      setCampanha((c) => ({ ...c, ...resultado }));
      setCopiado(false);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(campanha.link_entrada);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  }

  async function excluirCampanha() {
    if (!confirm("Excluir esta campanha? Personagens e sessões dela também serão apagados.")) return;
    try {
      await api.del(`/campanhas/${id}`);
      navigate("/mestre");
    } catch (e) {
      setErro(e.message);
    }
  }

  if (!campanha) return <Layout><p>{erro || "Carregando..."}</p></Layout>;

  const souMestre = campanha.mestre_id === usuario?.id;
  const totalPaginas = Math.max(Math.ceil(total / TAM_PAGINA), 1);

  return (
    <Layout>
      <h2>{campanha.nome}</h2>
      <p style={{ color: "var(--cor-texto-fraco)" }}>Sistema: {campanha.sistema_rpg}</p>
      {campanha.descricao && <p>{campanha.descricao}</p>}

      {souMestre && (
        <div className="cartao">
          <strong>Acesso à campanha</strong>
          <p style={{ color: "var(--cor-texto-fraco)" }}>
            O convite expira em {new Date(campanha.qr_code_expira_em).toLocaleString("pt-BR")}.
          </p>

          {campanha.qr_code_imagem && (
            <img
              src={campanha.qr_code_imagem}
              alt="QR Code de acesso"
              style={{ display: "block", width: 160, marginBottom: "0.75rem" }}
            />
          )}

          {campanha.link_entrada && (
            <>
              <label>Link de convite (para quem está no computador)</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  readOnly
                  value={campanha.link_entrada}
                  onFocus={(e) => e.target.select()}
                />
                <button className="secundario" onClick={copiarLink}>
                  {copiado ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </>
          )}

          <button className="secundario" style={{ marginTop: "0.75rem" }} onClick={gerarNovoQrCode}>
            Gerar novo QR Code e link
          </button>
        </div>
      )}

      <div className="cartao">
        <strong>Personagens na campanha</strong>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input placeholder="Filtrar por nome" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          <button className="secundario" onClick={() => recarregarPersonagens(1)}>Filtrar</button>
        </div>

        {personagens.map((p) => (
          <div key={p.id} style={{ padding: "0.5rem 0", borderTop: "1px solid #332f45" }}>
            {p.nome} <span style={{ color: "var(--cor-texto-fraco)" }}>— {p.jogador_nome}</span>
          </div>
        ))}
        {personagens.length === 0 && (
          <p style={{ color: "var(--cor-texto-fraco)" }}>Nenhum personagem encontrado.</p>
        )}

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.75rem" }}>
          <button
            className="secundario"
            disabled={pagina <= 1}
            onClick={() => recarregarPersonagens(pagina - 1)}
          >
            Anterior
          </button>
          <span>Página {pagina} de {totalPaginas}</span>
          <button
            className="secundario"
            disabled={pagina >= totalPaginas}
            onClick={() => recarregarPersonagens(pagina + 1)}
          >
            Próxima
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Link to={`/personagens/novo?campanha_id=${id}`}>
          <button className="primario">+ Criar ficha nesta campanha</button>
        </Link>
        <Link to={`/campanhas/${id}/calendario`}>
          <button className="secundario">Calendário de Disponibilidade / Conflito</button>
        </Link>
        {souMestre && (
          <>
            <Link to={`/campanhas/${id}/editar`}>
              <button className="secundario">Editar campanha</button>
            </Link>
            <button className="secundario" onClick={excluirCampanha}>Excluir campanha</button>
          </>
        )}
      </div>

      {erro && <p style={{ color: "var(--cor-perigo)" }}>{erro}</p>}
    </Layout>
  );
}
