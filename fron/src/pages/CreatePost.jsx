import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaImage, FaPaperPlane, FaSpinner, FaTimes, FaChevronLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_CHARACTERS = 500;

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('body', content);
      formData.append('category', category);
      if (image) {
        formData.append('image', image);
      }

      await axios.post('/api/posts/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Post created successfully');
      localStorage.removeItem('home_posts');
      navigate('/', { state: { refresh: true } });
    } catch (err) {
      console.error('Error creating post:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to create post';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'General', label: 'General Discussion' },
    { value: 'Question', label: 'Question' },
    { value: 'Discussion', label: 'Discussion' },
    { value: 'News', label: 'News' },
    { value: 'Tech', label: 'Technology' },
    { value: 'Fun', label: 'Fun & Entertainment' }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* iOS-style Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaChevronLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-lg font-semibold text-gray-900">New Post</h1>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={loading || !content.trim() || !category}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                loading || !content.trim() || !category
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {loading ? (
                <FaSpinner className="animate-spin w-4 h-4" />
              ) : (
                'Post'
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content Textarea */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CHARACTERS}
              rows="4"
              className="w-full px-4 py-3 text-lg border-none focus:ring-0 resize-none"
              placeholder="What's on your mind?"
            />
            <div className="absolute bottom-2 right-2 text-sm text-gray-500">
              {content.length}/{MAX_CHARACTERS}
            </div>
          </div>

          {/* Category Selector */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowCategoryPicker(true)}
              className="w-full px-4 py-2 text-left text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {category ? (
                <span className="font-medium text-gray-900">{categories.find(c => c.value === category)?.label}</span>
              ) : (
                <span>Select a category</span>
              )}
            </motion.button>
          </div>

          {/* Image Preview */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <FaTimes />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Upload Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-500 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-gray-500">
              <FaImage className="w-8 h-8 mb-2" />
              <span className="text-sm">Add photo</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </motion.button>
        </form>
      </div>

      {/* iOS-style Category Picker Modal */}
      <AnimatePresence>
        {showCategoryPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowCategoryPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-center">Select Category</h3>
              </div>
              <div className="p-4 space-y-2">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCategory(cat.value);
                      setShowCategoryPicker(false);
                    }}
                    className={`w-full px-4 py-3 text-left rounded-xl transition-colors ${
                      category === cat.value
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreatePost;
