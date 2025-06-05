import { useState } from 'react';
import axios from 'axios';

const CommentForm = ({ postId, parentCommentId = null, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await axios.post(`/api/comments/posts/${postId}`, {
        body: comment,
        parentCommentId
      });

      setComment('');
      if (onCommentAdded) {
        onCommentAdded(response.data.comment);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="2"
        />
        <button
          type="submit"
          disabled={!comment.trim() || isSubmitting}
          className={`px-4 py-2 rounded-lg text-white font-medium ${
            !comment.trim() || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm; 