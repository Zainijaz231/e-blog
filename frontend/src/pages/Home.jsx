import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authSore';
import LikeButton from '../components/LikeButton';
import CommentButton from '../components/CommentButton';
import ShareButton from '../components/ShareButton';
import PostActions from '../components/PostActions';
import RecentlyViewed from '../components/RecentlyViewed';
import Layout from '../components/Layout';

const Home = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState('for-you');

    const fetchAllPosts = async () => {
        const res = await api.get('/post/');
        return res.data.posts || [];
    };

    const fetchFollowingPosts = async () => {
        try {
            const res = await api.get('/post/following');
            return res.data.posts || [];
        } catch (error) {
            console.error('Error fetching following posts:', error);
            return [];
        }
    };

    const { data: allPosts = [], isLoading: loadingAll } = useQuery({
        queryKey: ['all-posts'],
        queryFn: fetchAllPosts
    });

    const { data: followingPosts = [], isLoading: loadingFollowing } = useQuery({
        queryKey: ['following-posts'],
        queryFn: fetchFollowingPosts,
        enabled: activeTab === 'following' && !!currentUser
    });

    const posts = activeTab === 'for-you' ? allPosts : followingPosts;
    const isLoading = activeTab === 'for-you' ? loadingAll : loadingFollowing;

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {/* Enhanced Header */}
                            <div className="mb-8 text-center lg:text-left">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                                    Welcome to E-Blog
                                </h1>
                                <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0">
                                    Discover amazing stories, share your thoughts, and connect with a community of passionate writers
                                </p>
                            </div>

                            {/* Enhanced Tabs */}
                            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 mb-8">
                                <div className="flex border-b border-gray-100">
                                    <button
                                        onClick={() => setActiveTab('for-you')}
                                        className={`flex-1 px-6 py-4 text-center font-semibold text-base transition-all duration-300 rounded-tl-3xl ${
                                            activeTab === 'for-you'
                                                ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-500'
                                                : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                                        }`}
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span>For You</span>
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('following')}
                                        className={`flex-1 px-6 py-4 text-center font-semibold text-base transition-all duration-300 rounded-tr-3xl ${
                                            activeTab === 'following'
                                                ? 'text-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-500'
                                                : 'text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50'
                                        }`}
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>Following</span>
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Enhanced Posts Feed */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                                        <p className="text-gray-600 text-lg">Loading amazing content...</p>
                                    </div>
                                </div>
                            ) : posts.length > 0 ? (
                                <div className="space-y-8">
                                    {posts.map((post) => (
                                        <div key={post._id} className="group bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-3xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2">
                                            {/* Enhanced Post Header */}
                                            <div className="p-6 lg:p-8 pb-4">
                                                <div className="flex items-center space-x-4 mb-6">
                                                    <div className="relative">
                                                        <img
                                                            src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author?.name}&background=6366f1&color=fff&size=56`}
                                                            alt={post.author?.name}
                                                            className="w-14 h-14 rounded-full object-cover cursor-pointer ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all shadow-lg"
                                                            onClick={() => navigate(`/profile/${post.author?.username}`)}
                                                        />
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 
                                                            className="font-bold text-gray-900 cursor-pointer hover:text-blue-600 text-lg truncate group-hover:text-blue-600 transition-colors"
                                                            onClick={() => navigate(`/profile/${post.author?.username}`)}
                                                        >
                                                            {post.author?.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 truncate font-medium">
                                                            @{post.author?.username} • {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <PostActions post={post} showInDropdown={true} />
                                                </div>

                                                {/* Enhanced Post Content */}
                                                <div 
                                                    className="cursor-pointer"
                                                    onClick={() => navigate(`/post/${post._id}`)}
                                                >
                                                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 line-clamp-2">
                                                        {post.title}
                                                    </h2>
                                                    {post.description && (
                                                        <p className="text-gray-700 mb-6 line-clamp-3 text-lg leading-relaxed">{post.description}</p>
                                                    )}
                                                </div>

                                    {/* Post Images */}
                                    {post.images && post.images.length > 0 && (
                                        <div className={`grid gap-2 mb-4 cursor-pointer ${
                                            post.images.length === 1 ? 'grid-cols-1' :
                                            post.images.length === 2 ? 'grid-cols-2' :
                                            'grid-cols-2 md:grid-cols-3'
                                        }`}
                                        onClick={() => navigate(`/post/${post._id}`)}
                                        >
                                            {post.images.slice(0, 3).map((image, index) => (
                                                <div key={index} className="relative rounded-lg overflow-hidden">
                                                    <img
                                                        src={image}
                                                        alt={`Post image ${index + 1}`}
                                                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                                    />
                                                    {post.images.length > 3 && index === 2 && (
                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                            <span className="text-white font-semibold text-lg">
                                                                +{post.images.length - 3}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Post Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {post.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    +{post.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                            {/* Enhanced Post Actions */}
                                            <div className="px-6 lg:px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-8">
                                            {currentUser ? (
                                                <>
                                                    <LikeButton
                                                        postId={post._id}
                                                        initialCount={post.likes?.length || 0}
                                                        initialLiked={post.likes?.includes(currentUser._id) || false}
                                                    />
                                                    <CommentButton
                                                        postId={post._id}
                                                        initialCount={post.commentCount || 0}
                                                    />
                                                    <ShareButton
                                                        postId={post._id}
                                                        initialCount={post.shareCount || 0}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => navigate('/login')}
                                                        className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                                                    </button>
                                                    <div className="flex items-center space-x-2 text-gray-500">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">{post.commentCount || 0}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>{post.viewCount || 0} views</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
                                    <div className="text-8xl mb-6">✨</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        {activeTab === 'following' ? 'No posts from people you follow' : 'No posts yet'}
                                    </h3>
                                    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                                        {activeTab === 'following' 
                                            ? 'Follow some users to see their amazing content here' 
                                            : 'Be the first to share something amazing with the world!'
                                        }
                                    </p>
                                    <button
                                        onClick={() => navigate('/create-post')}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        Create Your First Post
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="hidden lg:block space-y-8">
                            {/* Recently Viewed */}
                            <RecentlyViewed />
                            
                            {/* Quick Actions */}
                            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>Quick Actions</span>
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <button
                                        onClick={() => navigate('/create-post')}
                                        className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-2xl transition-all duration-200 border border-blue-200 hover:border-blue-300"
                                    >
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="font-semibold text-gray-900">Create New Post</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => navigate('/search')}
                                        className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 rounded-2xl transition-all duration-200 border border-green-200 hover:border-green-300"
                                    >
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span className="font-semibold text-gray-900">Discover Posts</span>
                                    </button>
                                    
                                    {currentUser && (
                                        <button
                                            onClick={() => navigate(`/profile/${currentUser.username}`)}
                                            className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl transition-all duration-200 border border-purple-200 hover:border-purple-300"
                                        >
                                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="font-semibold text-gray-900">My Profile</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Trending Topics */}
                            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                        </svg>
                                        <span>Trending Topics</span>
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {['#Technology', '#Design', '#Programming', '#AI', '#WebDev'].map((tag, index) => (
                                            <div key={tag} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-xl transition-all cursor-pointer">
                                                <span className="font-semibold text-gray-900">{tag}</span>
                                                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                                                    {Math.floor(Math.random() * 100) + 10}k
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;