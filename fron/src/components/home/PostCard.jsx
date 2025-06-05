/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {React, useEffect, useState} from 'react'
import Avatar from '../common/Avatar'
import { FaThumbsUp, FaFlag, FaComment, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import CommentList from '../comments/CommentList'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const PostCard = ({ post, currentUserEmail, onPostDeleted, onPostUpdated, onCommentClick }) => {
  const { user: authUser } = useAuth();
  const {
    content,
    body,
    category,
    createdAt,
    likes: initialLikes,
    author,
    id: postId,
    commentsCount: initialCommentsCount,
    authorEmail,
    newUsername,
    authorUsername
  } = post;

  const [userVoteStatus, setUserVoteStatus] = useState(post.userVote || null);
  const [likes, setLikes] = useState(post.likes || 0);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount || 0);
  const [isVoting, setIsVoting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(body || content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleCommentCountUpdate = (delta) => {
    setCommentsCount(prevCount => Math.max(0, prevCount + delta));
  };

  const handleCommentAdded = (newComment, isDeleted = false, deletedCommentId = null) => {
    if (isDeleted) {
      setCommentsCount(prev => Math.max(0, prev - 1));
    } else if (newComment) {
      setCommentsCount(prev => prev + 1);
    }
  };

  const handleVote = async () => {
    if (isVoting) return;
    
    try {
      setIsVoting(true);
      
      const previousVoteStatus = userVoteStatus;
      
      if (previousVoteStatus === 'like') {
        setLikes(prev => prev - 1);
        setUserVoteStatus(null);
      } else {
        setLikes(prev => prev + 1);
        setUserVoteStatus('like');
      }

      const response = await axios.post(`/api/posts/${postId}/vote`);
      setLikes(response.data.likes);
      setUserVoteStatus(response.data.voteType);
      toast.success(previousVoteStatus === 'like' ? 'Vote removed' : 'Vote added');
    } catch (error) {
      toast.error('Failed to process vote');
      setUserVoteStatus(null);
      setLikes(initialLikes || 0);
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
      await axios.delete(`/api/posts/${postId}`);
      toast.success('Post deleted successfully');
      if (onPostDeleted) {
        onPostDeleted(postId);
      }
    } catch (error) {
      toast.error('Failed to delete post');
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(body || content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(body || content);
  };

  const handleUpdate = async () => {
    if (editedContent.trim() === (body || content).trim() || !editedContent.trim()) {
      setIsEditing(false);
      return;
    }
    try {
      setIsSaving(true);
      const response = await axios.put(`/api/posts/${postId}`, { body: editedContent });
      toast.success('Post updated successfully');
      if (onPostUpdated) {
        onPostUpdated(response.data.post);
      }
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setIsSaving(false);
    }
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
            <Avatar email={authorEmail} />
            <div>
              <span className="font-medium text-gray-900">
                {authorEmail === authUser?.email ? authUser?.username : (newUsername || authorUsername || 'Anonymous')}
              </span>
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
                  onClick={handleUpdate}
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
              <p className="text-gray-700 whitespace-pre-wrap">{body || content}</p>
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
              onClick={() => {
                setShowComments(!showComments);
                if (onCommentClick) {
                  onCommentClick(postId);
                }
              }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 transition-all duration-200 ${
                 showComments ? 'bg-gray-100' : ''
              }`}
            >
              <FaComment />
              <span className="text-sm font-medium">{commentsCount}</span>
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

      {/* Comment List Modal/Section */}
      <AnimatePresence>
        {showComments && (
          <CommentList 
            postId={postId} 
            isOpen={showComments} 
            onClose={() => setShowComments(false)} 
            onCommentCountUpdate={handleCommentCountUpdate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;