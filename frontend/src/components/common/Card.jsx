import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false }) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm p-4';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  
  const Component = hover ? motion.div : 'div';
  const props = hover ? {
    whileHover: { y: -2 },
    transition: { duration: 0.2 }
  } : {};
  
  return (
    <Component
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card; 