import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export function Layout({ children }) {
  const { usuario, perfil, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" style={{ color: "white", fontWeight: 700, textDecoration: "none" }}>
          NotRPGpédia
        </Link>
        {usuario && (
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {perfil && <span style={{ color: "var(--cor-texto-fraco)" }}>{perfil}</span>}
            <button className="secundario" onClick={logout}>Sair</button>
          </div>
        )}
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
}
