/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure axios defaults
  axios.defaults.withCredentials = true; // Enable sending cookies with requests
  axios.defaults.baseURL = config.API_URL; // Set base URL for all requests

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set the token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Check if we have a valid cached user
          const cachedUser = localStorage.getItem('cachedUser');
          if (cachedUser) {
            const { user, timestamp } = JSON.parse(cachedUser);
            // Only use cache if it's less than 30 minutes old
            if (Date.now() - timestamp < 30 * 60 * 1000) {
              if (mounted) {
                setUser(user);
                setIsAuthenticated(true);
                setLoading(false);
              }
              return;
            }
          }
          
          // If no valid cache, verify token and get user data
          const response = await axios.get('/auth/check');
          if (mounted) {
            setUser(response.data.user);
            setIsAuthenticated(true);
            
            // Cache the user data
            localStorage.setItem('cachedUser', JSON.stringify({
              user: response.data.user,
              timestamp: Date.now()
            }));
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          if (mounted) {
            // If token is invalid, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('cachedUser');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      } else {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store token and set axios header
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Cache the user data
      localStorage.setItem('cachedUser', JSON.stringify({
        user,
        timestamp: Date.now()
      }));
      
      setUser(user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please try again.';
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      // Store token and set axios header
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear everything regardless of backend response
      localStorage.removeItem('token');
      localStorage.removeItem('cachedUser');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
