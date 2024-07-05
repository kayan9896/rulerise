import { useState, useContext, createContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  
  const register = async (email, password) => {
    try {
      const response = await axios.post('https://super-orbit-wjx6p66wg7w3grgr-5000.app.github.dev/register', { email, password });
      if (response.data.token) {
        const userSession = email ; 
        localStorage.setItem('user', JSON.stringify(userSession));
        setUser(userSession);
        
        return response.data.token;
      } else {
        setError('Failed to register user');
      }
    } catch (error) {
      console.error(error);
      setError('Failed to register user');
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://super-orbit-wjx6p66wg7w3grgr-5000.app.github.dev/login', { email, password });
      if (response.data.token) {
        const userSession = email ; 
        localStorage.setItem('user', JSON.stringify(userSession));
        setUser(userSession)
        return response.data.token
      } else {
        setError('Failed to login user');
      }
    } catch (error) {
      console.error(error);
      setError('Failed to login user');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};