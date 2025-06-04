import React from 'react';
import PostList from '../components/home/PostList';
import { mockPosts } from '../data/mockData';

const TrendingPage = () => {
  // Sort posts by upvotes to show trending content
  const trendingPosts = [...mockPosts].sort((a, b) => 
    (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
  );
  
  // Get top 3 trending post IDs
  const trendingPostIds = trendingPosts
    .slice(0, 3)
    .map(post => post.id);
  
  return (
    <div className="pb-4">
      <PostList 
        posts={trendingPosts} 
        highlightedPostIds={trendingPostIds}
      />
    </div>
  );
};

export default TrendingPage; 