import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';
import Post from '../components/posts/Post';

const TrendingPage = () => {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/posts`, {
        params: {
          page,
          limit: 10,
          filter: 'trending' // Fetch trending posts
        },
        withCredentials: true
      });
      
      const { posts: newPosts, hasMore: morePosts } = response.data;
      
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(post => post.id));
          const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
          return [...prevPosts, ...uniqueNewPosts];
        });
        setPage(prevPage => prevPage + 1);
        setHasMore(morePosts);
      }
    } catch (err) {
      setError('Failed to fetch trending posts');
      console.error('Error fetching trending posts:', err);
    }
  };

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts();
  }, []); // Fetch trending posts on mount

  return (
    <div className="max-w-threads mx-auto bg-threads-white dark:bg-threads-black min-h-screen text-threads-gray-900 dark:text-threads-white">
      {/* Header */}
      <div className="sticky top-16 z-10 bg-threads-white dark:bg-threads-black border-b border-threads-gray-200 dark:border-threads-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <h2 className="text-xl font-semibold">Trending Posts</h2>
          {/* Optionally add filter/sort options here if needed */}
        </div>
      </div>

      {error && (
        <div className="p-4 text-threads-red-500 bg-threads-red-50 dark:bg-threads-red-900/20 dark:text-threads-red-400 text-[15px]">
          {error}
        </div>
      )}

      {/* Posts Feed */}
      <div className="divide-y divide-threads-gray-200 dark:divide-threads-gray-800">
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchPosts}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-threads-gray-300 dark:border-threads-gray-600 border-t-threads-gray-900 dark:border-t-threads-white"></div>
            </div>
          }
          endMessage={
            <div className="text-center py-8 text-threads-gray-500 dark:text-threads-gray-400 text-[15px]">
              No more trending posts to load
            </div>
          }
        >
          {posts.map((post) => (
            <Post key={`${post.id}-${post.createdAt}`} post={post} />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default TrendingPage; 