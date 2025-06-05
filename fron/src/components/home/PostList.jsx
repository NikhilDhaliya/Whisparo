/* eslint-disable no-unused-vars */
import React from 'react';
import PostCard from './PostCard';
import { motion } from 'framer-motion';

const PostList = ({ posts, currentUserEmail, onPostDeleted, onPostUpdated }) => {
    return (
        <div className="space-y-4">
            {posts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                >
                    <div className="text-gray-400 bg-gray-50 p-6 rounded-2xl">
                        <p className="text-lg">No posts yet.</p>
                        <p className="text-sm mt-2">Be the first to share something!</p>
                    </div>
                </motion.div>
            ) : (
                posts.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <PostCard 
                            post={post} 
                            currentUserEmail={currentUserEmail} 
                            onPostDeleted={onPostDeleted} 
                            onPostUpdated={onPostUpdated} 
                        />
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default PostList;