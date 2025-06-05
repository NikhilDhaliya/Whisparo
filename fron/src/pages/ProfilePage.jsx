import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSignOutAlt, FaUser, FaEnvelope, FaThumbsUp, FaComment, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedPostContent, setEditedPostContent] = useState('');
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileRes = await axios.get('/api/auth/check');
        setUser(profileRes.data.user);

        const [postsRes, commentsRes] = await Promise.all([
          axios.get('/api/posts?authorEmail=' + encodeURIComponent(profileRes.data.user.email)),
          axios.get('/api/comments/user')
        ]);

        setUserPosts(postsRes.data.posts);
        setUserComments(commentsRes.data.comments);
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
  }, [navigate]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await axios.post('/api/auth/logout');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setEditedPostContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedPostContent('');
  };

  const handleUpdatePost = async (postId) => {
    if (!editedPostContent.trim()) return;
    setIsSavingPost(true);
    try {
      await axios.put(`/api/posts/${postId}`, { body: editedPostContent });
      setUserPosts(userPosts.map(post => 
        post.id === postId ? { ...post, content: editedPostContent } : post
      ));
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
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setIsDeletingPost(true);
    try {
      await axios.delete(`/api/posts/${postId}`);
      setUserPosts(userPosts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeletingPost(false);
    }
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

        {/* Tabs */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm ${
                  activeTab === 'posts'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Your Posts ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-center font-medium text-xs sm:text-sm ${
                  activeTab === 'comments'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Your Comments ({userComments.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'posts' ? (
              <div className="space-y-4 sm:space-y-6">
                {userPosts.length === 0 ? (
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
                  userPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
                        <div className="flex-1">
                          {editingPostId === post.id ? (
                            <textarea
                              value={editedPostContent}
                              onChange={(e) => setEditedPostContent(e.target.value)}
                              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
                              rows="4"
                            />
                          ) : (
                            <p className="text-gray-800 text-base sm:text-lg break-words">{post.content}</p>
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {userComments.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-base sm:text-lg text-gray-500">No comments yet</p>
                  </div>
                ) : (
                  userComments.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow"
                    >
                      <p className="text-gray-800 text-sm sm:text-base break-words">{comment.body}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        <span className="break-all">on post: {comment.postTitle}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
