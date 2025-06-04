import React from 'react';
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
  const handleUpvote = () => {
    if (onUpvote) onUpvote(post.id);
  };
  
  const handleDownvote = () => {
    if (onDownvote) onDownvote(post.id);
  };
  
  return (
    <Card
      className={`mb-3 ${isHighlighted ? 'border-2 border-indigo-200' : ''}`}
      hover
    >
      <div className="flex items-center mb-2">
        <Avatar username={post.username} size="sm" />
        <div className="ml-2 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">{post.username}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formatRelativeTime(post.timestamp)}
              </span>
              {isHighlighted && (
                <span className="text-lg" aria-label="Trending">🔥</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-800 mb-3">{post.content}</p>
      
      <div className="flex items-center justify-between">
        <CategoryBadge category={post.category} />
        
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <IconButton
              icon={<ChevronUp size={18} />}
              onClick={handleUpvote}
              size="sm"
              variant="ghost"
              active={post.userVote === 'up'}
              label="Upvote"
            />
            <span className={`text-sm mx-1 font-medium ${
              post.userVote === 'up' 
                ? 'text-green-600' 
                : post.userVote === 'down' 
                  ? 'text-red-600' 
                  : 'text-gray-600'
            }`}>
              {formatVoteCount(post.upvotes - post.downvotes)}
            </span>
            <IconButton
              icon={<ChevronDown size={18} />}
              onClick={handleDownvote}
              size="sm"
              variant="ghost"
              active={post.userVote === 'down'}
              label="Downvote"
            />
          </div>
          
          <IconButton
            icon={<MessageSquare size={16} />}
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