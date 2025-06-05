import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreatePost from './pages/CreatePost';
import ProfilePage from './pages/ProfilePage';
import TrendingPage from './pages/TrendingPage';
import { Toaster } from 'react-hot-toast';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '4px',
              maxWidth: '300px',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<HomePage />} />
            <Route path="/create" element={<CreatePost/>} />
            <Route path="/profile" element={<ProfilePage/>} />
            <Route path="/trending" element={<TrendingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App