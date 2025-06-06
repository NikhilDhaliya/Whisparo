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
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { value: 'All', label: 'All Categories' },
    { value: 'General', label: 'General Discussion' },
    { value: 'Question', label: 'Question' },
    { value: 'Discussion', label: 'Discussion' },
    { value: 'News', label: 'News' },
    { value: 'Tech', label: 'Technology' },
    { value: 'Fun', label: 'Fun & Entertainment' }
  ];

  const fetchPosts = async (showToast = false) => {
    try {
      setLoading(true);
      const cacheKey = `home_posts_${selectedCategory}`;
      const cachedPosts = getCacheData(cacheKey);
      if (cachedPosts && !location.state?.refresh && !showToast) {
        setPosts(cachedPosts);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.API_URL}/api/posts`, {
        params: {
          category: selectedCategory === 'All' ? undefined : selectedCategory,
        },
      });
      const sortedPosts = response.data.posts.map(post => ({
        ...post,
        username: post.authorEmail === authUser?.email ? authUser?.username : (post.newUsername || post.authorUsername || 'Anonymous')
      })).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sortedPosts);
      setCacheData(cacheKey, sortedPosts);
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
    if (location.state?.refresh) {
      window.history.replaceState({}, document.title);
    }
  }, [refreshTrigger, location.state?.refresh, authUser, selectedCategory]);

  const handleRefresh = async () => {
    if (loading || isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setCacheData(`home_posts_${selectedCategory}`, null);
      await fetchPosts(true);
    } catch (error) {
      console.error('Error refreshing posts:', error);
      toast.error('Failed to refresh posts');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setCacheData(`home_posts_${newCategory}`, null);
    fetchPosts();
    toast.loading(`Fetching ${newCategory === 'All' ? 'all' : newCategory} posts...`);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(prevPosts => {
      const newPosts = prevPosts.filter(post => post.id !== deletedPostId);
      setCacheData(`home_posts_${selectedCategory}`, newPosts);
      return newPosts;
    });
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts => {
      const newPosts = prevPosts.map(post => 
        post.id === updatedPost._id ? { ...post, content: updatedPost.body } : post
      );
      setCacheData(`home_posts_${selectedCategory}`, newPosts);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Home</h1>
          <motion.button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              loading || isRefreshing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
            }`}
          >
            <FaSyncAlt className={`${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        <div className="mb-4">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            id="category-filter"
            name="category-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div ref={containerRef} className="space-y-4">
          <AnimatePresence mode="wait">
            {loading && posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-center py-8 bg-red-50 rounded-xl"
              >
                {error}
              </motion.div>
            ) : posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 bg-white rounded-xl shadow-sm"
              >
                <p className="text-gray-500 mb-4">No posts yet. Be the first to share!</p>
              </motion.div>
            ) : (
              <PostList
                posts={posts}
                currentUserEmail={authUser?.email}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
                onCommentClick={handleCommentClick}
              />
            )}
          </AnimatePresence>
        </div>
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