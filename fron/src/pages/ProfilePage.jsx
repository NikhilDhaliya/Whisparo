import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCache } from '../context/CacheContext';
import { AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaSignOutAlt } from 'react-icons/fa';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const navigate = useNavigate();
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
      if (!response.data.user) {
        throw new Error('Invalid user data');
      }
      setUser(response.data.user);
      setCache('userProfile', response.data.user, 5 * 60 * 1000); // Cache for 5 minutes
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
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
      if (!response.data.posts) {
        throw new Error('Invalid response format');
      }
      setPosts(response.data.posts);
      setCache('userPosts', response.data.posts, 5 * 60 * 1000); // Cache for 5 minutes
      setError(null);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError(error.response?.data?.message || 'Failed to load posts');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const userData = await fetchUserData();
        if (userData) {
          await fetchUserPosts();
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      clearCache(); // Clear all cached data
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleUpdate = async () => {
    if (!editingPost) return;

    try {
      await axios.put(`/api/posts/${editingPost._id}`, {
        content: editContent
      });

      setPosts(prevPosts => {
        const newPosts = prevPosts.map(post => 
          post._id === editingPost._id ? { ...post, content: editContent } : post
        );
        setCache('userPosts', newPosts, 5 * 60 * 1000); // Update cache
        return newPosts;
      });

      setEditingPost(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post. Please try again.');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts(prevPosts => {
        const newPosts = prevPosts.filter(post => post._id !== postId);
        setCache('userPosts', newPosts, 5 * 60 * 1000); // Update cache
        return newPosts;
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 bg-red-50 p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">
          Please log in to view your profile
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
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              {editingPost?._id === post._id ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingPost(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-800 mb-4">{post.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-gray-600 hover:text-blue-500"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="p-2 text-gray-600 hover:text-red-500"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
