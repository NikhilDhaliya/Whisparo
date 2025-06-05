import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="What's on your mind?"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                <option value="General">General</option>
                <option value="Question">Question</option>
                <option value="Discussion">Discussion</option>
                <option value="News">News</option>
              </select>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Image (optional)
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
