import React from 'react';

const CategoryBadge = ({ category }) => {
  const categoryStyles = {
    tech: 'bg-blue-100 text-blue-600',
    lifestyle: 'bg-green-100 text-green-600',
    books: 'bg-purple-100 text-purple-600',
    food: 'bg-yellow-100 text-yellow-600',
    general: 'bg-gray-100 text-gray-600'
  };
  
  const getCategoryLabel = (cat) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };
  
  return (
    <span
      className={`
        px-2 py-1
        rounded-full
        text-xs
        font-medium
        ${categoryStyles[category] || categoryStyles.general}
      `}
    >
      {getCategoryLabel(category)}
    </span>
  );
};

export default CategoryBadge; 