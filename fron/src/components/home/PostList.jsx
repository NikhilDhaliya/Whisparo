/* eslint-disable no-unused-vars */
import React from 'react';
import PostCard from './PostCard';
import { motion } from 'framer-motion';

const PostList = ({ 
    posts, 
    currentUserEmail, 
    onPostDeleted, 
    onPostUpdated,
    onCommentClick 
}) => {
    if (posts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-500"
            >
                No posts yet. Be the first to post!
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUserEmail={currentUserEmail}
                    onPostDeleted={onPostDeleted}
                    onPostUpdated={onPostUpdated}
                    onCommentClick={onCommentClick}
                />
            ))}
        </div>
    );
};

export default PostList;