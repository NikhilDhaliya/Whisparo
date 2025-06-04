import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Assuming the backend gets authorEmail from session/cookie via middleware
      const response = await axios.post('http://localhost:5000/api/posts/create', 
        { title, body, category },
        { withCredentials: true }
      );
      
      // Handle successful post creation
      console.log('Post created successfully:', response.data);
      // Navigate to home page or the newly created post
      navigate('/'); 

    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-threads-white dark:bg-threads-black rounded-lg shadow-md text-threads-gray-900 dark:text-threads-white">
      <h2 className="text-2xl font-semibold mb-6 text-center">Create New Post</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-threads-red-50 text-threads-red-500 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-threads-gray-200 dark:border-threads-gray-700 rounded-md bg-threads-gray-100 dark:bg-threads-gray-800 text-threads-gray-900 dark:text-threads-white placeholder-threads-gray-500 dark:placeholder-threads-gray-400 focus:outline-none focus:ring-threads-blue-500 focus:border-threads-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-1">
            Content
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows="6"
            className="w-full px-3 py-2 border border-threads-gray-200 dark:border-threads-gray-700 rounded-md bg-threads-gray-100 dark:bg-threads-gray-800 text-threads-gray-900 dark:text-threads-white placeholder-threads-gray-500 dark:placeholder-threads-gray-400 focus:outline-none focus:ring-threads-blue-500 focus:border-threads-blue-500 resize-none"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-threads-gray-200 dark:border-threads-gray-700 rounded-md bg-threads-gray-100 dark:bg-threads-gray-800 text-threads-gray-900 dark:text-threads-white placeholder-threads-gray-500 dark:placeholder-threads-gray-400 focus:outline-none focus:ring-threads-blue-500 focus:border-threads-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full px-4 py-2 rounded-md text-white font-semibold transition-colors ${
            loading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage; 