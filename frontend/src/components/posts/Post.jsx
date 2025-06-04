import React, { useState, useEffect, useRef } from 'react';
import { FaRegHeart, FaHeart, FaRegComment, FaUserCircle, FaRegThumbsDown } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import axios from 'axios';

const Post = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light'); // State to track theme
  const reportMenuRef = useRef(null); // Ref for the dropdown menu
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(post.dislikes || 0);

  // Effect to update theme state based on document element class
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains('dark')) {
        setCurrentTheme('dark');
      } else {
        setCurrentTheme('light');
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Initial check
    if (document.documentElement.classList.contains('dark')) {
      setCurrentTheme('dark');
    } else {
      setCurrentTheme('light');
    }

    return () => observer.disconnect();
  }, []);

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reportMenuRef.current && !reportMenuRef.current.contains(event.target)) {
        setShowReportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [reportMenuRef]);

  // Fetch initial like status when the post loads
  useEffect(() => {
    const fetchVoteStatus = async () => {
      if (!post.id) return; // Avoid fetching if post.id is not available

      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${post.id}/vote-status`, {
          withCredentials: true,
        });
        if (response.data.voteType === 'like') {
          setIsLiked(true);
          setIsDisliked(false);
        } else if (response.data.voteType === 'dislike') {
          setIsLiked(false);
          setIsDisliked(true);
        } else {
          setIsLiked(false);
          setIsDisliked(false);
        }
      } catch (error) {
        console.error('Error fetching vote status:', error);
      }
    };
    fetchVoteStatus();
  }, [post.id]); // Depend on post.id

  // Fetch comments when showComments is toggled on
  useEffect(() => {
    if (showComments && post.id) {
      setLoadingComments(true);
      axios.get(`http://localhost:5000/api/posts/${post.id}/comments`, { withCredentials: true })
        .then(res => {
          setComments(res.data);
        })
        .catch(() => setComments([]))
        .finally(() => setLoadingComments(false));
    }
  }, [showComments, post.id]);

  const handleLike = async () => {
    try {
      const voteType = isLiked ? 'unlike' : 'like';
      const response = await axios.post(`http://localhost:5000/api/posts/${post.id}/vote`, 
        { voteType },
        { withCredentials: true }
      );
      if (response.data.voteType === 'like') {
        setIsLiked(true);
        setIsDisliked(false);
        setLikeCount(response.data.likes);
        setDislikeCount(response.data.dislikes);
      } else if (response.data.voteType === 'unlike') {
        setIsLiked(false);
        setIsDisliked(false);
        setLikeCount(response.data.likes);
        setDislikeCount(response.data.dislikes);
      }
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const handleDislike = async () => {
    try {
      const voteType = isDisliked ? 'unlike' : 'dislike';
      const response = await axios.post(`http://localhost:5000/api/posts/${post.id}/vote`, 
        { voteType },
        { withCredentials: true }
      );
      if (response.data.voteType === 'dislike') {
        setIsDisliked(true);
        setIsLiked(false);
        setLikeCount(response.data.likes);
        setDislikeCount(response.data.dislikes);
      } else if (response.data.voteType === 'unlike') {
        setIsDisliked(false);
        setIsLiked(false);
        setLikeCount(response.data.likes);
        setDislikeCount(response.data.dislikes);
      }
    } catch (error) {
      console.error('Dislike failed:', error);
    }
  };

  const handleReport = (reason) => {
    console.log(`Reporting post ${post.id} for reason: ${reason}`);
    // TODO: Implement backend API call to submit report
    setShowReportMenu(false); // Close menu after reporting
  };


  // Add new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await axios.post(
        `http://localhost:5000/api/posts/${post.id}/comments`,
        { body: newComment },
        { withCredentials: true }
      );
      setNewComment("");
      // Refetch comments after adding
      const commentsRes = await axios.get(`http://localhost:5000/api/posts/${post.id}/comments`, { withCredentials: true });
      setComments(commentsRes.data);
    } catch {
      // Optionally show error
    } finally {
      setSubmittingComment(false);
    }
  };

  // Recursive render for threaded comments
  const renderComments = (commentsArr, level = 0) => (
    <div className={level > 0 ? 'ml-6 border-l pl-4 border-gray-200 dark:border-gray-700' : ''}>
      {commentsArr.map(comment => (
        <div key={comment._id} className="mb-3">
          <div className="flex items-center space-x-2 mb-1">
            <FaUserCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">Anonymous</span>
            <span className="text-xs text-gray-400 ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-800 dark:text-gray-200 mb-1">{comment.body}</div>
          {/* Optionally: add upvote/downvote for comments here */}
          {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, level + 1)}
        </div>
      ))}
    </div>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInHours < 48) {
      return '1d';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const reportReasons = [
    'Spam',
    'Harassment',
    'Hate speech',
    'Inappropriate content',
    'Self harm',
    'Intellectual property violation',
    'Other',
  ];
  

  return (
    <article className="bg-white dark:bg-gray-800 shadow-md p-4 transition-colors duration-200">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-black dark:text-white font-bold text-lg">
            {post.newUsername?.charAt(0).toUpperCase() || <FaUserCircle className="w-7 h-7 text-gray-400 dark:text-gray-500" />}
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-base">
            {post.newUsername || 'Anonymous'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{formatDate(post.createdAt)}</span>
          {post.tag && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${post.tag === 'Academic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'}`}>
              {post.tag}
            </span>
          )}
        </div>
        <div className="relative" ref={reportMenuRef}>
          <button 
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full"
            onClick={() => setShowReportMenu(!showReportMenu)}
            aria-label="More options"
          >
            <FiMoreHorizontal className="w-5 h-5" />
          </button>
          {showReportMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 focus:outline-none`} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <div className="py-1" role="none">
                {reportReasons.map(reason => (
                  <button
                    key={reason}
                    onClick={() => handleReport(reason)}
                    className={`block w-full text-left px-4 py-2 text-sm ${currentTheme === 'dark' ? 'text-gray-300 hover:bg-gray-600 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                    role="menuitem"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Post Content */}
      <div className="text-gray-800 dark:text-gray-300 mb-3">
        <h3 className="font-bold text-lg mb-1">{post.title}</h3>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{post.content}</p>
      </div>
      {/* Action Row */}
      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs border-t pt-2 mt-2">
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            className="flex items-center space-x-1 hover:text-red-500 transition-colors"
          >
            {isLiked ? (
              <FaHeart className="w-4 h-4 text-red-500" />
            ) : (
              <FaRegHeart className="w-4 h-4" />
            )}
            <span className="font-semibold">{likeCount}</span>
          </button>
          <button
            onClick={handleDislike}
            className="flex items-center space-x-1 hover:text-gray-500 transition-colors"
          >
            <FaRegThumbsDown className="w-4 h-4" />
            <span className="font-semibold">{dislikeCount}</span>
          </button>
          <button 
            onClick={() => setShowComments(v => !v)}
            className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
          >
            <FaRegComment className="w-4 h-4" />
            <span>{post.commentsCount || 0}</span>
          </button>
        </div>
      </div>
      {/* Comments Section */}
      {showComments && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm mb-2">Comments</h4>
          {loadingComments ? (
            <div className="text-xs text-gray-400">Loading comments...</div>
          ) : (
            comments.length > 0 ? renderComments(comments) : <div className="text-xs text-gray-400">No comments yet.</div>
          )}
          <form onSubmit={handleAddComment} className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              className="flex-1 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              disabled={submittingComment}
            />
            <button
              type="submit"
              className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-50"
              disabled={submittingComment || !newComment.trim()}
            >
              {submittingComment ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

export default Post;
