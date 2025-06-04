import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './PostCard';

const PostList = ({ posts, highlightedPostIds = [] }) => {
  const [localPosts, setLocalPosts] = useState(posts);
  
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);
  
  const handleUpvote = (postId) => {
    setLocalPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          // If already upvoted, remove the upvote
          if (post.userVote === 'up') {
            return {
              ...post,
              upvotes: post.upvotes - 1,
              userVote: null,
            };
          }
          
          // If downvoted, switch to upvote
          if (post.userVote === 'down') {
            return {
              ...post,
              upvotes: post.upvotes + 1,
              downvotes: post.downvotes - 1,
              userVote: 'up',
            };
          }
          
          // If not voted, add upvote
          return {
            ...post,
            upvotes: post.upvotes + 1,
            userVote: 'up',
          };
        }
        return post;
      })
    );
  };
  
  const handleDownvote = (postId) => {
    setLocalPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          // If already downvoted, remove the downvote
          if (post.userVote === 'down') {
            return {
              ...post,
              downvotes: post.downvotes - 1,
              userVote: null,
            };
          }
          
          // If upvoted, switch to downvote
          if (post.userVote === 'up') {
            return {
              ...post,
              upvotes: post.upvotes - 1,
              downvotes: post.downvotes + 1,
              userVote: 'down',
            };
          }
          
          // If not voted, add downvote
          return {
            ...post,
            downvotes: post.downvotes + 1,
            userVote: 'down',
          };
        }
        return post;
      })
    );
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
      <AnimatePresence>
        {localPosts.map((post) => (
          <motion.div key={post.id} variants={item}>
            <PostCard
              post={post}
              isHighlighted={highlightedPostIds.includes(post.id)}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostList; 