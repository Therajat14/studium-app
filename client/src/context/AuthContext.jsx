import { createContext, useState, useEffect } from "react";
import { loginApi, signupApi, meApi } from "../api/auth";
import { getToken, setToken, clearToken } from "../utils/storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const data = await meApi();
          setUser(data);
        } catch (err) {
          clearToken();
        }
      }
    };
    initUser();
  }, []);

  const login = async (email, password) => {
    const { token } = await loginApi(email, password);
    setToken(token);
    const data = await meApi();
    setUser(data);
  };

  const signup = async (email, password) => {
    const { token } = await signupApi(email, password);
    setToken(token);
    const data = await meApi();
    setUser(data);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
