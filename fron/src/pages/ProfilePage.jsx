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
  const { getCache, setCache, clearCache } = useCache();

  const fetchUserData = async (forceRefresh = false) => {
    try {
      // Check cache first
      const cachedData = getCache('userProfile');
      if (cachedData && !forceRefresh) {
        setUser(cachedData);
        return cachedData;
      }

      const response = await axios.get('/api/auth/check');
      setUser(response.data.user);
      setCache('userProfile', response.data.user, 5 * 60 * 1000); // Cache for 5 minutes
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
      const cachedData = getCache('userPosts');
      if (cachedData && !forceRefresh) {
        setPosts(cachedData);
        return;
      }

      const response = await axios.get('/api/posts/user');
      setPosts(response.data.posts);
      setCache('userPosts', response.data.posts, 5 * 60 * 1000); // Cache for 5 minutes
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
      setCache('userPosts', posts.map(post => 
        post._id === editingPost._id ? { ...post, body: editContent } : post
      ), 5 * 60 * 1000);

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
      setCache('userPosts', posts.filter(post => post._id !== postId), 5 * 60 * 1000);
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
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.username || 'Anonymous'}</h1>
                <p className="text-sm sm:text-base text-gray-500 break-all">{user?.email}</p>
              </div>
            </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-white font-medium transition-all duration-200 w-full sm:w-auto ${
                  isLoggingOut
                    ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 hover:shadow-lg'
                }`}
              >
              {isLoggingOut ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                <FaSignOutAlt />
                  <span>Logout</span>
                </>
              )}
              </button>
            </div>
          </div>

        {/* Posts Section */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Posts</h2>
              </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-base sm:text-lg text-gray-500">No posts yet</p>
                  <button
                    onClick={() => navigate('/create')}
                    className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Create Your First Post
                  </button>
              </div>
                    ) : (
                      posts.map((post) => (
                        <motion.div
                          key={post._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
                            <div className="flex-1">
                              {editingPost?._id === post._id ? (
                                <div className="space-y-4">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
                                    rows="4"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <p className="text-gray-800 text-base sm:text-lg break-words">{post.body}</p>
                                  {post.image?.url && (
                                    <div className="mt-2">
                                      <img
                                        src={post.image.url}
                                        alt="Post attachment"
                                        className="max-h-96 w-full object-contain rounded-lg"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <FaThumbsUp />
                                  <span>{post.likes || 0}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <FaComment />
                                  <span>{post.commentsCount || 0}</span>
                                </span>
                                <span>
                                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-end sm:justify-start space-x-2 sm:ml-4">
                              {editingPost?._id === post._id ? (
                                <>
                                  <button
                                    onClick={handleUpdate}
                                    disabled={!editContent.trim()}
                                    className={`p-2 rounded-lg ${
                                      !editContent.trim()
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                                    }`}
                                  >
                                    <FaSave />
                                  </button>
                                  <button
                                    onClick={() => setEditingPost(null)}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => handleEdit(post)}
                                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(post._id)}
                                    className="p-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Comments Section */}
                          <div className="mt-4">
                            <button
                              onClick={() => toggleComments(post._id)}
                              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              {showComments === post._id ? (
                                <>
                                  <FaChevronUp />
                                  <span>Hide Comments</span>
                                </>
                              ) : (
                                <>
                                  <FaChevronDown />
                                  <span>Show Comments</span>
                                </>
                              )}
                            </button>
                            
                            {showComments === post._id && (
                              <div className="mt-4">
                                <CommentList 
                                  postId={post._id} 
                                  isOpen={true}
                                  onClose={() => setShowComments(null)}
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
