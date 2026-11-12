import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState(
    () => sessionStorage.getItem("notrpg_perfil") || null
  ); // "mestre" | "jogador" — escolhido na tela de Seleção de Perfil

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  function escolherPerfil(novoPerfil) {
    sessionStorage.setItem("notrpg_perfil", novoPerfil);
    setPerfil(novoPerfil);
  }

  async function logout() {
    await supabase.auth.signOut();
    sessionStorage.removeItem("notrpg_perfil");
    setPerfil(null);
  }

  return (
    <AuthContext.Provider
      value={{ session, usuario: session?.user ?? null, carregando, perfil, escolherPerfil, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
