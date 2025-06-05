import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/home/PostCard';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const TrendingPage = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const response = await axios.get(`${API_URL}/posts/trending`);
        setTrendingPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch trending posts');
        setLoading(false);
        console.error('Error fetching trending posts:', err);
      }
    };

    fetchTrendingPosts();
  }, []);

  const handlePostDeleted = (deletedPostId) => {
    setTrendingPosts(posts => posts.filter(post => post.id !== deletedPostId));
  };

  const handlePostUpdated = (updatedPost) => {
    setTrendingPosts(posts => 
      posts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Trending Posts</h1>
      <div className="space-y-6">
        {trendingPosts.length === 0 ? (
          <div className="text-center text-gray-500">
            No trending posts at the moment
          </div>
        ) : (
          trendingPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserEmail={user?.email}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TrendingPage; 