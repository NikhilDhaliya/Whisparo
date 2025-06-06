/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import CommentList from '../comments/CommentList';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const PostCard = ({ post, onPostDeleted, onCommentCountUpdated }) => {
  const { user: authUser } = useAuth();
  const {
    body,
    category,
    createdAt,
    likes: initialLikes,
    _id: postId,
    commentsCount: initialCommentsCount,
    authorEmail,
    authorUsername
  } = post;

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes || 0);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount || 0);
  const [isVoting, setIsVoting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(body);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if the current user has liked this post on mount
    const checkLikeStatus = async () => {
      if (!authUser) return;
      try {
        const response = await axios.get(`/api/posts/${postId}/vote-status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsLiked(response.data.isLiked);
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };

    checkLikeStatus();
  }, [postId, authUser]);

  // Update commentsCount state when the prop changes if needed (can be removed if prop isn't directly updated elsewhere)
  useEffect(() => {
     setCommentsCount(initialCommentsCount || 0);
  }, [initialCommentsCount]);

  const handleCommentCountUpdate = (change) => {
    setCommentsCount(prevCount => Math.max(0, prevCount + change));
    if (onCommentCountUpdated) {
      onCommentCountUpdated(postId, change);
    }
  };

  const handleLikeClick = async () => {
    if (!authUser || isVoting) {
      toast.error('Please log in to vote.');
      return;
    }

    setIsVoting(true);
    try {
      const response = await axios.post(`/api/posts/${postId}/vote`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsLiked(response.data.isLiked);
      setLikesCount(response.data.likesCount);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error voting on post:', error);
      toast.error('Failed to process vote.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedBody(body);
  };

  const handleSaveClick = async () => {
    if (!editedBody.trim()) {
      toast.error('Post body cannot be empty.');
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    try {
      await axios.put(`/api/posts/${postId}`, { body: editedBody }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsEditing(false);
      toast.success('Post updated successfully!');
      // Optionally, update the post in the parent component's state if needed
      // onPostUpdated({...post, body: editedBody}); // assuming onPostUpdated prop exists
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedBody(body); // Revert changes
  };

  const handleDeleteClick = async () => {
    if (isDeleting) return;

    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true);
      try {
        await axios.delete(`/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Post deleted successfully!');
        if (onPostDeleted) {
          onPostDeleted(postId);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const isAuthor = authUser && authUser.email === authorEmail;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-sm p-3 mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          {/* Display username: show actual username if logged in and is author, otherwise Anonymous */}
          <p className="text-xs text-gray-500 font-medium">
            {isAuthor ? (authUser?.username || 'Anonymous') : (authorUsername || 'Anonymous')}
          </p>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
        {isAuthor && !isEditing && (
          <div className="flex space-x-1">
            <button
              onClick={handleEditClick}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors text-xs"
            >
              <FaEdit />
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={`p-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-100 transition-colors text-xs ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isDeleting ? <FaSpinner className="animate-spin text-xs" /> : <FaTrash />}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2 mb-3">
          <textarea
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-sm"
            rows="3"
            disabled={isSaving}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelClick}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
            >
              <FaTimes className="text-sm"/> Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={isSaving || !editedBody.trim() || editedBody.trim() === body.trim()}
              className={`px-3 py-1.5 text-white rounded-md transition-colors text-sm ${isSaving || !editedBody.trim() || editedBody.trim() === body.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isSaving ? <FaSpinner className="animate-spin text-sm mr-1" /> : <FaSave className="text-sm mr-1" />} Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 text-sm mb-3 break-words">{body}</p>
      )}

      {post.image?.url && (
        <div className="mb-3">
          <img src={post.image.url} alt="Post attachment" className="max-h-40 w-full object-cover rounded-md" />
        </div>
      )}

      <div className="flex items-center space-x-3 text-gray-600 text-xs mb-3">
        <button onClick={handleLikeClick} disabled={isVoting} className="flex items-center space-x-1 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isLiked ? <FaThumbsUp className="text-blue-600" /> : <FaRegThumbsUp />}
          <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
        </button>
        <button onClick={toggleComments} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
          <FaComment />
          <span>{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
          {showComments ? <FaChevronUp className="text-xs"/> : <FaChevronDown className="text-xs"/>} {/* Icon for expanding/collapsing */}
        </button>
      </div>

      {/* Comment Section Modal */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            <CommentList
              postId={postId}
              isOpen={showComments}
              onClose={() => setShowComments(false)}
              onCommentCountUpdated={handleCommentCountUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;