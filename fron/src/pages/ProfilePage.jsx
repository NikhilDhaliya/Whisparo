import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSignOutAlt, FaUser, FaEnvelope, FaThumbsUp, FaComment, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import CommentList from '../components/comments/CommentList';
import { useCache } from '../context/CacheContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showComments, setShowComments] = useState(null);
  const { getCacheData, setCacheData, clearCache } = useCache();

  const fetchUserData = async (forceRefresh = false) => {
    try {
      // Check cache first
      const cachedData = getCacheData('userProfile');
      if (cachedData && !forceRefresh) {
        setUser(cachedData);
        return cachedData;
      }

      const response = await axios.get('/api/auth/check');
      setUser(response.data.user);
      setCacheData('userProfile', response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
      return null;
    }
  };

  const fetchUserPosts = async (forceRefresh = false) => {
    try {
      // Check cache first
      const cachedData = getCacheData('userPosts');
      if (cachedData && !forceRefresh) {
        setPosts(cachedData);
        return;
      }

      const response = await axios.get(`/api/posts?authorEmail=${encodeURIComponent(user.email)}`);
      setPosts(response.data.posts);
      setCacheData('userPosts', response.data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load posts');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const userData = await fetchUserData();
      if (userData) {
        await fetchUserPosts();
      }
      setLoading(false);
    };
    loadData();
  }, []); // Only run on mount

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await axios.post('/api/auth/logout');
      clearCache(); // Clear all cached data
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditContent(post.body);
  };

  const handleUpdate = async () => {
    if (!editingPost) return;

    try {
      const response = await axios.put(`/api/posts/${editingPost._id}`, {
        body: editContent
      });

      setPosts(posts.map(post => 
        post._id === editingPost._id ? { ...post, body: editContent } : post
      ));

      // Update cache
      setCacheData('userPosts', posts.map(post => 
        post._id === editingPost._id ? { ...post, body: editContent } : post
      ));

      setEditingPost(null);
      setEditContent('');
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      
      // Update cache
      setCacheData('userPosts', posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const toggleComments = (postId) => {
    setShowComments(showComments === postId ? null : postId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-red-500 bg-red-50 p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS-style Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{user?.name}</h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <div className="space-y-4">
          {posts.map(post => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              {editingPost?._id === post._id ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingPost(null)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-900 mb-4">{post.body}</p>
                  {post.image?.url && (
                    <div className="mb-4">
                      <img
                        src={post.image.url}
                        alt="Post attachment"
                        className="max-h-96 w-full object-contain rounded-xl"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500 text-sm">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                      <button
                        onClick={() => toggleComments(post._id)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        {post.comments?.length || 0} Comments
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Comments Section */}
              <AnimatePresence>
                {showComments === post._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-100"
                  >
                    <CommentList postId={post._id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
