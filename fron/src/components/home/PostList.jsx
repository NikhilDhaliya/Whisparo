/* eslint-disable no-unused-vars */
import React from 'react';
import PostCard from './PostCard';

const PostList = ({ posts, currentUserEmail, onPostDeleted, onPostUpdated }) => {
    return (
        <div className="space-y-4">
            {posts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No posts yet.</div>
            ) : (
                posts.map(post => (
                    <PostCard key={post.id} post={post} currentUserEmail={currentUserEmail} onPostDeleted={onPostDeleted} onPostUpdated={onPostUpdated} />
                ))
            )}
        </div>
    );
};

export default PostList;