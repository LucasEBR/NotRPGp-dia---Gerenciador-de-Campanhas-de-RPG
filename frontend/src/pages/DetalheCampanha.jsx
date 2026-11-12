import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";

export function DetalheCampanha() {
  const { id } = useParams();
  const [campanha, setCampanha] = useState(null);
  const [personagens, setPersonagens] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.get(`/campanhas/${id}`).then(setCampanha).catch((e) => setErro(e.message));
    recarregarPersonagens();
  }, [id]);

  function recarregarPersonagens() {
    api
      .get(`/campanhas/${id}/personagens${filtro ? `?nome=${encodeURIComponent(filtro)}` : ""}`)
      .then(setPersonagens)
      .catch((e) => setErro(e.message));
  }

  async function gerarNovoQrCode() {
    try {
      const resultado = await api.post(`/campanhas/${id}/qrcode`, {});
      setQrCode(resultado.qr_code_imagem);
    } catch (e) {
      setErro(e.message);
    }
  }

  if (!campanha) return <Layout><p>Carregando...</p></Layout>;

  return (
    <Layout>
      <h2>{campanha.nome}</h2>
      <p style={{ color: "var(--cor-texto-fraco)" }}>Sistema: {campanha.sistema_rpg}</p>
      {campanha.descricao && <p>{campanha.descricao}</p>}

      <div className="cartao">
        <strong>Acesso à campanha</strong>
        <p style={{ color: "var(--cor-texto-fraco)" }}>
          O QR Code expira em {new Date(campanha.qr_code_expira_em).toLocaleString("pt-BR")}.
        </p>
        <button className="secundario" onClick={gerarNovoQrCode}>Gerar novo QR Code</button>
        {qrCode && <img src={qrCode} alt="QR Code de acesso" style={{ marginTop: "0.5rem", width: 160 }} />}
      </div>

      <div className="cartao">
        <strong>Personagens na campanha</strong>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input placeholder="Filtrar por nome" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          <button className="secundario" onClick={recarregarPersonagens}>Filtrar</button>
        </div>
        {personagens.map((p) => (
          <div key={p.id} style={{ padding: "0.5rem 0", borderTop: "1px solid #332f45" }}>
            {p.nome} <span style={{ color: "var(--cor-texto-fraco)" }}>— {p.jogador_nome}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Link to={`/personagens/novo?campanha_id=${id}`}>
          <button className="primario">+ Criar ficha nesta campanha</button>
        </Link>
        <Link to={`/campanhas/${id}/calendario`}>
          <button className="secundario">Calendário de Disponibilidade / Conflito</button>
        </Link>
      </div>

      {erro && <p style={{ color: "var(--cor-perigo)" }}>{erro}</p>}
    </Layout>
  );
}
