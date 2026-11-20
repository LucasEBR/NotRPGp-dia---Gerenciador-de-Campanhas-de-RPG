import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";

const TAM_PAGINA = 10;

export function HomeJogador() {
  const [personagens, setPersonagens] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [tokenEntrar, setTokenEntrar] = useState("");
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  function carregar(p = 1) {
    api
      .get(`/personagens?page=${p}&pageSize=${TAM_PAGINA}`)
      .then((r) => {
        setPersonagens(r.dados);
        setTotal(r.total);
        setPagina(p);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar(1);
  }, []);

  const totalPaginas = Math.max(Math.ceil(total / TAM_PAGINA), 1);

  async function entrarNaCampanha(e) {
    e.preventDefault();
    setErro(null);
    try {
      // aceita tanto o código puro quanto o link de convite inteiro (pega o trecho final)
      const token = tokenEntrar.trim().split("/").filter(Boolean).pop();
      const campanha = await api.post("/campanhas/entrar", { token });
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
        <label>Entrar em campanha pelo código ou link do convite</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            placeholder="Cole o link ou o código do convite"
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

      {total > TAM_PAGINA && (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button className="secundario" disabled={pagina <= 1} onClick={() => carregar(pagina - 1)}>
            Anterior
          </button>
          <span>Página {pagina} de {totalPaginas}</span>
          <button className="secundario" disabled={pagina >= totalPaginas} onClick={() => carregar(pagina + 1)}>
            Próxima
          </button>
        </div>
      )}
    </Layout>
  );
}
