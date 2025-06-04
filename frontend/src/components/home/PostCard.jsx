import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import IconButton from '../common/IconButton';
import CategoryBadge from '../common/CategoryBadge';
import { formatRelativeTime, formatVoteCount } from '../../utils/helpers';

const PostCard = ({
  post,
  isHighlighted = false,
  onUpvote,
  onDownvote,
}) => {
  const handleUpvote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUpvote) onUpvote(post.id);
  };
  
  const handleDownvote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDownvote) onDownvote(post.id);
  };

  const handleComment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement comment functionality
  };
  
  const voteCount = post.likes - post.dislikes;
  const userVote = post.userVote || null;
  
  return (
    <Card
      className={`mb-3 transition-all duration-200 ${
        isHighlighted ? 'border-2 border-indigo-200 shadow-md' : ''
      }`}
      hover
    >
      <div className="flex items-center mb-2">
        <Avatar username={post.newUsername || post.username} size="sm" />
        <div className="ml-2 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">
              {post.newUsername || post.username}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formatRelativeTime(new Date(post.createdAt || post.timestamp))}
              </span>
              {isHighlighted && (
                <span className="text-lg" aria-label="Trending">🔥</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-gray-800 mb-3">
        {post.title && (
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
        )}
        <p className="whitespace-pre-wrap break-words">{post.content}</p>
      </div>
      
      <div className="flex items-center justify-between">
        {post.category && <CategoryBadge category={post.category} />}
        
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <IconButton
              icon={<ChevronUp size={18} />}
              onClick={handleUpvote}
              size="sm"
              variant="ghost"
              active={userVote === 'upvote'}
              label="Upvote"
              className={userVote === 'upvote' ? 'text-green-600' : ''}
            />
            <span className={`text-sm mx-1 font-medium ${
              userVote === 'upvote' 
                ? 'text-green-600' 
                : userVote === 'downvote' 
                  ? 'text-red-600' 
                  : 'text-gray-600'
            }`}>
              {formatVoteCount(voteCount)}
            </span>
            <IconButton
              icon={<ChevronDown size={18} />}
              onClick={handleDownvote}
              size="sm"
              variant="ghost"
              active={userVote === 'downvote'}
              label="Downvote"
              className={userVote === 'downvote' ? 'text-red-600' : ''}
            />
          </div>
          
          <IconButton
            icon={<MessageSquare size={16} />}
            onClick={handleComment}
            size="sm"
            variant="ghost"
            label="Comment"
          />
        </div>
      </div>
    </Card>
  );
};

export default PostCard; 