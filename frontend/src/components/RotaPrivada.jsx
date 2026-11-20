import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export function RotaPrivada({ children, exigePerfil = false }) {
  const { usuario, carregando, perfil } = useAuth();

  if (carregando) return <p>Carregando...</p>;
  if (!usuario) return <Navigate to="/login" replace />;

  // Se a pessoa abriu um link de convite antes de fazer login, retoma o convite agora
  const convite = localStorage.getItem("notrpg_convite");
  if (convite) return <Navigate to={`/entrar/${convite}`} replace />;

  if (exigePerfil && !perfil) return <Navigate to="/perfil" replace />;

  return children;
}
