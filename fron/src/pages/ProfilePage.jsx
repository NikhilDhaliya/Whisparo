import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSignOutAlt, FaUser, FaEnvelope, FaThumbsUp, FaComment, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import CommentList from '../components/comments/CommentList';
import { useCache } from '../context/CacheContext';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedPostContent, setEditedPostContent] = useState('');
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const { getCacheData, setCacheData } = useCache();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check cache first
        const cachedUser = getCacheData('user_profile');
        if (cachedUser) {
          setUser(cachedUser);
          // Check cache for user posts
          const cachedPosts = getCacheData(`user_posts_${cachedUser.email}`);
          if (cachedPosts) {
            setUserPosts(cachedPosts);
            setLoading(false);
            return;
          }
        }

        const profileRes = await axios.get('/api/auth/check');
        setUser(profileRes.data.user);
        // Cache user profile
        setCacheData('user_profile', profileRes.data.user);

        const postsRes = await axios.get('/api/posts?authorEmail=' + encodeURIComponent(profileRes.data.user.email));
        setUserPosts(postsRes.data.posts);
        // Cache user posts
        setCacheData(`user_posts_${profileRes.data.user.email}`, postsRes.data.posts);
        setError(null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, getCacheData, setCacheData]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await axios.post('/api/auth/logout');
      // Clear cache on logout
      setCacheData('user_profile', null);
      setCacheData(`user_posts_${user.email}`, null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleUpdatePost = async (postId) => {
    if (!editedPostContent.trim() || isSavingPost) return;

    try {
      setIsSavingPost(true);
      await axios.put(`/api/posts/${postId}`, {
        body: editedPostContent
      });

      setUserPosts(prevPosts => {
        const newPosts = prevPosts.map(post => 
          post.id === postId ? { ...post, body: editedPostContent } : post
        );
        // Update cache
        setCacheData(`user_posts_${user.email}`, newPosts);
        return newPosts;
      });

      setEditingPostId(null);
      setEditedPostContent('');
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (isDeletingPost) return;

    try {
      setIsDeletingPost(true);
      await axios.delete(`/api/posts/${postId}`);

      setUserPosts(prevPosts => {
        const newPosts = prevPosts.filter(post => post.id !== postId);
        // Update cache
        setCacheData(`user_posts_${user.email}`, newPosts);
        return newPosts;
      });

      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setEditedPostContent(post.body);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedPostContent('');
  };

  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.newUsername || 'Anonymous'}</h1>
              <p className="text-gray-500 mt-1">{user.email}</p>
            </div>
            <motion.button
              onClick={handleLogout}
              disabled={isLoggingOut}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                isLoggingOut
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              {isLoggingOut ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSignOutAlt />
              )}
              <span>Logout</span>
            </motion.button>
          </div>
        </div>

        {/* User Posts */}
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No posts yet. Create your first post!
            </div>
          ) : (
            userPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm">
                {editingPostId === post.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editedPostContent}
                      onChange={(e) => setEditedPostContent(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="What's on your mind?"
                    />
                    <div className="flex justify-end gap-2">
                      <motion.button
                        onClick={() => handleUpdatePost(post.id)}
                        disabled={!editedPostContent.trim() || isSavingPost}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full transition-colors ${
                          !editedPostContent.trim() || isSavingPost
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isSavingPost ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaSave />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={handleCancelEdit}
                        disabled={isSavingPost}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <FaTimes />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-800 whitespace-pre-wrap">{post.body}</p>
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
                    
                    <div className="flex items-center justify-end sm:justify-start space-x-2 sm:ml-4">
                      {editingPostId === post.id ? (
                        <>
                          <button
                            onClick={() => handleUpdatePost(post.id)}
                            disabled={!editedPostContent.trim() || isSavingPost}
                            className={`p-2 rounded-lg ${
                              !editedPostContent.trim() || isSavingPost
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSavingPost}
                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEditPost(post)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            disabled={isDeletingPost}
                            className={`p-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 ${
                              isDeletingPost ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* Comments Section */}
                <div className="mt-4">
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {expandedPostId === post.id ? (
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
                  
                  {expandedPostId === post.id && (
                    <div className="mt-4">
                      <CommentList 
                        postId={post.id} 
                        isOpen={true}
                        onClose={() => setExpandedPostId(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
