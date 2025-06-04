import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Card from '../components/common/Card';
import IconButton from '../components/common/IconButton';
import CategorySelect from '../components/create/CategorySelect';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Post created:', { title, content, category });
      setIsSubmitting(false);
      // Reset form
      setTitle('');
      setContent('');
      setCategory('general');
    }, 1000);
  };
  
  return (
    <div className="pb-4">
      <div className="flex items-center mb-4">
        <IconButton
          icon={<ArrowLeft size={18} />}
          variant="ghost"
          label="Back"
          onClick={() => window.history.back()}
        />
        <h1 className="text-xl font-semibold ml-2">Create Post</h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter post title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
                placeholder="Write your post content here..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <CategorySelect value={category} onChange={setCategory} />
            </div>
            
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-2 px-4 rounded-md text-white font-medium
                ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}
                transition-colors duration-200
              `}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </motion.button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePostPage; 