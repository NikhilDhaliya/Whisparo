/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
  const location = useLocation();
  const [title, setTitle] = useState('Whisparo');
  const [scrolled, setScrolled] = useState(false);
  
  // Update title based on current route
  useEffect(() => {
    const pathname = location.pathname;
    
    if (pathname === '/') {
      setTitle('Whisparo');
    } else if (pathname === '/trending') {
      setTitle('Trending');
    } else if (pathname === '/create') {
      setTitle('New Whisper');
    } else if (pathname === '/profile') {
      setTitle('Profile');
    }
  }, [location]);
  
  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-10 transition-colors duration-200 ${
        scrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/profile" className="p-2">
          <User size={20} className="text-gray-700" />
        </Link>
        
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        
        <button className="p-2">
          <Settings size={20} className="text-gray-700" />
        </button>
      </div>
    </motion.header>
  );
};

export default Header; 