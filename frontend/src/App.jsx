import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePostPage from './pages/CreatePostPage';
import TrendingPage from './pages/TrendingPage';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Placeholder component for Profile
const ProfilePage = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-112px)] text-threads-gray-700 dark:text-threads-gray-300">
      <h2 className="text-2xl font-semibold">Profile Page (Coming Soon)</h2>
    </div>
  );
};

// Layout component that includes the Navbar and BottomNav
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-threads-white dark:bg-threads-black text-threads-gray-900 dark:text-threads-white pb-14"> {/* Add padding-bottom for fixed bottom nav */}
      <Navbar />
      <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Protected Routes with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <Layout>
              <CreatePostPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trending"
        element={
          <ProtectedRoute>
            <Layout>
              <TrendingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;