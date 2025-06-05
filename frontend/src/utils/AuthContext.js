import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Optionally, verify token with backend or fetch user details
        // For now, we'll assume token presence means authenticated
        // In a real app, you'd likely call authService.getUser() or similar
        setUser({ email: 'authenticated_user' }); // Placeholder user
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      // In a real app, response might include user details
      setUser({ email: credentials.email }); // Use email as placeholder
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Logout failed:', error);
      // Even if backend logout fails, clear client-side state
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
