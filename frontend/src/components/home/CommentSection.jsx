import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import IconButton from '../common/IconButton';
import { formatRelativeTime } from '../../utils/helpers';
import { commentService } from '../../utils/api';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await commentService.getComments(postId);
      setComments(response);
    } catch (error) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await commentService.createComment(postId, {
        body: newComment.trim()
      });
      setComments(prev => [response.comment, ...prev]);
      setNewComment('');
    } catch (error) {
      setError('Failed to post comment');
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (commentId, voteType) => {
    try {
      const response = await commentService.voteComment(commentId, voteType);
      setComments(prev => 
        prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, votes: response.comment }
            : comment
        )
      );
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const renderComment = (comment) => (
    <motion.div
      key={comment._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-50 rounded-lg p-3 mb-2"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              {comment.authorEmail}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {formatRelativeTime(new Date(comment.createdAt))}
            </span>
          </div>
          <p className="text-gray-800 text-sm">{comment.body}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <IconButton
              icon={<ChevronUp size={16} />}
              onClick={() => handleVote(comment._id, 'upvote')}
              active={comment.votes?.userVote === 'upvote'}
              label="Upvote"
            />
            <span className="text-sm mx-1">
              {comment.votes?.score || 0}
            </span>
            <IconButton
              icon={<ChevronDown size={16} />}
              onClick={() => handleVote(comment._id, 'downvote')}
              active={comment.votes?.userVote === 'downvote'}
              label="Downvote"
            />
          </div>
          <IconButton
            icon={<Trash2 size={16} />}
            onClick={() => handleDelete(comment._id)}
            label="Delete"
            variant="ghost"
            className="text-red-500 hover:text-red-600"
          />
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 mt-2">
          {comment.replies.map(reply => renderComment(reply))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmitComment} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className={`mt-2 px-4 py-2 rounded-lg text-white ${
            loading || !newComment.trim()
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}

      <AnimatePresence>
        {comments.map(comment => renderComment(comment))}
      </AnimatePresence>
    </div>
  );
};

export default CommentSection; 