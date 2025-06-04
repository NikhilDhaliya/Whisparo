import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import PostList from '../components/home/PostList';
import { mockPosts } from '../data/mockData';
import IconButton from '../components/common/IconButton';

const HomePage = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Shuffle the posts to simulate new content
      const shuffled = [...mockPosts].sort(() => 0.5 - Math.random());
      setPosts(shuffled);
      setIsRefreshing(false);
    }, 1000);
  };
  
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
      
      // Only trigger if at the top of the page and pulling down
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
      <PostList posts={posts} />
    </div>
  );
};

export default HomePage; 