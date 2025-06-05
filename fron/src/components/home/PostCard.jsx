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
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleSave = async () => {
    if (!editedContent.trim()) return;
    
    try {
      setIsSaving(true);
      const response = await axios.put(`/api/posts/${postId}`, {
        body: editedContent
      });
      
      onPostUpdated(response.data.post);
      setIsEditing(false);
      toast.success('Post updated successfully');
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };

  const isOwnedByUser = currentUserEmail && authorEmail === currentUserEmail;

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-sm p-6 mb-4"
    >
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar email={authorEmail} />
              <div>
                <p className="font-medium text-gray-900">{author || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {category && (
              <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                {category}
              </span>
            )}
          </div>

          <div className="mt-2">
            {content && (
              <>
                <p className="text-gray-800 whitespace-pre-wrap break-words">{content}</p>
                {post.image?.url && (
                  <div className="mt-4">
                    <img
                      src={post.image.url}
                      alt="Post attachment"
                      className="max-h-96 w-full object-contain rounded-xl"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-between items-center">
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
                onClick={toggleComments}
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
        </>
      )}

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <CommentList postId={postId} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;