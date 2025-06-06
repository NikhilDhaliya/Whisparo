/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import PostList from '../components/home/PostList';
import axios from 'axios';
import { FaSyncAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import CommentList from '../components/comments/CommentList';
import { useCache } from '../context/CacheContext';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import config from '../config';
import Categories from '../components/home/Categories';
import CreatePost from '../components/create/CreatePost';
import { FaPlus, FaSpinner } from 'react-icons/fa';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const containerRef = useRef(null);
  const { getCacheData, setCacheData } = useCache();
  const location = useLocation();
  const { user: authUser } = useAuth();

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
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-2 sm:py-6 sm:px-4 lg:px-6"
    >
      {/* Loading and Error States */}
      <AnimatePresence>
        {loading && !isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8"
          >
            <FaSpinner className="animate-spin text-2xl text-blue-600" />
          </motion.div>
        )}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-red-500 text-sm py-8 px-4"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-gray-600 text-xs mb-2"
          >
            <FaSyncAlt className="inline-block animate-spin mr-1" />
            Refreshing...
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto space-y-4">
        {/* Actions: Create Post and Refresh */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center space-x-2 mb-4"
        >
          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md shadow hover:shadow-sm transition-all duration-200 text-xs"
          >
            <FaPlus className="text-xs" />
            <span>Create Post</span>
          </motion.button>
          <motion.button
            onClick={handleRefresh}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow hover:shadow-sm transition-all duration-200 text-xs ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <FaSpinner className="animate-spin text-xs" />
            ) : (
              <>
                <FaSyncAlt className="text-xs" />
                <span>Refresh</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Categories />
        </motion.div>

        {/* Posts List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {!loading && !error && posts.length > 0 && (
            <PostList
              posts={posts}
              currentUserEmail={authUser?.email}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
              onCommentClick={handleCommentClick}
            />
          )}
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {!loading && !error && posts.length === 0 && !isRefreshing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 px-4"
            >
              <p className="text-sm text-gray-500 mb-3">No posts found. Be the first to share!</p>
              <motion.button
                onClick={() => setIsCreateModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-sm transition-all duration-200 text-xs"
              >
                Create a Post
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-lg overflow-hidden w-full max-w-sm"
            >
              <CreatePost onClose={() => setIsCreateModalOpen(false)} onPostCreated={handlePostUpdated} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {activeCommentPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 100, damping: 25 }}
              className="bg-white rounded-t-lg overflow-hidden w-full max-w-sm h-full max-h-[80vh] flex flex-col"
            >
              <CommentList postId={activeCommentPost._id} isOpen={true} onClose={handleCommentClose} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;