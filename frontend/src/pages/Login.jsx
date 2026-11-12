import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Layout } from "../components/Layout";

export function Login() {
  const [modo, setModo] = useState("entrar"); // "entrar" | "cadastrar"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    const acao =
      modo === "entrar"
        ? supabase.auth.signInWithPassword({ email, password: senha })
        : supabase.auth.signUp({ email, password: senha });

    const { error } = await acao;
    if (error) return setErro(error.message);
    navigate("/perfil");
  }

  async function entrarComGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  async function recuperarSenha() {
    if (!email) return setErro("Informe seu e-mail para recuperar a senha.");
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return setErro(error.message);
    setMensagem("Enviamos um link de recuperação para o seu e-mail.");
  }

  return (
    <Layout>
      <div className="cartao" style={{ maxWidth: 360, margin: "2rem auto" }}>
        <h2>{modo === "entrar" ? "Entrar" : "Criar conta"}</h2>
        <form onSubmit={enviar}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
          />
          {erro && <p style={{ color: "var(--cor-perigo)" }}>{erro}</p>}
          {mensagem && <p style={{ color: "var(--cor-sucesso)" }}>{mensagem}</p>}
          <button type="submit" className="primario" style={{ width: "100%" }}>
            {modo === "entrar" ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <button className="secundario" style={{ width: "100%", marginTop: "0.5rem" }} onClick={entrarComGoogle}>
          Entrar com Google
        </button>

        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between" }}>
          <button className="secundario" onClick={() => setModo(modo === "entrar" ? "cadastrar" : "entrar")}>
            {modo === "entrar" ? "Criar conta" : "Já tenho conta"}
          </button>
          <button className="secundario" onClick={recuperarSenha}>Esqueci a senha</button>
        </div>
      </div>
    </Layout>
  );
}
