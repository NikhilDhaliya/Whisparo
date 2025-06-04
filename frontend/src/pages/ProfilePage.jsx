import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, LogOut } from 'lucide-react';
import Card from '../components/common/Card';
import IconButton from '../components/common/IconButton';
import PostList from '../components/home/PostList';
import { mockPosts } from '../data/mockData';

const ProfilePage = () => {
  // Filter posts to show only user's posts
  const userPosts = mockPosts.filter(post => post.username === 'johndoe');
  
  return (
    <div className="pb-4">
      <Card className="mb-4">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <User size={32} className="text-indigo-600" />
          </div>
          
          <div className="ml-4 flex-1">
            <h2 className="text-lg font-semibold text-gray-800">John Doe</h2>
            <p className="text-sm text-gray-500">@johndoe</p>
          </div>
          
          <div className="flex gap-2">
            <IconButton
              icon={<Settings size={18} />}
              variant="ghost"
              label="Settings"
            />
            <IconButton
              icon={<LogOut size={18} />}
              variant="ghost"
              label="Logout"
            />
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-lg font-semibold text-gray-800">{userPosts.length}</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">1.2k</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">450</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>
        </div>
      </Card>
      
      <PostList posts={userPosts} />
    </div>
  );
};

export default ProfilePage; 