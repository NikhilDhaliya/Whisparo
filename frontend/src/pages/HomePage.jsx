import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';
import PostList from '../components/home/PostList';
import IconButton from '../components/common/IconButton';
import { postService } from '../utils/api';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getPosts(pageNum);
      
      if (response.posts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prevPosts => {
          if (shouldRefresh) {
            return response.posts;
          }
          
          // Create a Set of existing post IDs
          const existingIds = new Set(prevPosts.map(post => post.id));
          
          // Filter out any duplicate posts
          const uniqueNewPosts = response.posts.filter(post => !existingIds.has(post.id));
          
          return [...prevPosts, ...uniqueNewPosts];
        });
        
        setHasMore(response.hasMore);
        if (!shouldRefresh) {
          setPage(prevPage => prevPage + 1);
        }
      }
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    await fetchPosts(1, true);
    setIsRefreshing(false);
  };

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page);
    }
  }, [loading, hasMore, page, fetchPosts]);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        === document.documentElement.offsetHeight
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  // Pull-to-refresh functionality
  useEffect(() => {
    let startY = 0;
    let refreshThreshold = 100;
    let refreshing = false;
    
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const y = e.touches[0].clientY;
      const pullDistance = y - startY;
      
      if (window.scrollY === 0 && pullDistance > 0 && !refreshing) {
        if (pullDistance > refreshThreshold) {
          refreshing = true;
          handleRefresh();
        }
      }
    };
    
    const handleTouchEnd = () => {
      refreshing = false;
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div className="pb-4">
      <div className="flex justify-center py-3">
        <IconButton
          icon={
            <RefreshCcw 
              size={16} 
              className={isRefreshing ? 'animate-spin' : ''} 
            />
          }
          onClick={handleRefresh}
          disabled={isRefreshing}
          label="Refresh"
        />
      </div>
      <PostList 
        posts={posts} 
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default HomePage; 