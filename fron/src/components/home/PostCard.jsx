import {React} from 'react'
import Avatar from '../common/Avatar'
import { FaThumbsUp, FaThumbsDown, FaFlag } from 'react-icons/fa'

const PostCard = () => {
  return (
    <div className='h-40 w-full bg-white rounded-lg shadow-md p-5 flex flex-col hover:shadow-lg transition-shadow duration-300'>
        <div className="postHeader flex justify-between">
            <div className="user flex gap-2 items-center">
                <Avatar/>
                <span className="font-medium">Anonymous</span>
            </div>
            <div className="timeStamp text-gray-500 text-sm">
                <span>1h</span>
            </div>
        </div>
        <div className="postContent mt-2 px-2">
            <p className="text-gray-700">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Earum, dolorem?</p>
        </div>
        <div className="postDetails flex justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="left">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">Work</span>
            </div>
            <div className="right flex gap-4 items-center">
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors duration-200">
                    <FaThumbsUp className="hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm">2</span>
                </button>
                <button className="text-gray-600 hover:text-red-500 transition-colors duration-200">
                    <FaThumbsDown className="hover:scale-110 transition-transform duration-200" />
                </button>
                <button className="text-gray-600 hover:text-yellow-500 transition-colors duration-200">
                    <FaFlag className="hover:scale-110 transition-transform duration-200" />
                </button>
            </div>
        </div>
    </div>
  )
}

export default PostCard