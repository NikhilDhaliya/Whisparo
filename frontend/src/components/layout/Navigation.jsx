import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, PlusCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/trending', icon: TrendingUp, label: 'Trending' },
    { path: '/create', icon: PlusCircle, label: 'Create' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];
  
  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-full ${
                  isActive ? 'text-indigo-600' : 'text-gray-500'
                }`}
              >
                <Icon size={24} />
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
              <span className={`text-xs mt-0.5 ${
                isActive ? 'text-indigo-600 font-medium' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default Navigation; 