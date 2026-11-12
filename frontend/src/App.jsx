import { Routes, Route, Navigate } from "react-router-dom";
import { RotaPrivada } from "./components/RotaPrivada";
import { Login } from "./pages/Login";
import { SelecaoPerfil } from "./pages/SelecaoPerfil";
import { HomeMestre } from "./pages/HomeMestre";
import { HomeJogador } from "./pages/HomeJogador";
import { CriarCampanha } from "./pages/CriarCampanha";
import { DetalheCampanha } from "./pages/DetalheCampanha";
import { CriarFicha } from "./pages/CriarFicha";
import { EditarFicha } from "./pages/EditarFicha";
import { CalendarioConflito } from "./pages/CalendarioConflito";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/perfil" element={<RotaPrivada><SelecaoPerfil /></RotaPrivada>} />

      <Route path="/mestre" element={<RotaPrivada exigePerfil><HomeMestre /></RotaPrivada>} />
      <Route path="/mestre/campanhas/nova" element={<RotaPrivada exigePerfil><CriarCampanha /></RotaPrivada>} />

      <Route path="/jogador" element={<RotaPrivada exigePerfil><HomeJogador /></RotaPrivada>} />
      <Route path="/personagens/novo" element={<RotaPrivada exigePerfil><CriarFicha /></RotaPrivada>} />
      <Route path="/personagens/:id" element={<RotaPrivada exigePerfil><EditarFicha /></RotaPrivada>} />

      <Route path="/campanhas/:id" element={<RotaPrivada exigePerfil><DetalheCampanha /></RotaPrivada>} />
      <Route path="/campanhas/:id/calendario" element={<RotaPrivada exigePerfil><CalendarioConflito /></RotaPrivada>} />

      <Route path="/" element={<Navigate to="/perfil" replace />} />
      <Route path="*" element={<Navigate to="/perfil" replace />} />
    </Routes>
  );
}
