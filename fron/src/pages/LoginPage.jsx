/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import IOSButton from '../components/common/IOSButton';
import IOSCard from '../components/common/IOSCard';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ios-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <IOSCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ios-gray-900 mb-2">Welcome Back</h1>
            <p className="text-ios-gray-600">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ios-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-ios border border-ios-gray-300 focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ios-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-ios border border-ios-gray-300 focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </div>

            <IOSButton
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Sign In
            </IOSButton>

            <div className="text-center">
              <p className="text-ios-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-ios-blue hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </IOSCard>
      </motion.div>
    </div>
  );
};

export default LoginPage;