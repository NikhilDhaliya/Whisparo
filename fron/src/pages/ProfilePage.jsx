/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSignOutAlt, FaUser, FaEnvelope, FaThumbsUp, FaComment, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import CommentList from '../components/comments/CommentList';
import { useCache } from '../context/CacheContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingPostContent, setEditingPostContent] = useState('');
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const { getCacheData, setCacheData } = useCache();
  

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) {
        setError('Not authenticated');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        // Check cache first
        const cachedPosts = getCacheData(`user_posts_${authUser.email}`);
        const cachedComments = getCacheData(`user_comments_${authUser.email}`);

        if (cachedPosts && cachedComments) {
          setUserPosts(cachedPosts);
          setUserComments(cachedComments);
          setLoading(false);
          return;
        }

        // Fetch posts and comments using the user's email
        const [postsRes, commentsRes] = await Promise.all([
          axios.get('/api/posts?authorEmail=' + encodeURIComponent(authUser.email)),
          axios.get('/api/comments/user')
        ]);

        const postsWithUsernames = postsRes.data.posts.map(post => ({
          ...post,
          username: authUser.username || 'Anonymous'
        }));
        setUserPosts(postsWithUsernames);
        setCacheData(`user_posts_${authUser.email}`, postsWithUsernames);

        setUserComments(commentsRes.data.comments);
        setCacheData(`user_comments_${authUser.email}`, commentsRes.data.comments);

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
  }, [navigate, getCacheData, setCacheData, authUser]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Clear cache on logout
      setCacheData('user_profile', null);
      setCacheData(`user_posts_${authUser.email}`, null);
      setCacheData(`user_comments_${authUser.email}`, null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleUpdatePost = async (postId) => {
    if (!editingPostContent.trim() || isSavingPost) return;

    try {
      setIsSavingPost(true);
      await axios.put(`/api/posts/${postId}`, {
        body: editingPostContent
      });

      setUserPosts(prevPosts => {
        const newPosts = prevPosts.map(post => 
          post.id === postId ? { ...post, body: editingPostContent } : post
        );
        // Update cache
        setCacheData(`user_posts_${authUser.email}`, newPosts);
        return newPosts;
      });

      setEditingPostId(null);
      setEditingPostContent('');
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentContent.trim() || isSavingComment) return;

    try {
      setIsSavingComment(true);
      await axios.put(`/api/comments/${commentId}`, {
        body: editingCommentContent
      });

      setUserComments(prevComments => {
        const newComments = prevComments.map(comment => 
          comment._id === commentId ? { ...comment, body: editingCommentContent } : comment
        );
        // Update cache
        setCacheData(`user_comments_${authUser.email}`, newComments);
        return newComments;
      });

      setEditingCommentId(null);
      setEditingCommentContent('');
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsSavingComment(false);
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
        setCacheData(`user_posts_${authUser.email}`, newPosts);
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

  const handleDeleteComment = async (commentId) => {
    if (isDeletingComment) return;

    try {
      setIsDeletingComment(true);
      await axios.delete(`/api/comments/${commentId}`);

      setUserComments(prevComments => {
        const newComments = prevComments.filter(comment => comment._id !== commentId);
        // Update cache
        setCacheData(`user_comments_${authUser.email}`, newComments);
        return newComments;
      });

      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setEditingPostContent(post.body);
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentContent(comment.body);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditingCommentId(null);
    setEditingPostContent('');
    setEditingCommentContent('');
  };

  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xl bg-white p-8 rounded-2xl shadow-lg"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-2xl p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg"
              >
                {authUser?.email?.charAt(0).toUpperCase()}
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{authUser?.username || 'Anonymous'}</h1>
                <p className="text-sm sm:text-base text-gray-500 break-all">{authUser?.email}</p>
              </div>
            </div>
            <motion.button
              onClick={handleLogout}
              disabled={isLoggingOut}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 w-full sm:w-auto ${
                isLoggingOut
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg'
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
            </motion.button>
          </div>
        </motion.div>

        {/* Posts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white shadow-xl rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Your Posts</h2>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {userPosts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-base sm:text-lg text-gray-500">No posts yet</p>
                  <motion.button
                    onClick={() => navigate('/create')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                  >
                    Create Your First Post
                  </motion.button>
                </motion.div>
              ) : (
                userPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex flex-col space-y-4">
                      {editingPostId === post.id ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <textarea
                            value={editingPostContent}
                            onChange={(e) => setEditingPostContent(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                            rows="4"
                          />
                          <div className="flex justify-end space-x-3">
                            <motion.button
                              onClick={handleCancelEdit}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <FaTimes />
                            </motion.button>
                            <motion.button
                              onClick={() => handleUpdatePost(post.id)}
                              disabled={isSavingPost}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                isSavingPost ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                              }`}
                            >
                              {isSavingPost ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <p className="text-gray-800 text-sm break-words">{post.body}</p>
                            {post.image?.url && (
                              <div className="mt-2">
                                <img
                                  src={post.image.url}
                                  alt="Post attachment"
                                  className="max-h-96 w-full object-contain rounded-lg"
                                />
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
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
                          
                          <div className="flex items-center justify-end space-x-2">
                            {editingPostId === post.id ? (
                              <>
                                <motion.button
                                  onClick={handleCancelEdit}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <FaTimes />
                                </motion.button>
                                <motion.button
                                  onClick={() => handleUpdatePost(post.id)}
                                  disabled={isSavingPost}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`p-2 text-white rounded-lg transition-colors ${
                                    isSavingPost ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                                  }`}
                                >
                                  {isSavingPost ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <motion.button 
                                  onClick={() => handleEditPost(post)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                                >
                                  <FaEdit />
                                </motion.button>
                                <motion.button 
                                  onClick={() => handleDeletePost(post.id)}
                                  disabled={isDeletingPost}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`p-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 ${
                                    isDeletingPost ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <FaTrash />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </>
                      )}

                      {/* Comments Section */}
                      <div className="mt-4">
                        <motion.button
                          onClick={() => toggleComments(post.id)}
                          whileHover={{ scale: 1.02 }}
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
                        </motion.button>
                        
                        <AnimatePresence>
                          {expandedPostId === post.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-4"
                            >
                              <CommentList 
                                postId={post.id} 
                                isOpen={true}
                                onClose={() => setExpandedPostId(null)}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white shadow-xl rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Your Comments</h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {userComments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-base text-gray-500">No comments yet</p>
                </motion.div>
              ) : (
                userComments.map((comment) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex flex-col space-y-4">
                      {editingCommentId === comment._id ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <textarea
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                            rows="3"
                          />
                          <div className="flex justify-end space-x-3">
                            <motion.button
                              onClick={handleCancelEdit}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <FaTimes />
                            </motion.button>
                            <motion.button
                              onClick={() => handleUpdateComment(comment._id)}
                              disabled={!editingCommentContent.trim() || isSavingComment}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                !editingCommentContent.trim() || isSavingComment
                                  ? 'bg-blue-400'
                                  : 'bg-blue-500 hover:bg-blue-600'
                              }`}
                            >
                              {isSavingComment ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <p className="text-gray-800 text-sm break-words">{comment.body}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>On post:</span>
                              <motion.button
                                onClick={() => navigate(`/post/${comment.postId}`)}
                                whileHover={{ scale: 1.02 }}
                                className="text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {comment.postTitle}
                              </motion.button>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </div>
                          </div>

                          <div className="flex items-center justify-end space-x-2">
                            {editingCommentId === comment._id ? (
                              <>
                                <motion.button
                                  onClick={handleCancelEdit}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <FaTimes />
                                </motion.button>
                                <motion.button
                                  onClick={() => handleUpdateComment(comment._id)}
                                  disabled={!editingCommentContent.trim() || isSavingComment}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                    !editingCommentContent.trim() || isSavingComment
                                      ? 'bg-blue-400'
                                      : 'bg-blue-500 hover:bg-blue-600'
                                  }`}
                                >
                                  {isSavingComment ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <motion.button 
                                  onClick={() => handleEditComment(comment)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                                >
                                  <FaEdit />
                                </motion.button>
                                <motion.button 
                                  onClick={() => handleDeleteComment(comment._id)}
                                  disabled={isDeletingComment}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`p-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 ${
                                    isDeletingComment ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <FaTrash />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
