import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";

const SISTEMAS = [
  { valor: "dnd5e", rotulo: "D&D 5e" },
  { valor: "tormenta20", rotulo: "Tormenta20 Jogo do Ano" },
  { valor: "ordem_paranormal", rotulo: "Ordem Paranormal RPG" },
];

export function CriarCampanha() {
  const [nome, setNome] = useState("");
  const [sistema, setSistema] = useState(SISTEMAS[0].valor);
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setErro(null);
    try {
      const campanha = await api.post("/campanhas", {
        nome,
        sistema_rpg: sistema,
        descricao,
      });
      navigate(`/campanhas/${campanha.id}`);
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Layout>
      <div className="cartao" style={{ maxWidth: 480 }}>
        <h2>Nova Campanha</h2>
        <form onSubmit={enviar}>
          <label>Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />

          <label>Sistema de RPG</label>
          <select value={sistema} onChange={(e) => setSistema(e.target.value)}>
            {SISTEMAS.map((s) => (
              <option key={s.valor} value={s.valor}>{s.rotulo}</option>
            ))}
          </select>

          <label>Descrição (opcional)</label>
          <textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />

          {erro && <p style={{ color: "var(--cor-perigo)" }}>{erro}</p>}
          <button className="primario" type="submit">Criar campanha</button>
        </form>
      </div>
    </Layout>
  );
}
