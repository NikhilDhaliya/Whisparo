import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSignOutAlt, FaUser, FaEnvelope, FaThumbsUp, FaComment, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'comments'
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedPostContent, setEditedPostContent] = useState('');
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First get user profile
        const profileRes = await axios.get('/api/auth/check');
        setUser(profileRes.data.user);

        // Then fetch posts and comments in parallel
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
  }, [navigate]); // Remove user?.email dependency

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await axios.post('/api/auth/logout');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout');
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
    if (!editedPostContent.trim()) return; // Prevent saving empty content
    setIsSavingPost(true);
    try {
      const _response = await axios.put(`/api/posts/${postId}`, { body: editedPostContent });
      // Update the post in the userPosts state
      setUserPosts(userPosts.map(post => 
        post.id === postId ? { ...post, content: editedPostContent } : post
      ));
      setEditingPostId(null);
      setEditedPostContent('');
    } catch (error) {
      console.error('Error updating post:', error);
      // Optionally show an error message to the user
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
      // Remove the post from the userPosts state
      setUserPosts(userPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      // Optionally show an error message to the user
    } finally {
      setIsDeletingPost(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-500 px-6 py-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium ${
                  isLoggingOut
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                <FaSignOutAlt />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-8">
            <div className="space-y-6">
              {/* Username */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaUser className="text-blue-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Username</h2>
                  <p className="text-lg font-semibold text-gray-900">
                    {user?.username || 'Anonymous'}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaEnvelope className="text-blue-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Email</h2>
                  <p className="text-lg font-semibold text-gray-900">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`${
                      activeTab === 'posts'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Your Posts ({userPosts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`${
                      activeTab === 'comments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Your Comments ({userComments.length})
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="mt-6">
                {activeTab === 'posts' ? (
                  <div className="space-y-4">
                    {userPosts.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No posts yet</p>
                    ) : (
                      userPosts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              {editingPostId === post.id ? (
                                <textarea
                                  value={editedPostContent}
                                  onChange={(e) => setEditedPostContent(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                  rows="4"
                                />
                              ) : (
                                <h3 className="font-medium text-gray-900">{post.content}</h3>
                              )}
                              
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {editingPostId === post.id ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdatePost(post.id)}
                                    disabled={!editedPostContent.trim() || isSavingPost}
                                    className={`flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors ${
                                      !editedPostContent.trim() || isSavingPost ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    {isSavingPost ? 'Saving...' : ''} <FaSave />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={isSavingPost}
                                    className={`flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors ${
                                      isSavingPost ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <FaThumbsUp />
                                    <span>{post.likes}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <FaComment />
                                    <span>{post.commentsCount}</span>
                                  </div>
                                  {/* Edit button */}
                                  <button 
                                      onClick={() => handleEditPost(post)}
                                      className="text-gray-600 hover:text-blue-500 transition-colors duration-200"
                                  >
                                      <FaEdit className="hover:scale-110 transition-transform duration-200" />
                                  </button>
                                  {/* Delete button */}
                                   <button 
                                      onClick={() => handleDeletePost(post.id)}
                                      disabled={isDeletingPost}
                                      className={`text-gray-600 hover:text-red-500 transition-colors duration-200 ${
                                        isDeletingPost ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                  >
                                      <FaTrash className={`hover:scale-110 transition-transform duration-200 ${isDeletingPost ? 'animate-spin' : ''}`} />
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
                  <div className="space-y-4">
                    {userComments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No comments yet</p>
                    ) : (
                      userComments.map((comment) => (
                        <div
                          key={comment._id}
                          className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Comment on: {comment.postTitle}
                              </p>
                              <p className="text-gray-900">{comment.body}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <FaThumbsUp />
                              <span>{comment.votes?.score || 0}</span>
                            </div>
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
      </div>
    </div>
  );
};

export default ProfilePage;
