import { createContext, useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const initialize = () => {
      if (!token) {
        setUser(null);
        setAuthReady(true);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (error) {
        console.error('Invalid token');
        logout();
      } finally {
        setAuthReady(true);
      }
    };

    initialize();
  }, [token]);

  const login = (token) => {
    localStorage.setItem('token', token);
    setToken(token);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (error) {
      console.error('Invalid token');
      setUser(null);
    }

    setAuthReady(true);
  };

  const logout = () => {
    signOut(auth).catch((error) => {
      console.error('Firebase logout error:', error);
    });
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthReady(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
