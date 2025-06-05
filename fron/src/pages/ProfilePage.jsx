/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSignOutAlt, FaUser, FaEnvelope, FaThumbsUp, FaComment, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import CommentList from '../components/comments/CommentList';
import { useCache } from '../context/CacheContext';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/PostCard';

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

      const response = await axios.get('/api/users/me');
      setUser(response.data);
      setCacheData('userProfile', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
      setLoading(false);
      return null;
    }
  };

  const fetchUserPosts = async (userData, forceRefresh = false) => {
    if (!userData?.email) return;

    try {
      // Check cache first
      const cachedData = getCacheData('userPosts');
      if (cachedData && !forceRefresh) {
        setPosts(cachedData);
        return;
      }

      const response = await axios.get(`/api/posts?authorEmail=${encodeURIComponent(userData.email)}`);
      setPosts(response.data.posts);
      setCacheData('userPosts', response.data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const userData = await fetchUserData();
        if (userData) {
          await fetchUserPosts(userData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
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
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
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

  const handleVote = async (postId, voteType) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/vote`, { voteType });
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, ...response.data.post } : post
      ));
      
      // Update cache
      setCacheData('userPosts', posts.map(post => 
        post._id === postId ? { ...post, ...response.data.post } : post
      ));
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleComment = (postId) => {
    // This is handled by the PostCard component
    console.log('Comment clicked for post:', postId);
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
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? <FaSpinner className="animate-spin" /> : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">{user?.username || 'Anonymous'}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onVote={handleVote}
              onComment={handleComment}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isProfilePage={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
