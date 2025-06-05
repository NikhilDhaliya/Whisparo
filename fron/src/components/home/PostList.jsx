/* eslint-disable no-unused-vars */
import React from 'react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import PostCard from './PostCard'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = 'http://localhost:5000/api'

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/posts');
                // Ensure we have an array of posts with unique IDs
                if (response.data && Array.isArray(response.data)) {
                    setPosts(response.data);
                } else if (response.data && Array.isArray(response.data.posts)) {
                    setPosts(response.data.posts);
                } else {
                    setPosts([]);
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to load posts. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
                {error}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center text-gray-500 p-4">
                No posts yet. Be the first to share something!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {posts.map((post) => (
                    <motion.div
                        key={post._id || post.id || `post-${Math.random()}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <PostCard post={post} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default PostList