import React from 'react';
import { motion } from 'framer-motion';

const IconButton = ({
  icon,
  onClick,
  disabled = false,
  loading = false,
  size = 'md',
  variant = 'default',
  label,
  className = '',
  type = 'button'
}) => {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };
  
  const variantClasses = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700',
    ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };
  
  const baseClasses = 'rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabledClasses}
        ${className}
      `}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          {icon}
        </motion.div>
      ) : (
        icon
      )}
    </motion.button>
  );
};

export default IconButton; 