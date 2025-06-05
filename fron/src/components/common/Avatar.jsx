import React from 'react';

const Avatar = ({ username, email, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-7 h-7 text-base',
    lg: 'w-9 h-9 text-lg'
  };
  
  // Generate a consistent color based on username
  const getColor = (text) => {
    if (!text) return 'bg-gray-100 text-gray-600';
    
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600'
    ];
    
    const index = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };
  
  // Get initials from username
  const getInitials = (text) => {
    if (!text) return '?';
    
    // Split by common separators and get first letter of each part
    return text
      .split(/[\s._-]/)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const displayText = username || email || '';
  
  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        ${getColor(displayText)}
        flex items-center justify-center
        font-medium
      `}
    >
      {getInitials(displayText)}
    </div>
  );
};

export default Avatar; 