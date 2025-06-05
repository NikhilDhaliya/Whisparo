/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import PostList from '../components/home/PostList';
import axios from 'axios';
import { FaSyncAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import CommentList from '../components/comments/CommentList';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
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
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-full transition-colors ${
              loading || isRefreshing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaSyncAlt className={`${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        <div ref={containerRef} className="space-y-4">
          <AnimatePresence mode="wait">
            {loading && posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-center py-4 bg-red-50 rounded-xl"
              >
                {error}
              </motion.div>
            ) : (
              <PostList
                posts={posts}
                currentUserEmail={currentUserEmail}
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