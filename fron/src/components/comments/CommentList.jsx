import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../common/Avatar';
import CommentForm from './CommentForm';
import { FaThumbsUp, FaReply, FaTimes, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Comment = ({ comment, postId, onCommentAdded, currentUserEmail }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [likes, setLikes] = useState(comment.votes?.score || 0);
  const [userVote, setUserVote] = useState(comment.votes?.userVote || null);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const initialRepliesToShow = 2;

  const handleVote = async () => {
    if (isVoting) return;
    
    try {
      setIsVoting(true);
      const response = await axios.post(`/api/comments/${comment._id}/vote`);
      setLikes(response.data.comment.score);
      setUserVote(response.data.comment.userVote);
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast.error('Failed to vote on comment');
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/api/comments/${comment._id}`);
      toast.success('Comment deleted successfully');
      if (onCommentAdded) {
        onCommentAdded(null, true, comment._id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwnedByUser = currentUserEmail && comment.authorEmail === currentUserEmail;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const repliesToDisplay = showReplies ? comment.replies : (comment.replies?.slice(0, initialRepliesToShow) || []);
  const remainingRepliesCount = hasReplies ? comment.replies.length - repliesToDisplay.length : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4"
    >
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar email={comment.authorEmail} />
            <span className="font-medium text-gray-900">{comment.newUsername || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {isOwnedByUser && (
              <motion.button
                onClick={handleDelete}
                disabled={isDeleting}
                whileTap={{ scale: 0.95 }}
                className={`p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaTrash size={14} />
              </motion.button>
            )}
          </div>
        </div>
        
        <p className="mt-2 text-gray-700">{comment.body}</p>
        
        <div className="mt-3 flex gap-4">
          <motion.button
            onClick={handleVote}
            disabled={isVoting}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 ${
              userVote === 'like' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaThumbsUp className="transition-transform duration-200" />
            <span className="text-sm font-medium">{likes}</span>
          </motion.button>
          
          <motion.button
            onClick={() => setShowReplyForm(!showReplyForm)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <FaReply />
            <span className="text-sm">Reply</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-hidden"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasReplies && (
        <div className="ml-4 sm:ml-8 mt-2">
          {!showReplies && remainingRepliesCount > 0 && (
            <button 
              className="text-blue-600 text-sm mb-2 hover:underline"
              onClick={() => setShowReplies(true)}
            >
              View {remainingRepliesCount} more replies
            </button>
          )}
          {repliesToDisplay.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              postId={postId}
              onCommentAdded={onCommentAdded}
              currentUserEmail={currentUserEmail}
            />
          ))}
           {showReplies && (
            <button 
              className="text-blue-600 text-sm mt-2 hover:underline"
              onClick={() => setShowReplies(false)}
            >
              Hide replies
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

const CommentList = ({ postId, isOpen, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [startY, setStartY] = useState(null);
  const [currentY, setCurrentY] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const modalRef = useRef(null);

  const fetchComments = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/comments/posts/${postId}?page=${page}&limit=5`);
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
      setCurrentPage(1);
      setComments([]);
      setHasMore(true);
      fetchComments(1);
      // Get current user's email
      axios.get('/api/auth/check')
        .then(response => {
          setCurrentUserEmail(response.data.user.email);
        })
        .catch(error => {
          console.error('Error fetching user:', error);
        });
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [postId, isOpen]);

  const handleCommentAdded = (newComment, isDeleted = false, deletedCommentId = null) => {
    if (isDeleted) {
      // Recursively find and remove the deleted comment/reply
      const removeComment = (commentsList, id) => {
        return commentsList.reduce((acc, comment) => {
          if (comment._id === id) {
            return acc; // Skip the deleted comment
          }
          if (comment.replies && comment.replies.length > 0) {
            // Recursively filter replies
            const updatedReplies = removeComment(comment.replies, id);
            // Only include the comment if it still has replies or wasn't the target
            if (comment._id !== id) { // Ensure we don't add the deleted comment itself
                 acc.push({ ...comment, replies: updatedReplies });
            }
          } else {
             // Only include the comment if it wasn't the target and has no replies (or replies were filtered out)
             if (comment._id !== id) {
               acc.push(comment);
             }
          }
          return acc;
        }, []);
      };
      setComments(prevComments => removeComment(prevComments, deletedCommentId));
      
      // Update the comment count in the parent component (PostCard)
      // This part might need refinement depending on how comment count is managed.
      // Currently, it decrements by 1 for any deletion, which might not be accurate for replies.
      if (onCommentAdded) {
        // We need to know if a top-level comment or a reply was deleted to update count correctly.
        // For simplicity, let's assume for now that onCommentAdded in PostCard handles overall count updates.
        // If a reply is deleted, the top-level comment's reply count *in the backend* will eventually be correct on re-fetch.
        // A more real-time approach would involve the backend returning updated counts on delete.
        // Let's just trigger the parent update for now, the count might be slightly off until refresh if it's a reply.
         onCommentAdded(null, true, deletedCommentId); // Pass the ID of the deleted item
      }

    } else if (newComment) {
       // Find the parent comment and add the new reply, or add as a new top-level comment
      const addComment = (commentsList, commentToAdd) => {
         // If it's a top-level comment
         if (!commentToAdd.parentCommentId) {
           return [commentToAdd, ...commentsList];
         }

         // If it's a reply, find the parent
         return commentsList.map(comment => {
           if (comment._id === commentToAdd.parentCommentId) {
             // Add the reply to the parent's replies array
             // Ensure replies array exists
             const updatedReplies = comment.replies ? [...comment.replies, commentToAdd] : [commentToAdd];
             return { ...comment, replies: updatedReplies };
           } else if (comment.replies && comment.replies.length > 0) {
             // Recursively check replies
             return { ...comment, replies: addComment(comment.replies, commentToAdd) };
           }
           return comment;
         });
      };

      setComments(prevComments => addComment(prevComments, newComment));
      
      // Update the comment count in the parent component
       if (onCommentAdded && !newComment.parentCommentId) {
         // Only increment total count if it's a top-level comment
         onCommentAdded(newComment); 
       } else if (onCommentAdded && newComment.parentCommentId) {
          // If a reply is added, the total comment count might not change 
          // (depending on how you define total count - top-level only or all). 
          // If it's total replies, backend should return updated count.
          // For now, if it's a reply, we just update the state, count in PostCard might be off.
           onCommentAdded(newComment); // Still call to trigger potential updates in PostCard if needed
       }
    }
  };

  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
    fetchComments(currentPage + 1);
  };

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!startY) return;
    
    const currentY = e.touches[0].clientY;
    setCurrentY(currentY);
    
    const deltaY = currentY - startY;
    
    // Only allow dragging down
    if (deltaY > 0) {
      e.preventDefault();
      if (modalRef.current) {
        modalRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!startY || !currentY) return;
    
    const deltaY = currentY - startY;
    
    // If dragged down more than 100px, close the modal
    if (deltaY > 100) {
      onClose();
    } else {
      // Reset position
      if (modalRef.current) {
        modalRef.current.style.transform = 'translateY(0)';
      }
    }
    
    setStartY(null);
    setCurrentY(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col touch-none"
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 overscroll-contain">
              {loading && comments.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-center py-4 bg-red-50 rounded-xl"
                >
                  {error}
                </motion.div>
              ) : (
                <>
                  <div className="sticky top-0 z-10 bg-gray-50 pb-4">
                    <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
                  </div>
                  <div className="mt-6 space-y-4">
                    {comments.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 text-gray-500"
                      >
                        No comments yet. Be the first to comment!
                      </motion.div>
                    ) : (
                      comments.map((comment) => (
                        <Comment
                          key={comment._id}
                          comment={comment}
                          postId={postId}
                          onCommentAdded={handleCommentAdded}
                          currentUserEmail={currentUserEmail}
                        />
                      ))
                    )}
                  </div>
                  {hasMore && (
                    <motion.button
                      onClick={handleLoadMore}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      Load More
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentList; 