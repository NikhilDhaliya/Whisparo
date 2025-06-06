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
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex flex-col space-y-3">
        {/* Post Body */}
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              rows="4"
            />
          </motion.div>
        ) : (
          <div className="text-gray-800 text-sm break-words">{body || content}</div>
        )}

        {/* Post Info (Author, Time) */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{isOwnedByUser ? 'You' : (newUsername || authorUsername || 'Anonymous')}</span>
          <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        </div>

        {/* Actions (Likes, Comments, Edit/Delete) */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center space-x-4 text-sm">
            {/* Like Button */}
            <motion.button
              onClick={handleVote}
              disabled={!authUser || isVoting}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex items-center space-x-1 transition-colors ${!authUser ? 'cursor-not-allowed text-gray-400' : userVoteStatus === 'like' ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
              aria-label={userVoteStatus === 'like' ? 'Unlike Post' : 'Like Post'}
            >
              {userVoteStatus === 'like' ? <FaThumbsUp /> : <FaThumbsUp />}
              <span>{likes}</span>
            </motion.button>

            {/* Comment Button */}
            <motion.button
              onClick={() => {
                setShowComments(!showComments);
                if (onCommentClick) onCommentClick(postId);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label={showComments ? 'Hide Comments' : 'Show Comments'}
            >
              <FaComment />
              <span>{commentsCount}</span>
            </motion.button>
          </div>

          {/* Edit/Delete Buttons (Author only) */}
          {isOwnedByUser && (
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  {/* Save Button */}
                  <motion.button
                    onClick={handleUpdate}
                    disabled={isSaving || editedContent.trim() === ''}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-1 rounded-md transition-colors ${isSaving || editedContent.trim() === '' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                    aria-label="Save Edit"
                  >
                    {isSaving ? <FaSpinner className="animate-spin text-sm" /> : <FaSave className="text-sm" />}
                  </motion.button>
                  {/* Cancel Button */}
                  <motion.button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-1 rounded-md transition-colors ${isSaving ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                    aria-label="Cancel Edit"
                  >
                    <FaTimes className="text-sm" />
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Edit Button */}
                  <motion.button
                    onClick={handleEdit}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Edit Post"
                  >
                    <FaEdit className="text-sm" />
                  </motion.button>
                  {/* Delete Button */}
                  <motion.button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-1 rounded-md text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Delete Post"
                  >
                    {isDeleting ? <FaSpinner className="animate-spin text-sm" /> : <FaTrash className="text-sm" />}
                  </motion.button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
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
      </div>
    </motion.div>
  );
};

export default PostCard;