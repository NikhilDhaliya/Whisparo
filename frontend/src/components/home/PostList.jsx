import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './PostCard';
import { postService } from '../../utils/api';

const PostList = ({ 
  posts, 
  highlightedPostIds = [],
  onLoadMore,
  hasMore,
  loading,
  error 
}) => {
  const [localPosts, setLocalPosts] = useState(posts);
  
  // Update local posts when props change
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Memoize the sorted posts to prevent unnecessary re-renders
  const sortedPosts = useMemo(() => {
    return [...localPosts].sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp);
    });
  }, [localPosts]);
  
  const handleUpvote = async (postId) => {
    try {
      await postService.votePost(postId, 'upvote');
      setLocalPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            // If already upvoted, remove the upvote
            if (post.userVote === 'upvote') {
              return {
                ...post,
                likes: post.likes - 1,
                userVote: null,
              };
            }
            
            // If downvoted, switch to upvote
            if (post.userVote === 'downvote') {
              return {
                ...post,
                likes: post.likes + 1,
                dislikes: post.dislikes - 1,
                userVote: 'upvote',
              };
            }
            
            // If not voted, add upvote
            return {
              ...post,
              likes: post.likes + 1,
              userVote: 'upvote',
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };
  
  const handleDownvote = async (postId) => {
    try {
      await postService.votePost(postId, 'downvote');
      setLocalPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            // If already downvoted, remove the downvote
            if (post.userVote === 'downvote') {
              return {
                ...post,
                dislikes: post.dislikes - 1,
                userVote: null,
              };
            }
            
            // If upvoted, switch to downvote
            if (post.userVote === 'upvote') {
              return {
                ...post,
                likes: post.likes - 1,
                dislikes: post.dislikes + 1,
                userVote: 'downvote',
              };
            }
            
            // If not voted, add downvote
            return {
              ...post,
              dislikes: post.dislikes + 1,
              userVote: 'downvote',
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };
  
  return (
    <motion.div
      className="px-4 py-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence mode="popLayout">
        {sortedPosts.map((post) => (
          <motion.div 
            key={post.id} 
            variants={item}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <PostCard
              post={post}
              isHighlighted={highlightedPostIds.includes(post.id)}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      {!loading && !error && !hasMore && sortedPosts.length > 0 && (
        <div className="text-center text-gray-500 py-4">
          No more posts to load
        </div>
      )}

      {!loading && !error && sortedPosts.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No posts yet. Be the first to post!
        </div>
      )}
    </motion.div>
  );
};

export default PostList; 