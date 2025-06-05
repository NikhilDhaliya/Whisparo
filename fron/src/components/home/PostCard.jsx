/* eslint-disable no-unused-vars */
import {React} from 'react'
import Avatar from '../common/Avatar'
import { FaThumbsUp, FaThumbsDown, FaFlag } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import { useState } from 'react'

const PostCard = ({ post }) => {
  const {
    content,
    category,
    createdAt,
    likes,
    dislikes,
    author
  } = post;

  const handleVote = async (type) => {
    try {
      await axios.post(`/api/posts/${post._id}/vote`, { voteType: type });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleReport = async () => {
    try {
      await axios.post(`/api/posts/${post._id}/report`);
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };

  return (
    <div className='h-auto w-full bg-white rounded-lg shadow-md p-5 flex flex-col hover:shadow-lg transition-shadow duration-300'>
        <div className="postHeader flex justify-between">
            <div className="user flex gap-2 items-center">
                <Avatar email={author?.email} />
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
                    onClick={() => handleVote('like')}
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors duration-200"
                >
                    <FaThumbsUp className="hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm">{likes || 0}</span>
                </button>
                <button 
                    onClick={() => handleVote('dislike')}
                    className="text-gray-600 hover:text-red-500 transition-colors duration-200"
                >
                    <FaThumbsDown className="hover:scale-110 transition-transform duration-200" />
                </button>
                <button 
                    onClick={handleReport}
                    className="text-gray-600 hover:text-yellow-500 transition-colors duration-200"
                >
                    <FaFlag className="hover:scale-110 transition-transform duration-200" />
                </button>
            </div>
        </div>
    </div>
  )
}

export default PostCard