import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Layout } from "../components/Layout";

export function SelecaoPerfil() {
  const { escolherPerfil } = useAuth();
  const navigate = useNavigate();

  function escolher(perfil) {
    escolherPerfil(perfil);
    navigate(perfil === "mestre" ? "/mestre" : "/jogador");
  }

  return (
    <Layout>
      <div className="cartao" style={{ textAlign: "center", maxWidth: 360, margin: "2rem auto" }}>
        <h2>Como você quer entrar?</h2>
        <p style={{ color: "var(--cor-texto-fraco)" }}>
          Você pode ser mestre em uma campanha e jogador em outra — escolha o contexto agora.
        </p>
        <div className="grade-opcoes" style={{ justifyContent: "center", marginTop: "1rem" }}>
          <button className="primario" onClick={() => escolher("mestre")}>🎲 Mestre</button>
          <button className="primario" onClick={() => escolher("jogador")}>🧙 Jogador</button>
        </div>
      </div>
    </Layout>
  );
}
