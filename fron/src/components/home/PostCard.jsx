/* eslint-disable no-unused-vars */
import {React, useEffect, useState} from 'react'
import Avatar from '../common/Avatar'
import { FaThumbsUp, FaFlag, FaComment } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import CommentList from '../comments/CommentList'

const PostCard = ({ post }) => {
  const {
    content,
    category,
    createdAt,
    likes: initialLikes,
    author,
    id: postId
  } = post;

  const [userVoteStatus, setUserVoteStatus] = useState(null);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isVoting, setIsVoting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleVote = async () => {
    if (isVoting) return; // Prevent multiple votes while processing
    
    try {
      setIsVoting(true);
      
      // Optimistic update
      const previousVoteStatus = userVoteStatus;
      
      // Update local state optimistically
      if (previousVoteStatus === 'like') {
        setLikes(prev => prev - 1);
        setUserVoteStatus(null);
      } else {
        setLikes(prev => prev + 1);
        setUserVoteStatus('like');
      }

      // Make API call
      const response = await axios.post(`/api/posts/${postId}/vote`);
      setLikes(response.data.likes);
      setUserVoteStatus(response.data.voteType);
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
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
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };

  return (
    <div className='h-auto w-full bg-white rounded-lg shadow-md p-5 flex flex-col hover:shadow-lg transition-shadow duration-300'>
        <div className="postHeader flex justify-between">
            <div className="user flex gap-2 items-center">
                <Avatar email={post?.newUsername} />
                <span className="font-medium">{post?.newUsername || 'Anonymous'}</span>
            </div>
            <div className="timeStamp text-gray-500 text-sm">
                <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
        </div>
        <div className="postContent mt-2 px-2">
            <p className="text-gray-700">{content}</p>
        </div>
        <div className="postDetails flex justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="left">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                    {category}
                </span>
            </div>
            <div className="right flex gap-4 items-center">
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
                <button 
                    onClick={() => setShowComments(true)}
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors duration-200"
                >
                    <FaComment className="hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm">{post.commentsCount || 0}</span>
                </button>
                <button 
                    onClick={handleReport}
                    className="text-gray-600 hover:text-yellow-500 transition-colors duration-200"
                >
                    <FaFlag className="hover:scale-110 transition-transform duration-200" />
                </button>
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