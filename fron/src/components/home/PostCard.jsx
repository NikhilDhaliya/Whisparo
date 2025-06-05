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
    setEditedContent(content); // Reset content
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
    <div className='h-auto w-full bg-white rounded-lg shadow-md p-5 flex flex-col hover:shadow-lg transition-shadow duration-300'>
        <div className="postHeader flex justify-between">
            <div className="user flex gap-2 items-center">
                <Avatar email={post?.authorEmail} />
                <span className="font-medium">{post?.newUsername || 'Anonymous'}</span>
            </div>
            <div className="timeStamp text-gray-500 text-sm">
                <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
        </div>
        <div className="postContent mt-2 px-2">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
              />
            ) : (
              <>
                <p className="text-gray-700">{content}</p>
                {post.image?.url && (
                  <div className="mt-4">
                    <img
                      src={post.image.url}
                      alt="Post attachment"
                      className="max-h-96 w-full object-contain rounded-lg"
                    />
                  </div>
                )}
              </>
            )}
        </div>
        <div className="postDetails flex justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="left">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                    {category}
                </span>
            </div>
            <div className="right flex gap-4 items-center">
                {!isEditing && (
                  <button 
                      onClick={handleVote}
                      disabled={isVoting}
                      className={`flex items-center gap-1 transition-all duration-200 ${
                        userVoteStatus === 'like' 
                          ? 'text-blue-500 scale-110' 
                          : 'text-gray-600 hover:text-blue-500 hover:scale-105'
                      } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                      <FaThumbsUp className="transition-transform duration-200" />
                      <span className="text-sm font-medium">{likes}</span>
                  </button>
                )}
                
                {!isEditing && (
                  <button 
                      onClick={() => setShowComments(true)}
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors duration-200"
                  >
                      <FaComment className="hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm">{commentsCount || 0}</span>
                  </button>
                )}

                {isOwnedByUser && !isEditing && (
                  <button 
                      onClick={handleEdit}
                      className="text-gray-600 hover:text-blue-500 transition-colors duration-200"
                  >
                      <FaEdit className="hover:scale-110 transition-transform duration-200" />
                  </button>
                )}

                {isOwnedByUser && !isEditing && (
                   <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={`text-gray-600 hover:text-red-500 transition-colors duration-200 ${
                        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                      <FaTrash className={`hover:scale-110 transition-transform duration-200 ${isDeleting ? 'animate-spin' : ''}`} />
                  </button>
                )}

                {isEditing && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={!editedContent.trim() || isSaving}
                      className={`flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors ${
                        !editedContent.trim() || isSaving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSaving ? 'Saving...' : ''} <FaSave /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                       className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}

                {!isEditing && (
                   <button 
                    onClick={handleReport}
                    className="text-gray-600 hover:text-yellow-500 transition-colors duration-200"
                  >
                      <FaFlag className="hover:scale-110 transition-transform duration-200" />
                  </button>
                )}
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