import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CacheProvider } from './context/CacheContext';
import AppLayout from './components/layout/AppLayout';
import { Toaster } from 'react-hot-toast';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Signup = lazy(() => import('./pages/Signup'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const TrendingPage = lazy(() => import('./pages/TrendingPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <CacheProvider>
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
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            } />
            <Route path="/signup" element={
              <Suspense fallback={<PageLoader />}>
                <Signup />
              </Suspense>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={
                <Suspense fallback={<PageLoader />}>
                  <HomePage />
                </Suspense>
              } />
              <Route path="/create" element={
                <Suspense fallback={<PageLoader />}>
                  <CreatePost />
                </Suspense>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<PageLoader />}>
                  <ProfilePage />
                </Suspense>
              } />
              <Route path="/trending" element={
                <Suspense fallback={<PageLoader />}>
                  <TrendingPage />
                </Suspense>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </CacheProvider>
    </AuthProvider>
  )
}

export default App