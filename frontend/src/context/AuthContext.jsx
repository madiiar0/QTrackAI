import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const checkAuth = useCallback(async () => {
    setInitializing(true);
    try {
      const { data } = await api.get('/check-auth');
      setUser(data.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signup = async (payload) => {
    const { data } = await api.post('/signup', payload);
    setUser(data.user || null);
    return data;
  };

  const verifyEmail = async (payload) => {
    const { data } = await api.post('/verify-email', payload);
    setUser(data.user || null);
    return data;
  };

  const login = async (payload) => {
    const { data } = await api.post('/login', payload);
    setUser(data.user || null);
    return data;
  };

  const logout = async () => {
    await api.post('/logout');
    setUser(null);
  };

  const forgotPassword = async (payload) => {
    const { data } = await api.post('/forgot-password', payload);
    return data;
  };

  const resetPassword = async (token, payload) => {
    const { data } = await api.post(`/reset-password/${token}`, payload);
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      isVerified: Boolean(user?.isVerified),
      initializing,
      checkAuth,
      signup,
      verifyEmail,
      login,
      logout,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
