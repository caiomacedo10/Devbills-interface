import { signOut as firebaseSignOut, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { firebaseAuth, googleAuthProvider } from "../config/firebase";
import type { AuthState } from "../types/auth";

interface AuthContextProps {
  authState: AuthState;
  signWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (user) => {
        if (user) {
          // ✅ força atualização do token
          const token = await user.getIdToken(true);
          localStorage.setItem("token", token);

          console.log("🔐 Usuário autenticado:", user); // 👈 aparece como na imagem

          setAuthState({
            user: {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            },
            error: null,
            loading: false,
          });

          // ✅ Atualiza token automaticamente a cada 50 min
          const intervalId = setInterval(
            async () => {
              const refreshedToken = await user.getIdToken(true);
              localStorage.setItem("token", refreshedToken);
              console.log("🔁 Token atualizado automaticamente");
            },
            50 * 60 * 1000,
          ); // 50 minutos

          return () => clearInterval(intervalId); // limpa intervalo ao desmontar
        } else {
          localStorage.removeItem("token");
          setAuthState({
            user: null,
            error: null,
            loading: false,
          });
        }
      },
      (error) => {
        console.error("❌ Erro na autenticação:", error);
        setAuthState({ user: null, error: error.message, loading: false });
      },
    );

    return () => unsubscribe();
  }, []);

  const signWithGoogle = async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
      const user = result.user;

      const token = await user.getIdToken(true);
      localStorage.setItem("token", token);

      console.log("🔓 Login com Google:", user); // 👈 aparece como na imagem

      setAuthState({
        user: {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        },
        error: null,
        loading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao tentar logar";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  };

  const signOut = async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      await firebaseSignOut(firebaseAuth);
      localStorage.removeItem("token");
      setAuthState({
        user: null,
        error: null,
        loading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao tentar deslogar";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ authState, signWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
