import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";

export function HomeMestre() {
  const [campanhas, setCampanhas] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api
      .get("/campanhas")
      .then(setCampanhas)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const campanhasFiltradas = campanhas.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout>
      <h2>Minhas Campanhas</h2>
      <Link to="/mestre/campanhas/nova">
        <button className="primario" style={{ marginBottom: "1rem" }}>+ Nova Campanha</button>
      </Link>

      <input
        placeholder="Buscar campanha..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {carregando && <p>Carregando...</p>}
      {erro && <p style={{ color: "var(--cor-perigo)" }}>{erro}</p>}

      {campanhasFiltradas.map((c) => (
        <Link key={c.id} to={`/campanhas/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div className="cartao">
            <strong>{c.nome}</strong>
            <p style={{ color: "var(--cor-texto-fraco)", margin: "0.25rem 0 0" }}>
              Sistema: {c.sistema_rpg} {c.sou_mestre ? "· você é o mestre" : ""}
            </p>
          </div>
        </Link>
      ))}

      {!carregando && campanhasFiltradas.length === 0 && (
        <p style={{ color: "var(--cor-texto-fraco)" }}>Nenhuma campanha ainda.</p>
      )}
    </Layout>
  );
}
