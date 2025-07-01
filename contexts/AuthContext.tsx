import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
// import { useNavigate } from 'react-router-dom'; // Removed

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => void; // Parâmetros opcionais para simulação
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Para verificar o estado inicial do localStorage
  // const navigate = useNavigate(); // Removed: Called outside Router context

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem("isAuthenticated");
      if (storedAuth === "true") {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      // Handle error, e.g. by assuming not authenticated
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (email?: string, password?: string) => {
      try {
        localStorage.setItem("isAuthenticated", "true");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to set isAuthenticated in localStorage:", error);
      }
      // Navigation will be handled by the component calling login
      // navigate('/home', { replace: true }); // Removed
    },
    [
      /* Removed navigate from dependencies */
    ]
  );

  const logout = useCallback(
    () => {
      try {
        localStorage.removeItem("isAuthenticated");
        setIsAuthenticated(false);
      } catch (error) {
        console.error(
          "Failed to remove isAuthenticated from localStorage:",
          error
        );
      }
      // Navigation will be handled by the component calling logout
      // navigate('/login', { replace: true }); // Removed
    },
    [
      /* Removed navigate from dependencies */
    ]
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
