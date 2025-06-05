/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {React, useEffect, useState} from 'react'
import Avatar from '../common/Avatar'
import { FaThumbsUp, FaFlag, FaComment, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import CommentList from '../comments/CommentList'
import toast from 'react-hot-toast'

const PostCard = ({ post, currentUserEmail, onPostDeleted, onPostUpdated }) => {
  const {
    content,
    category,
    createdAt,
    likes: initialLikes,
    author,
    id: postId,
    commentsCount,
    authorEmail
  } = post;

  const [userVoteStatus, setUserVoteStatus] = useState(null);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isVoting, setIsVoting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleVote = async () => {
    if (isVoting) return;
    
    try {
      setIsVoting(true);
      
      const previousVoteStatus = userVoteStatus;
      
      if (previousVoteStatus === 'like') {
        setLikes(prev => prev - 1);
        setUserVoteStatus(null);
      } else {
        setLikes(prev => prev + 1);
        setUserVoteStatus('like');
      }

      const response = await axios.post(`/api/posts/${postId}/vote`);
      setLikes(response.data.likes);
      setUserVoteStatus(response.data.voteType);
      toast.success(previousVoteStatus === 'like' ? 'Vote removed' : 'Vote added');
    } catch (error) {
      toast.error('Failed to process vote');
      setUserVoteStatus(null);
      setLikes(initialLikes || 0);
    } finally {
      setIsVoting(false);
    }
  };

  const handleVoteStatus = async () => {
    try {
      const response = await axios.get(`/api/posts/${postId}/vote-status`);
      setUserVoteStatus(response.data.voteType);
    } catch (error) {
      console.error('Error fetching vote status:', error);
    }
  }

  useEffect(() => {
    handleVoteStatus();
  }, [postId]);

  const handleReport = async () => {
    try {
      await axios.post(`/api/posts/${postId}/report`);
      toast.success('Post reported successfully');
    } catch (error) {
      toast.error('Failed to report post');
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/api/posts/${postId}`);
      toast.success('Post deleted successfully');
      if (onPostDeleted) {
        onPostDeleted(postId);
      }
    } catch (error) {
      toast.error('Failed to delete post');
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleUpdate = async () => {
    if (editedContent.trim() === content.trim() || !editedContent.trim()) {
      setIsEditing(false);
      return;
    }
    try {
      setIsSaving(true);
      const response = await axios.put(`/api/posts/${postId}`, { body: editedContent });
      toast.success('Post updated successfully');
      if (onPostUpdated) {
        onPostUpdated(response.data.post);
      }
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };

  const isOwnedByUser = currentUserEmail && authorEmail === currentUserEmail;

  return (
    <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden'>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
                <Avatar email={post?.authorEmail} />
            <div>
              <span className="font-medium text-gray-900">{post?.newUsername || 'Anonymous'}</span>
              <span className="block text-xs text-gray-500">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            </div>
            </div>
          <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
            ) : (
          <div className="space-y-4">
            <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
            {post.image?.url && (
              <div className="mt-2">
                <img
                  src={post.image.url}
                  alt="Post attachment"
                  className="max-h-96 w-full object-contain rounded-lg"
                />
              </div>
            )}
        </div>
        )}
            </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
                  <button 
                      onClick={handleVote}
                      disabled={isVoting}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-all duration-200 ${
                        userVoteStatus === 'like' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
                      } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
              <FaThumbsUp className={`${userVoteStatus === 'like' ? 'text-blue-600' : ''}`} />
                      <span className="text-sm font-medium">{likes}</span>
                  </button>
                
                  <button 
                      onClick={() => setShowComments(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 transition-all duration-200"
                  >
              <FaComment />
                      <span className="text-sm">{commentsCount || 0}</span>
                  </button>
          </div>

          <div className="flex items-center space-x-2">
                {isOwnedByUser && !isEditing && (
              <>
                  <button 
                      onClick={handleEdit}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                  >
                  <FaEdit />
                  </button>
                   <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                  className={`p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 ${
                        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                  <FaTrash className={isDeleting ? 'animate-spin' : ''} />
                  </button>
              </>
                )}

                {isEditing && (
              <div className="flex items-center space-x-2">
                    <button
                      onClick={handleUpdate}
                      disabled={!editedContent.trim() || isSaving}
                  className={`flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors ${
                        !editedContent.trim() || isSaving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save
                    </>
                  )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}

                {!isEditing && (
                   <button 
                    onClick={handleReport}
                className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all duration-200"
                  >
                <FaFlag />
                  </button>
                )}
          </div>
            </div>
        </div>
        
        <CommentList 
            postId={postId} 
            isOpen={showComments} 
            onClose={() => setShowComments(false)} 
        />
    </div>
  )
}

export default PostCard