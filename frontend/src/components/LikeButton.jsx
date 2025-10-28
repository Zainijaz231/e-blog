import { useState } from 'react';
import { toggleLike } from '../api/postApi';

const LikeButton = ({ postId, initialLiked = false, initialCount = 0, onLike }) => {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialCount);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = async () => {
        if (isLoading) return; // Prevent multiple clicks
        
        setIsLoading(true);
        
        // Optimistic update
        const newLikedState = !isLiked;
        const previousLiked = isLiked;
        const previousCount = likeCount;
        
        setIsLiked(newLikedState);
        setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
        
        try {
            await toggleLike(postId);
            
            // Call parent function if provided
            if (onLike) {
                onLike(postId, newLikedState);
            }
        } catch (error) {
            // Revert optimistic update on error
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
            
            console.error('Failed to toggle like:', error);
            
            // Show appropriate error message based on error type
            let errorMessage = 'Failed to update like. Please try again.';
            if (error.response?.status === 401) {
                errorMessage = 'Please login to like posts.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Post not found.';
            }
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            errorDiv.textContent = errorMessage;
            document.body.appendChild(errorDiv);
            setTimeout(() => document.body.removeChild(errorDiv), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center space-x-2 transition-colors duration-200 ${
                isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isLiked 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-gray-600 hover:text-red-500'
            }`}
        >
            {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg 
                    className="w-5 h-5" 
                    fill={isLiked ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                </svg>
            )}
            <span className="text-sm font-medium">{likeCount}</span>
        </button>
    );
};

export default LikeButton;