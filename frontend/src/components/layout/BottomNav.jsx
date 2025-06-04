import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaPlusSquare, FaUser } from "react-icons/fa";
import { RiFireFill } from "react-icons/ri";

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-threads-white dark:bg-threads-black border-t border-threads-gray-200 dark:border-threads-gray-800 shadow-md">
      <div className="max-w-md mx-auto flex justify-around items-center h-14">
        <NavLink 
          to="/"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive 
                ? 'text-threads-gray-900 dark:text-threads-white' 
                : 'text-threads-gray-500 dark:text-threads-gray-400 hover:text-threads-gray-700 dark:hover:text-threads-gray-300'
            }`
          }
        >
          <FaHome className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink 
          to="/trending"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive 
                ? 'text-threads-gray-900 dark:text-threads-white' 
                : 'text-threads-gray-500 dark:text-threads-gray-400 hover:text-threads-gray-700 dark:hover:text-threads-gray-300'
            }`
          }
        >
          <RiFireFill className="w-6 h-6" />
          <span className="text-[10px] font-medium">Trending</span>
        </NavLink>

        <NavLink 
          to="/create-post"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive 
                ? 'text-threads-gray-900 dark:text-threads-white' 
                : 'text-threads-gray-500 dark:text-threads-gray-400 hover:text-threads-gray-700 dark:hover:text-threads-gray-300'
            }`
          }
        >
          <FaPlusSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">Create</span>
        </NavLink>

        <NavLink 
          to="/profile"
          className={({ isActive }) => 
            `flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive 
                ? 'text-threads-gray-900 dark:text-threads-white' 
                : 'text-threads-gray-500 dark:text-threads-gray-400 hover:text-threads-gray-700 dark:hover:text-threads-gray-300'
            }`
          }
        >
          <FaUser className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav; 