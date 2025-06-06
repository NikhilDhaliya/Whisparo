/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import PostList from '../components/home/PostList';
import axios from 'axios';
import { FaSyncAlt, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import CommentList from '../components/comments/CommentList';
import { useCache } from '../context/CacheContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import config from '../config';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const containerRef = useRef(null);
  const { getCacheData, setCacheData } = useCache();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = async (showToast = false) => {
    try {
      setLoading(true);
      // Check cache first
      const cachedPosts = getCacheData('home_posts');
      if (cachedPosts && !location.state?.refresh && !showToast) {
        setPosts(cachedPosts);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.API_URL}/api/posts`);
      // Sort posts by creation date, newest first
      const sortedPosts = response.data.posts.map(post => ({
        ...post,
        username: post.authorEmail === authUser?.email ? authUser?.username : (post.newUsername || post.authorUsername || 'Anonymous')
      })).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sortedPosts);
      // Cache the posts
      setCacheData('home_posts', sortedPosts);
      setError(null);
      if (showToast) {
        toast.success('Posts refreshed');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts.');
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Clear the refresh state after handling it
    if (location.state?.refresh) {
      window.history.replaceState({}, document.title);
    }
  }, [refreshTrigger, location.state?.refresh, authUser]);

  const handleRefresh = async () => {
    if (loading || isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      await fetchPosts(true);
    } catch (error) {
      console.error('Error refreshing posts:', error);
      toast.error('Failed to refresh posts');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(prevPosts => {
      const newPosts = prevPosts.filter(post => post.id !== deletedPostId);
      // Update cache
      setCacheData('home_posts', newPosts);
      return newPosts;
    });
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts => {
      const newPosts = prevPosts.map(post => 
        post.id === updatedPost._id ? { ...post, content: updatedPost.body } : post
      );
      // Update cache
      setCacheData('home_posts', newPosts);
      return newPosts;
    });
  };

  const handleCommentClick = (postId) => {
    setActiveCommentPost(postId);
  };

  const handleCommentClose = () => {
    setActiveCommentPost(null);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-2 sm:py-6 sm:px-4 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header with Refresh and Create Post */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-4 px-2 sm:px-0"
        >
          <h1 className="text-2xl font-bold text-gray-800">AnonBoard</h1>
          <div className="flex space-x-3">
            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full bg-blue-500 text-white shadow-md transition-all duration-200
                ${loading || isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              aria-label="Refresh Posts"
            >
              <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ duration: 0.5 }}>
                <FaSyncAlt className={isRefreshing ? 'animate-spin' : ''} />
              </motion.div>
            </motion.button>

            {/* Create Post Button */}
            <motion.button
              onClick={() => navigate('/create')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-green-500 text-white shadow-md hover:bg-green-600 transition-colors duration-200"
              aria-label="Create New Post"
            >
              <FaPlus />
            </motion.button>
          </div>
        </motion.div>

        {/* Loading Indicator for Pull to Refresh */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center items-center py-2"
            >
              <FaSpinner className="animate-spin text-xl text-blue-600" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {
          loading && !isRefreshing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center h-64"
            >
              <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-center text-xl py-8"
            >
              {error}
            </motion.div>
          ) : (
            <PostList posts={posts} />
          )
        }
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {activeCommentPost && (
          <div className="mt-4">
            <CommentList 
              postId={activeCommentPost} 
              isOpen={true}
              onClose={handleCommentClose}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;