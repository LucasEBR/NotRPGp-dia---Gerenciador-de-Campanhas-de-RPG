import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { Layout } from "../components/Layout";

const CHAVE_CONVITE = "notrpg_convite";

// Rota pública /entrar/:token — é para onde o link do convite (e o QR Code) levam.
export function EntrarCampanha() {
  const { token } = useParams();
  const { usuario, carregando, perfil, escolherPerfil } = useAuth();
  const navigate = useNavigate();
  const [erro, setErro] = useState(null);
  const jaTentou = useRef(false);

  useEffect(() => {
    if (carregando) return;

    // 1) Sem login: guarda o convite e manda para o login.
    //    Depois de entrar, o app retoma o convite sozinho (veja RotaPrivada).
    if (!usuario) {
      localStorage.setItem(CHAVE_CONVITE, token);
      navigate("/login", { replace: true });
      return;
    }

    // 2) Com login: entra na campanha.
    if (jaTentou.current) return;
    jaTentou.current = true;

    api
      .post("/campanhas/entrar", { token })
      .then((campanha) => {
        localStorage.removeItem(CHAVE_CONVITE);
        if (!perfil) escolherPerfil("jogador"); // quem entra por convite é jogador
        navigate(`/campanhas/${campanha.id}`, { replace: true });
      })
      .catch((e) => {
        localStorage.removeItem(CHAVE_CONVITE);
        setErro(e.message);
      });
  }, [carregando, usuario, token]);

  return (
    <Layout>
      <div className="cartao" style={{ maxWidth: 420, margin: "2rem auto", textAlign: "center" }}>
        {erro ? (
          <>
            <h2>Não foi possível entrar</h2>
            <p style={{ color: "var(--cor-perigo)" }}>{erro}</p>
            <Link to="/">
              <button className="secundario">Ir para o início</button>
            </Link>
          </>
        ) : (
          <>
            <h2>Entrando na campanha...</h2>
            <p style={{ color: "var(--cor-texto-fraco)" }}>Aguarde um instante.</p>
          </>
        )}
      </div>
    </Layout>
  );
}
