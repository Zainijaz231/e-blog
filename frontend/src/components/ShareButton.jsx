import { useState } from 'react';

const ShareButton = ({ postId, initialCount = 0, onShare }) => {
    const [shareCount, setShareCount] = useState(initialCount);
    const [isShared, setIsShared] = useState(false);

    const handleShare = () => {
        // Toggle share state
        const newSharedState = !isShared;
        setIsShared(newSharedState);
        setShareCount(prev => newSharedState ? prev + 1 : prev - 1);
        
        // Call parent function if provided (for API call)
        if (onShare) {
            onShare(postId, newSharedState);
        }
    };

    return (
        <button 
            onClick={handleShare}
            className={`flex items-center space-x-2 transition-colors duration-200 ${
                isShared 
                    ? 'text-green-500 hover:text-green-600' 
                    : 'text-gray-600 hover:text-green-500'
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" 
                />
            </svg>
            <span className="text-sm font-medium">{shareCount}</span>
        </button>
    );
};

export default ShareButton;