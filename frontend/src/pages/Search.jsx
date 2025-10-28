import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import useAuthStore from '../store/authSore';
import Layout from '../components/Layout';
import LikeButton from '../components/LikeButton';
import CommentButton from '../components/CommentButton';
import ShareButton from '../components/ShareButton';
import FollowButton from '../components/FollowButton';

const Search = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user: currentUser } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [activeTab, setActiveTab] = useState('all');

    const searchAll = async (query) => {
        if (!query.trim()) return { posts: [], users: [], postsCount: 0, usersCount: 0 };
        const res = await api.get(`/search/all?q=${encodeURIComponent(query)}`);
        return res.data;
    };

    const searchPosts = async (query) => {
        if (!query.trim()) return { posts: [], count: 0 };
        const res = await api.get(`/search/posts?q=${encodeURIComponent(query)}`);
        return res.data;
    };

    const searchUsers = async (query) => {
        if (!query.trim()) return { users: [], count: 0 };
        const res = await api.get(`/search/users?q=${encodeURIComponent(query)}`);
        return res.data;
    };

    const { data: allResults, isLoading: loadingAll } = useQuery({
        queryKey: ['search-all', searchQuery],
        queryFn: () => searchAll(searchQuery),
        enabled: activeTab === 'all' && !!searchQuery.trim()
    });

    const { data: postResults, isLoading: loadingPosts } = useQuery({
        queryKey: ['search-posts', searchQuery],
        queryFn: () => searchPosts(searchQuery),
        enabled: activeTab === 'posts' && !!searchQuery.trim()
    });

    const { data: userResults, isLoading: loadingUsers } = useQuery({
        queryKey: ['search-users', searchQuery],
        queryFn: () => searchUsers(searchQuery),
        enabled: activeTab === 'users' && !!searchQuery.trim()
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchParams({ q: searchQuery });
        }
    };

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
        }
    }, [searchParams]);

    const isLoading = loadingAll || loadingPosts || loadingUsers;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Search Header */}
                <div className="mb-6 lg:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Search E-Blog</h1>
                    
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for posts, users, or topics..."
                                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none text-lg"
                            />
                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Search Tabs */}
                    {searchQuery.trim() && (
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                                    activeTab === 'all'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                                    activeTab === 'posts'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Posts
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                                    activeTab === 'users'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Users
                            </button>
                        </div>
                    )}
                </div>

                {/* Search Results */}
                {!searchQuery.trim() ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Search E-Blog</h3>
                        <p className="text-gray-600">Find posts, users, and topics you're interested in</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* All Results */}
                        {activeTab === 'all' && allResults && (
                            <>
                                {/* Users Section */}
                                {allResults.users && allResults.users.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">Users ({allResults.usersCount})</h2>
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="divide-y divide-gray-200">
                                                {allResults.users.map((user) => (
                                                    <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <img
                                                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=48`}
                                                                    alt={user.name}
                                                                    className="w-12 h-12 rounded-full object-cover cursor-pointer"
                                                                    onClick={() => navigate(`/profile/${user.username}`)}
                                                                />
                                                                <div>
                                                                    <h3 
                                                                        className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                                                                        onClick={() => navigate(`/profile/${user.username}`)}
                                                                    >
                                                                        {user.name}
                                                                    </h3>
                                                                    <p className="text-gray-600">@{user.username}</p>
                                                                    {user.bio && (
                                                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{user.bio}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <FollowButton
                                                                username={user.username}
                                                                currentUser={currentUser?.username}
                                                                isFollowing={false}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Posts Section */}
                                {allResults.posts && allResults.posts.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">Posts ({allResults.postsCount})</h2>
                                        <div className="space-y-6">
                                            {allResults.posts.map((post) => (
                                                <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                                    <div className="p-6">
                                                        <div className="flex items-center space-x-3 mb-4">
                                                            <img
                                                                src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author?.name}&background=6366f1&color=fff&size=40`}
                                                                alt={post.author?.name}
                                                                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                                                onClick={() => navigate(`/profile/${post.author?.username}`)}
                                                            />
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">{post.author?.name}</h4>
                                                                <p className="text-sm text-gray-500">@{post.author?.username}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div 
                                                            className="cursor-pointer"
                                                            onClick={() => navigate(`/post/${post._id}`)}
                                                        >
                                                            <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                                                                {post.title}
                                                            </h3>
                                                            {post.description && (
                                                                <p className="text-gray-700 mb-4 line-clamp-2">{post.description}</p>
                                                            )}
                                                        </div>

                                                        {/* Post Tags */}
                                                        {post.tags && post.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {post.tags.slice(0, 3).map((tag, index) => (
                                                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Post Actions */}
                                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                            <div className="flex items-center space-x-6">
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
                                                                    <div className="flex items-center space-x-6 text-gray-500">
                                                                        <span className="flex items-center space-x-1">
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                            </svg>
                                                                            <span className="text-sm">{post.likes?.length || 0}</span>
                                                                        </span>
                                                                        <span className="flex items-center space-x-1">
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                            </svg>
                                                                            <span className="text-sm">{post.commentCount || 0}</span>
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(post.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No Results */}
                                {(!allResults.posts || allResults.posts.length === 0) && 
                                 (!allResults.users || allResults.users.length === 0) && (
                                    <div className="text-center py-16">
                                        <div className="text-6xl mb-4">😔</div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                                        <p className="text-gray-600">Try searching with different keywords</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Posts Only Results */}
                        {activeTab === 'posts' && postResults && (
                            <div>
                                {postResults.posts && postResults.posts.length > 0 ? (
                                    <div className="space-y-6">
                                        {postResults.posts.map((post) => (
                                            <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                                {/* Same post card structure as above */}
                                                <div className="p-6">
                                                    <div className="flex items-center space-x-3 mb-4">
                                                        <img
                                                            src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author?.name}&background=6366f1&color=fff&size=40`}
                                                            alt={post.author?.name}
                                                            className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                                            onClick={() => navigate(`/profile/${post.author?.username}`)}
                                                        />
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">{post.author?.name}</h4>
                                                            <p className="text-sm text-gray-500">@{post.author?.username}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div 
                                                        className="cursor-pointer"
                                                        onClick={() => navigate(`/post/${post._id}`)}
                                                    >
                                                        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                                                            {post.title}
                                                        </h3>
                                                        {post.description && (
                                                            <p className="text-gray-700 mb-4 line-clamp-2">{post.description}</p>
                                                        )}
                                                    </div>

                                                    {post.tags && post.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {post.tags.slice(0, 3).map((tag, index) => (
                                                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                        <div className="flex items-center space-x-6">
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
                                                                <div className="flex items-center space-x-6 text-gray-500">
                                                                    <span className="flex items-center space-x-1">
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                        </svg>
                                                                        <span className="text-sm">{post.likes?.length || 0}</span>
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="text-6xl mb-4">📝</div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                                        <p className="text-gray-600">Try searching with different keywords</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Users Only Results */}
                        {activeTab === 'users' && userResults && (
                            <div>
                                {userResults.users && userResults.users.length > 0 ? (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="divide-y divide-gray-200">
                                            {userResults.users.map((user) => (
                                                <div key={user._id} className="p-6 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <img
                                                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=64`}
                                                                alt={user.name}
                                                                className="w-16 h-16 rounded-full object-cover cursor-pointer"
                                                                onClick={() => navigate(`/profile/${user.username}`)}
                                                            />
                                                            <div>
                                                                <h3 
                                                                    className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                                                    onClick={() => navigate(`/profile/${user.username}`)}
                                                                >
                                                                    {user.name}
                                                                </h3>
                                                                <p className="text-gray-600">@{user.username}</p>
                                                                {user.bio && (
                                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{user.bio}</p>
                                                                )}
                                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                                    <span>{user.followersCount || 0} followers</span>
                                                                    <span>{user.followingCount || 0} following</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <button
                                                                onClick={() => navigate(`/profile/${user.username}`)}
                                                                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                                                            >
                                                                View Profile
                                                            </button>
                                                            <FollowButton
                                                                username={user.username}
                                                                currentUser={currentUser?.username}
                                                                isFollowing={false}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="text-6xl mb-4">👥</div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                                        <p className="text-gray-600">Try searching with different keywords</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Search;