/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {React, useEffect, useState} from 'react'
import Avatar from '../common/Avatar'
import { FaThumbsUp, FaFlag, FaComment, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import CommentList from '../comments/CommentList'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import config from '../../config'

const PostCard = ({ post, currentUserEmail, onPostDeleted, onPostUpdated, onCommentClick, onDelete, onEdit, onVote, isProfilePage, commentsCount: initialCommentsCount, onCommentCountUpdate }) => {
  const { user: authUser } = useAuth();
  const {
    content,
    body,
    category,
    createdAt,
    likes: initialLikes,
    author,
    id: postId,
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

  const toggleComments = () => {
    setShowComments(!showComments);
    if (onCommentClick) {
      onCommentClick(postId);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200 text-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1">
          <Avatar email={authorEmail} size="small" />
          <div>
            <span className="block text-xs font-semibold text-gray-900">
              {authorEmail === authUser?.email ? authUser?.username : (newUsername || authorUsername || 'Anonymous')}
            </span>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>&middot;</span>
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        {/* Category Tag */}
        {category && (
          <span className="text-xs font-medium bg-gray-200 text-gray-700 px-1 py-0.5 rounded-full">
            {category}
          </span>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-1">
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs"
              rows="3"
            />
            <div className="flex justify-end space-x-1">
              <motion.button
                onClick={handleCancelEdit}
                whileTap={{ scale: 0.95 }}
                className="px-1.5 py-0.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-xs"
              >
                <FaTimes />
              </motion.button>
              <motion.button
                onClick={handleUpdate}
                disabled={isSaving}
                whileTap={{ scale: 0.95 }}
                className={`px-1.5 py-0.5 text-white rounded-md transition-colors text-xs ${
                  isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isSaving ? <FaSave className="animate-spin" /> : <FaSave />}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <p className="text-gray-800 text-xs break-words">{body || content}</p>
        )}
        
        {post.image?.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1"
          >
            <img
              src={post.image.url}
              alt="Post attachment"
              className="max-h-40 w-full object-contain rounded-md"
            />
          </motion.div>
        )}
      </div>

      {/* Actions and Comments Toggle */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          {/* Vote Buttons */}
          {!isProfilePage && (
            <div className="flex items-center space-x-1">
              <motion.button
                onClick={() => handleVote('upvote')}
                disabled={isVoting}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-0.5 ${
                  userVoteStatus === 'like' ? 'text-blue-600' : 'hover:bg-blue-100 hover:text-blue-600'
                } p-1 rounded-md transition-colors ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaThumbsUp />
                <span>{likes}</span>
              </motion.button>
              <motion.button
                onClick={() => handleVote('downvote')}
                disabled={isVoting}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-0.5 ${
                  userVoteStatus === null ? 'text-gray-600 hover:bg-gray-100' : 'hover:bg-red-100 hover:text-red-600'
                } p-1 rounded-md transition-colors ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaThumbsUp className="rotate-180" />
              </motion.button>
            </div>
          )}

          {/* Comments Count and Toggle */}
          <div className="flex items-center space-x-1">
            <motion.button
              onClick={toggleComments}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-0.5 text-xs text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FaComment />
              <span>{commentsCount}</span>
            </motion.button>

            <motion.button
              onClick={toggleComments}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-0.5 text-xs text-gray-600 hover:text-blue-600 transition-colors"
            >
              {showComments ? (
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
          </div>
        </div>

        {/* Edit/Delete/Save/Cancel buttons (only on ProfilePage) */}
        {isProfilePage && (
          <div className="flex items-center space-x-1">
            {isOwnedByUser && !isEditing && (
              <>
                <motion.button 
                  onClick={handleEdit}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  <FaEdit />
                </motion.button>
                <motion.button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 rounded-md text-gray-600 hover:bg-red-100 hover:text-red-600"
                >
                  <FaTrash />
                </motion.button>
              </>
            )}
            {!isOwnedByUser && (
              <motion.button
                onClick={handleReport}
                whileTap={{ scale: 0.95 }}
                className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <FaFlag />
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5"
          >
            <CommentList postId={postId} onCommentAdded={handleCommentAdded} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;