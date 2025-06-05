/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { FaThumbsUp, FaComment, FaEdit, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import CommentList from './comments/CommentList';

const PostCard = ({ post, onVote, onComment, onEdit, onDelete, isProfilePage = false }) => {
  const [showComments, setShowComments] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (postId, voteType) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await onVote(postId, voteType);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleComment = (postId) => {
    setShowComments(true);
    if (onComment) {
      onComment(postId);
    }
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  // Get the username from either newUsername or authorUsername
  const displayUsername = post.newUsername || post.authorUsername || 'Anonymous';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {displayUsername.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {displayUsername}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {post.category}
              </span>
              {isProfilePage && (
                <>
                  <button
                    onClick={() => onEdit(post)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(post._id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{post.body}</p>
          {post.image?.url && (
            <div className="mt-4">
              <img
                src={post.image.url}
                alt="Post attachment"
                className="max-h-96 w-full object-contain rounded-lg"
              />
            </div>
          )}
          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={() => handleVote(post._id, 'upvote')}
              disabled={isVoting}
              className={`flex items-center space-x-1 ${
                post.userVote === 'upvote'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaThumbsUp className="w-5 h-5" />
              <span>{post.votes?.upvotes || 0}</span>
            </button>
            <button
              onClick={() => handleComment(post._id)}
              className={`flex items-center space-x-1 ${
                showComments ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <FaComment className="w-5 h-5" />
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <CommentList 
            postId={post._id} 
            isOpen={showComments}
            onClose={handleCloseComments}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostCard; 