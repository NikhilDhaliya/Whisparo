import { useState, useEffect } from 'react';
import PostList from '../components/home/PostList';
import axios from 'axios';
import { FaSyncAlt } from 'react-icons/fa';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/posts');
      // Shuffle the posts array randomly
      const shuffledPosts = response.data.posts.sort(() => Math.random() - 0.5);
      setPosts(shuffledPosts);
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]); // Depend on refreshTrigger

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-4 container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Whisparo Feed</h1>
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          <FaSyncAlt className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {loading && <div className="text-center">Loading posts...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      {!loading && !error && <PostList posts={posts} />}
    </div>
  );
};

export default HomePage;