import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";

const SISTEMAS = [
  { valor: "dnd5e", rotulo: "D&D 5e" },
  { valor: "tormenta20", rotulo: "Tormenta20 Jogo do Ano" },
  { valor: "ordem_paranormal", rotulo: "Ordem Paranormal RPG" },
];

export function CriarFicha() {
  const [params] = useSearchParams();
  const campanhaId = params.get("campanha_id");
  const [nome, setNome] = useState("");
  const [sistema, setSistema] = useState(SISTEMAS[0].valor);
  const [classe, setClasse] = useState("");
  const [nivel, setNivel] = useState(1);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setErro(null);
    if (!campanhaId) return setErro("Acesse esta tela a partir de uma campanha.");
    try {
      const personagem = await api.post("/personagens", {
        campanha_id: campanhaId,
        nome,
        sistema_rpg: sistema,
        ficha: { classe, nivel: Number(nivel) },
      });
      navigate(`/personagens/${personagem.id}`);
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Layout>
      <div className="cartao" style={{ maxWidth: 480 }}>
        <h2>Criar Ficha de Personagem</h2>
        <form onSubmit={enviar}>
          <label>Nome do personagem</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />

          <label>Sistema de RPG</label>
          <select value={sistema} onChange={(e) => setSistema(e.target.value)}>
            {SISTEMAS.map((s) => (
              <option key={s.valor} value={s.valor}>{s.rotulo}</option>
            ))}
          </select>

          <label>Classe</label>
          <input value={classe} onChange={(e) => setClasse(e.target.value)} />

          <label>Nível</label>
          <input type="number" min={1} value={nivel} onChange={(e) => setNivel(e.target.value)} />

          {erro && <p style={{ color: "var(--cor-perigo)" }}>{erro}</p>}
          <button className="primario" type="submit">Criar personagem</button>
        </form>
      </div>
    </Layout>
  );
}
