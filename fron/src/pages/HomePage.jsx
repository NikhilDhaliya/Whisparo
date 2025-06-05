/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import PostList from '../components/home/PostList';
import axios from 'axios';
import { FaSyncAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/posts');
      const shuffledPosts = response.data.posts.sort(() => Math.random() - 0.5);
      setPosts(shuffledPosts);
      setError(null);
    } catch {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/check');
      setCurrentUserEmail(response.data.user.email);
    } catch {
      setCurrentUserEmail(null);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchPosts();
  }, [refreshTrigger]);

  const handleRefresh = async () => {
    if (loading || isRefreshing) return;
    
    setIsRefreshing(true);
    await fetchPosts();
    setIsRefreshing(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === updatedPost._id ? { ...post, content: updatedPost.body } : post
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS-style Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Whisparo</h1>
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 ${
                (loading || isRefreshing) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading || isRefreshing}
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
              >
                <FaSyncAlt />
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6" ref={containerRef}>
        <AnimatePresence mode="wait">
          {loading && !isRefreshing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-8"
            >
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="text-red-500 bg-red-50 p-4 rounded-xl">
                {error}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PostList 
                posts={posts} 
                currentUserEmail={currentUserEmail} 
                onPostDeleted={handlePostDeleted} 
                onPostUpdated={handlePostUpdated} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HomePage;