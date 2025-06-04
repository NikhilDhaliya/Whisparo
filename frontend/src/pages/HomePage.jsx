import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';
import Post from '../components/posts/Post';
import { FaPlus } from "react-icons/fa";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('latest');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/posts`, {
        params: {
          page,
          limit: 10,
          filter
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
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts();
  }, [filter]);

  return (
    <div className="max-w-threads mx-auto bg-threads-white dark:bg-threads-black min-h-screen text-threads-gray-900 dark:text-threads-white">
      {/* Header */}
      <div className="sticky top-16 z-10 bg-threads-white dark:bg-threads-black border-b border-threads-gray-200 dark:border-threads-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center space-x-2">
            <button 
              className={`px-4 py-1.5 rounded-full text-[15px] font-medium transition-colors ${
                filter === 'latest' 
                  ? 'bg-threads-gray-900 dark:bg-threads-white text-threads-white dark:text-threads-black' 
                  : 'bg-threads-gray-100 dark:bg-threads-gray-800 text-threads-gray-900 dark:text-threads-gray-100 hover:bg-threads-gray-200 dark:hover:bg-threads-gray-700'
              }`}
              onClick={() => setFilter('latest')}
            >
              Latest
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-[15px] font-medium transition-colors ${
                filter === 'trending' 
                  ? 'bg-threads-gray-900 dark:bg-threads-white text-threads-white dark:text-threads-black' 
                  : 'bg-threads-gray-100 dark:bg-threads-gray-800 text-threads-gray-900 dark:text-threads-gray-100 hover:bg-threads-gray-200 dark:hover:bg-threads-gray-700'
              }`}
              onClick={() => setFilter('trending')}
            >
              Trending
            </button>
          </div>

          {/* New Post Button */}
          <button
            onClick={() => setShowNewPostModal(true)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-threads-gray-900 dark:bg-threads-white text-threads-white dark:text-threads-black hover:opacity-90 transition-opacity"
          >
            <FaPlus className="w-4 h-4" />
          </button>
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
              No more posts to load
            </div>
          }
        >
          {posts.map((post) => (
            <Post key={`${post.id}-${post.createdAt}`} post={post} />
          ))}
        </InfiniteScroll>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-threads-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-threads-white dark:bg-threads-gray-900 rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-semibold text-threads-gray-900 dark:text-threads-white">New Post</h2>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-threads-gray-500 hover:text-threads-gray-700 dark:text-threads-gray-400 dark:hover:text-threads-gray-200"
              >
                ✕
              </button>
            </div>
            {/* Add form here */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full px-4 py-2 rounded-lg bg-threads-gray-100 dark:bg-threads-gray-800 border border-threads-gray-200 dark:border-threads-gray-700 text-threads-gray-900 dark:text-threads-white placeholder-threads-gray-500 dark:placeholder-threads-gray-400 focus:outline-none focus:ring-2 focus:ring-threads-blue-500"
              />
              <textarea
                placeholder="What's on your mind?"
                rows="4"
                className="w-full px-4 py-2 rounded-lg bg-threads-gray-100 dark:bg-threads-gray-800 border border-threads-gray-200 dark:border-threads-gray-700 text-threads-gray-900 dark:text-threads-white placeholder-threads-gray-500 dark:placeholder-threads-gray-400 focus:outline-none focus:ring-2 focus:ring-threads-blue-500 resize-none"
              ></textarea>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-lg bg-threads-gray-100 dark:bg-threads-gray-800 text-threads-gray-900 dark:text-threads-white hover:bg-threads-gray-200 dark:hover:bg-threads-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-threads-blue-500 text-threads-white hover:bg-threads-blue-600 transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;