import { useState } from 'react';

const CommentButton = ({ postId, initialCount = 0, onComment }) => {
    const [commentCount, setCommentCount] = useState(initialCount);
    const [showComments, setShowComments] = useState(false);

    const handleCommentClick = () => {
        setShowComments(!showComments);
        
        // Call parent function if provided
        if (onComment) {
            onComment(postId, !showComments);
        }
    };

    return (
        <button 
            onClick={handleCommentClick}
            className={`flex items-center space-x-2 transition-colors duration-200 ${
                showComments 
                    ? 'text-blue-500 hover:text-blue-600' 
                    : 'text-gray-600 hover:text-blue-500'
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
            </svg>
            <span className="text-sm font-medium">{commentCount}</span>
        </button>
    );
};

export default CommentButton;