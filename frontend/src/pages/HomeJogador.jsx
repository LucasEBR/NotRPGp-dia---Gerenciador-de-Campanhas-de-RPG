import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";

export function HomeJogador() {
  const [personagens, setPersonagens] = useState([]);
  const [tokenEntrar, setTokenEntrar] = useState("");
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  function carregar() {
    api
      .get("/personagens")
      .then((r) => setPersonagens(r.dados))
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  async function entrarNaCampanha(e) {
    e.preventDefault();
    setErro(null);
    try {
      const campanha = await api.post("/campanhas/entrar", { token: tokenEntrar });
      setTokenEntrar("");
      window.location.href = `/campanhas/${campanha.id}`;
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Layout>
      <h2>Meus Personagens</h2>

      <form onSubmit={entrarNaCampanha} className="cartao">
        <label>Entrar em campanha pelo código do QR Code</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            placeholder="Cole o token do QR Code"
            value={tokenEntrar}
            onChange={(e) => setTokenEntrar(e.target.value)}
          />
          <button className="primario" type="submit">Entrar</button>
        </div>
      </form>

      {erro && <p style={{ color: "var(--cor-perigo)" }}>{erro}</p>}
      {carregando && <p>Carregando...</p>}

      {personagens.map((p) => (
        <Link key={p.id} to={`/personagens/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div className="cartao">
            <strong>{p.nome}</strong>
            <p style={{ color: "var(--cor-texto-fraco)", margin: "0.25rem 0 0" }}>
              Sistema: {p.sistema_rpg}
            </p>
          </div>
        </Link>
      ))}

      {!carregando && personagens.length === 0 && (
        <p style={{ color: "var(--cor-texto-fraco)" }}>Você ainda não tem personagens.</p>
      )}
    </Layout>
  );
}
