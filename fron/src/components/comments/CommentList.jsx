import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../common/Avatar';
import CommentForm from './CommentForm';
import { FaThumbsUp, FaReply, FaTimes } from 'react-icons/fa';

const Comment = ({ comment, postId, onCommentAdded }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [likes, setLikes] = useState(comment.votes?.score || 0);
  const [userVote, setUserVote] = useState(comment.votes?.userVote || null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (isVoting) return;
    
    try {
      setIsVoting(true);
      const response = await axios.post(`/api/comments/${comment._id}/vote`);
      setLikes(response.data.comment.score);
      setUserVote(response.data.comment.userVote);
    } catch (error) {
      console.error('Error voting on comment:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="mt-4 animate-fadeIn">
      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar email={comment.authorEmail} />
            <span className="font-medium">{comment.newUsername || 'Anonymous'}</span>
          </div>
          <span className="text-gray-500 text-sm">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <p className="mt-2 text-gray-700">{comment.body}</p>
        
        <div className="mt-3 flex gap-4">
          <button
            onClick={handleVote}
            disabled={isVoting}
            className={`flex items-center gap-1 transition-all duration-200 ${
              userVote === 'like' 
                ? 'text-blue-500 scale-110' 
                : 'text-gray-600 hover:text-blue-500 hover:scale-105'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaThumbsUp className="transition-transform duration-200" />
            <span className="text-sm font-medium">{likes}</span>
          </button>
          
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors duration-200"
          >
            <FaReply className="hover:scale-110 transition-transform duration-200" />
            <span className="text-sm">Reply</span>
          </button>
        </div>

        {showReplyForm && (
          <div className="mt-3 animate-slideDown">
            <CommentForm
              postId={postId}
              parentCommentId={comment._id}
              onCommentAdded={(newComment) => {
                setShowReplyForm(false);
                if (onCommentAdded) {
                  onCommentAdded(newComment);
                }
              }}
            />
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              postId={postId}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentList = ({ postId, isOpen, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/comments/posts/${postId}?page=${page}&limit=5`); // Request 5 comments per page
      setComments(prevComments => page === 1 ? response.data.comments : [...prevComments, ...response.data.comments]);
      setHasMore(response.data.hasMore);
      setError(null);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1); // Reset to first page when modal opens
      setComments([]); // Clear previous comments
      setHasMore(true); // Assume more comments until proven otherwise
      fetchComments(1);
    }
  }, [postId, isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match this with the animation duration
  };

  const handleCommentAdded = (newComment) => {
    // Option 1: Prepend new comment (simple, but might not fit strict pagination order)
    // setComments(prevComments => [newComment, ...prevComments]);
    // Option 2: Re-fetch the first page (ensures correct order, less efficient)
    fetchComments(1);
  };

  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
    fetchComments(currentPage + 1);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Comments</h3>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading && comments.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4 bg-red-50 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
              <div className="mt-6 space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <Comment
                      key={comment._id}
                      comment={comment}
                      postId={postId}
                      onCommentAdded={handleCommentAdded}
                    />
                  ))
                )}
              </div>
              {hasMore && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading} // Disable button while loading
                    className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentList; 