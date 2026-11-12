import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export function RotaPrivada({ children, exigePerfil = false }) {
  const { usuario, carregando, perfil } = useAuth();

  if (carregando) return <p>Carregando...</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (exigePerfil && !perfil) return <Navigate to="/perfil" replace />;

  return children;
}
