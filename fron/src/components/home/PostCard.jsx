/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {React, useEffect, useState} from 'react'
import Avatar from '../common/Avatar'
import { FaThumbsUp, FaFlag, FaComment, FaEdit, FaTrash, FaSave, FaTimes, FaHeart, FaRegHeart } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import CommentList from '../comments/CommentList'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const PostCard = ({ post, currentUserEmail, onPostDeleted, onPostUpdated }) => {
  const {
    content,
    category,
    createdAt,
    likes: initialLikes,
    author,
    id: postId,
    commentsCount,
    authorEmail
  } = post;

  const [userVoteStatus, setUserVoteStatus] = useState(null);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isVoting, setIsVoting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleVote = async () => {
    if (isVoting) return;
    setIsVoting(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/posts/${postId}/vote`);
      if (response.data.success) {
        onPostUpdated({
          ...post,
          votes: response.data.votes,
          userVote: response.data.userVote
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      setError(error.response?.data?.message || 'Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleVoteStatus = async () => {
    try {
      const response = await axios.get(`/api/posts/${postId}/vote-status`);
      setUserVoteStatus(response.data.voteType);
    } catch (error) {
      console.error('Error fetching vote status:', error);
    }
  }

  useEffect(() => {
    handleVoteStatus();
  }, [postId]);

  const handleReport = async () => {
    try {
      await axios.post(`/api/posts/${postId}/report`);
      toast.success('Post reported successfully');
    } catch (error) {
      toast.error('Failed to report post');
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setIsDeleting(true);
      const response = await axios.delete(`/api/posts/${postId}`);
      if (response.data.success) {
        onPostDeleted(postId);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(error.response?.data?.message || 'Failed to delete post. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!editedContent.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.put(`/api/posts/${postId}`, {
        content: editedContent
      });
      
      if (response.data.success) {
        onPostUpdated({
          ...post,
          content: editedContent
        });
        setIsEditing(false);
        setError(null);
        toast.success('Post updated successfully');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setError(error.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const isOwnedByUser = currentUserEmail && authorEmail === currentUserEmail;

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar email={post?.authorEmail} />
            <div>
              <span className="font-medium text-gray-900">{post?.newUsername || 'Anonymous'}</span>
              <span className="block text-xs text-gray-500">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
                <button
                  onClick={handleEdit}
                  disabled={isSaving}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    isSaving ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isSaving ? <FaSave className="animate-spin" /> : <FaSave />}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
              {post.image?.url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2"
                >
                  <img
                    src={post.image.url}
                    alt="Post attachment"
                    className="max-h-96 w-full object-contain rounded-xl"
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button 
              onClick={handleVote}
              disabled={isVoting}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-all duration-200 ${
                userVoteStatus === 'like' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaThumbsUp className={`${userVoteStatus === 'like' ? 'text-blue-600' : ''}`} />
              <span className="text-sm font-medium">{likes}</span>
            </motion.button>
            
            <motion.button 
              onClick={() => setShowComments(true)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <FaComment />
              <span className="text-sm">{commentsCount || 0}</span>
            </motion.button>
          </div>

          <div className="flex items-center space-x-2">
            {isOwnedByUser && !isEditing && (
              <>
                <motion.button
                  onClick={handleEdit}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaEdit />
                </motion.button>
                <motion.button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaTrash />
                </motion.button>
              </>
            )}
            {!isOwnedByUser && (
              <motion.button
                onClick={handleReport}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaFlag />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowComments(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col touch-none"
              onClick={e => e.stopPropagation()}
            >
              <CommentList 
                postId={postId} 
                isOpen={showComments}
                onClose={() => setShowComments(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;