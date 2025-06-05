<div className="bg-white rounded-lg shadow-md p-6">
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
        {post.authorUsername?.charAt(0).toUpperCase() || 'A'}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {post.newUsername || 'Anonymous'}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {post.category}
        </span>
      </div>
      <p className="mt-2 text-gray-700 whitespace-pre-wrap">{post.body}</p>
      {post.image?.url && (
        <div className="mt-4">
          <img
            src={post.image.url}
            alt="Post attachment"
            className="max-h-96 w-full object-contain rounded-lg"
          />
        </div>
      )}
      <div className="mt-4 flex items-center space-x-4">
        <button
          onClick={() => handleVote(post._id, 'upvote')}
          className={`flex items-center space-x-1 ${
            post.userVote === 'upvote'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
          <span>{post.votes?.upvotes || 0}</span>
        </button>
        <button
          onClick={() => handleVote(post._id, 'downvote')}
          className={`flex items-center space-x-1 ${
            post.userVote === 'downvote'
              ? 'text-red-600'
              : 'text-gray-500 hover:text-red-600'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span>{post.votes?.downvotes || 0}</span>
        </button>
        <button
          onClick={() => handleComment(post._id)}
          className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{post.comments?.length || 0}</span>
        </button>
      </div>
    </div>
  </div>
</div> 