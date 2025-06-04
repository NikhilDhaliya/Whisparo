import React from 'react';
import CategoryBadge from '../common/CategoryBadge';

const CategorySelect = ({ value, onChange }) => {
  const categories = [
    { id: 'tech', label: 'Tech' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'books', label: 'Books' },
    { id: 'food', label: 'Food' },
    { id: 'general', label: 'General' }
  ];
  
  return (
    <div className="flex items-center gap-2">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`
            transition-opacity duration-200
            ${value === category.id ? 'opacity-100' : 'opacity-50 hover:opacity-75'}
          `}
        >
          <CategoryBadge category={category.id} />
        </button>
      ))}
    </div>
  );
};

export default CategorySelect; 