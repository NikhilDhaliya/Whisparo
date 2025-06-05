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
      <div className="flex gap-2">
        <Avatar email={comment.authorEmail} size="sm"/>
        
        <div className="flex-1">
          <div className="flex flex-col">
             <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900 text-sm">{comment.newUsername || 'Anonymous'}</span>
                <span className="text-gray-500 text-xs">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
            </div>
            <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{comment.body}</p>
          </div>
          
          <div className="mt-1 flex items-center gap-3">
             <motion.button
                onClick={handleVote}
                disabled={isVoting}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1 text-xs transition-colors duration-200 ${
                  userVote === 'like' 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-600 hover:text-blue-500'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaThumbsUp size={12} className="transition-transform duration-200" />
                <span>{likes > 0 ? likes : ''}</span>
              </motion.button>
              
              <motion.button
                onClick={() => setShowReplyForm(!showReplyForm)}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-gray-600 text-xs hover:text-blue-500 transition-colors duration-200"
              >
                <FaReply size={12} />
                <span>Reply</span>
              </motion.button>

               {isOwnedByUser && (
                  <motion.button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    whileTap={{ scale: 0.95 }}
                    className={`p-0 text-gray-600 hover:text-red-600 transition-colors ${
                      isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FaTrash size={12} />
                  </motion.button>
                )}
          </div>

           <AnimatePresence>
              {showReplyForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 overflow-hidden pr-4"
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

          {hasReplies && (
            <div className="mt-3">
              {!showReplies && remainingRepliesCount > 0 && (
                <button 
                  className="text-blue-600 text-xs mb-2 hover:underline font-semibold"
                  onClick={() => setShowReplies(true)}
                >
                  —— View {remainingRepliesCount} more replies
                </button>
              )}
              {repliesToDisplay.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={{...reply, newUsername: reply.authorUsername}}
                  postId={postId}
                  onCommentAdded={onCommentAdded}
                  currentUserEmail={currentUserEmail}
                />
              ))}
               {showReplies && (
                <button 
                  className="text-blue-600 text-xs mt-2 hover:underline font-semibold"
                  onClick={() => setShowReplies(false)}
                >
                   —— Hide replies
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
};

const CommentList = ({ postId, isOpen, onClose, onCommentCountUpdate }) => {
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
      setComments(prevComments => {
        if (page === 1) return response.data.comments; 

         const existingCommentIds = new Set(prevComments.map(c => c._id));
         const topLevelNewComments = response.data.comments.filter(c => !c.parentCommentId && !existingCommentIds.has(c._id));
         
         const updatedComments = [...prevComments];
         response.data.comments.forEach(newComment => {
           const existingCommentIndex = updatedComments.findIndex(c => c._id === newComment._id);
           if (existingCommentIndex > -1) {
             updatedComments[existingCommentIndex] = { 
                 ...updatedComments[existingCommentIndex], 
                 ...newComment, 
                 replies: newComment.replies || updatedComments[existingCommentIndex].replies 
              };
           } else {
               if (!newComment.parentCommentId) {
                 updatedComments.push(newComment);
               }
           }
         });
         
         updatedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

         return updatedComments;
      });
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
      axios.get('/api/auth/check')
        .then(response => {
          setCurrentUserEmail(response.data.user.email);
        })
        .catch(error => {
          console.error('Error fetching user:', error);
        });
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
      const removeComment = (commentsList, id) => {
        return commentsList.reduce((acc, comment) => {
          if (comment._id === id) {
            return acc;
          }
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = removeComment(comment.replies, id);
            if (comment._id !== id) {
                 acc.push({ ...comment, replies: updatedReplies });
            }
          } else {
             if (comment._id !== id) {
               acc.push(comment);
             }
          }
          return acc;
        }, []);
      };
      setComments(prevComments => removeComment(prevComments, deletedCommentId));
      
      if (onCommentCountUpdate) {
         onCommentCountUpdate(-1); 
      }

    } else if (newComment) {
       const addComment = (commentsList, commentToAdd) => {
         if (!commentToAdd.parentCommentId) {
           return [commentToAdd, ...commentsList];
         }

         return commentsList.map(comment => {
           if (comment._id === commentToAdd.parentCommentId) {
             const updatedReplies = comment.replies ? [...comment.replies, commentToAdd] : [commentToAdd];
             updatedReplies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

             return { ...comment, replies: updatedReplies };
           } else if (comment.replies && comment.replies.length > 0) {
             return { ...comment, replies: addComment(comment.replies, commentToAdd) };
           }
           return comment;
         });
      };

      setComments(prevComments => addComment(prevComments, newComment));
      
       if (onCommentCountUpdate) {
         onCommentCountUpdate(1); 
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
    
    if (deltaY > 0) {
      e.preventDefault();
      if (modalRef.current) {
        modalRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    const deltaY = currentY - startY;
    const closeThreshold = 100;

    if (deltaY > closeThreshold) {
      onClose();
    } else {
      if (modalRef.current) {
        modalRef.current.style.transform = 'translateY(0px)';
      }
    }
    setStartY(null);
    setCurrentY(null);
  };

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const handleScroll = (e) => {
       const isScrollable = modalElement.scrollHeight > modalElement.clientHeight;
       if (isScrollable) {
         const atTop = modalElement.scrollTop === 0;
         const atBottom = modalElement.scrollHeight - modalElement.scrollTop === modalElement.clientHeight;

         if (e.deltaY < 0 && atTop) {
           e.preventDefault();
         } else if (e.deltaY > 0 && atBottom) {
           e.preventDefault();
         }
       }
    };

    modalElement.addEventListener('wheel', handleScroll);

    return () => {
      modalElement.removeEventListener('wheel', handleScroll);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="relative bg-white w-full max-w-md h-full max-h-[80vh] rounded-t-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Comments</h2>
              <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                <FaTimes size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="comment-list-area">
              {loading && comments.length === 0 && <p className="text-center text-gray-500">Loading comments...</p>}
              {error && <p className="text-center text-red-500">{error}</p>}
              {comments.length === 0 && !loading && !error && <p className="text-center text-gray-500">No comments yet.</p>}
              
              {comments.map(comment => (
                <Comment 
                  key={comment._id} 
                  comment={comment}
                  postId={postId}
                  onCommentAdded={handleCommentAdded}
                  currentUserEmail={currentUserEmail}
                />
              ))}

              {!loading && hasMore && (
                <div className="flex justify-center mt-4">
                  <button 
                    onClick={handleLoadMore} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <CommentForm 
                postId={postId} 
                onCommentAdded={(newComment) => { 
                   handleCommentAdded(newComment);
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentList; 