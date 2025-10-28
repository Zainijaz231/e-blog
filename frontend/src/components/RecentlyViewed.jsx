import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authSore';

const RecentlyViewed = ({ className = "" }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [recentPosts, setRecentPosts] = useState([]);

    useEffect(() => {
        if (currentUser) {
            const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            setRecentPosts(recentlyViewed);
        }
    }, [currentUser]);

    const clearHistory = () => {
        localStorage.removeItem('recentlyViewed');
        setRecentPosts([]);
    };

    if (!currentUser || recentPosts.length === 0) {
        return null;
    }

    return (
        <div className={`bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden ${className}`}>
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Recently Viewed</span>
                    </h3>
                    <button
                        onClick={clearHistory}
                        className="text-xs text-gray-500 hover:text-red-500 transition-colors font-medium"
                        title="Clear history"
                    >
                        Clear
                    </button>
                </div>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                    {recentPosts.map((post, index) => (
                        <div
                            key={post._id}
                            onClick={() => navigate(`/post/${post._id}`)}
                            className="group flex items-center space-x-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-purple-200"
                        >
                            <div className="relative">
                                <img
                                    src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author?.name}&background=6366f1&color=fff&size=40`}
                                    alt={post.author?.name}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-purple-300 transition-all"
                                />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 border-2 border-white rounded-full"></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors truncate text-sm">
                                    {post.title}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-gray-500">by {post.author?.name}</span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(post.viewedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecentlyViewed;