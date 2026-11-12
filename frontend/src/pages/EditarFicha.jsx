import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";

export function EditarFicha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [personagem, setPersonagem] = useState(null);
  const [nome, setNome] = useState("");
  const [classe, setClasse] = useState("");
  const [nivel, setNivel] = useState(1);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api.get(`/personagens/${id}`).then((p) => {
      setPersonagem(p);
      setNome(p.nome);
      setClasse(p.ficha?.classe || "");
      setNivel(p.ficha?.nivel || 1);
    }).catch((e) => setErro(e.message));
  }, [id]);

  async function salvar(e) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      const atualizado = await api.put(`/personagens/${id}`, {
        nome,
        ficha: { ...personagem.ficha, classe, nivel: Number(nivel) },
      });
      setPersonagem(atualizado);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!confirm("Excluir este personagem? Essa ação não pode ser desfeita.")) return;
    await api.del(`/personagens/${id}`);
    navigate("/jogador");
  }

  if (!personagem) return <Layout><p>{erro || "Carregando..."}</p></Layout>;

  return (
    <Layout>
      <div className="cartao" style={{ maxWidth: 480 }}>
        <h2>Editar Ficha</h2>
        <p style={{ color: "var(--cor-texto-fraco)" }}>Sistema: {personagem.sistema_rpg}</p>
        <form onSubmit={salvar}>
          <label>Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />

          <label>Classe</label>
          <input value={classe} onChange={(e) => setClasse(e.target.value)} />

          <label>Nível</label>
          <input type="number" min={1} value={nivel} onChange={(e) => setNivel(e.target.value)} />

          {erro && <p style={{ color: "var(--cor-perigo)" }}>{erro}</p>}

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="primario" type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" className="secundario" onClick={excluir}>Excluir</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
