import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authSore';
import Layout from '../components/Layout';
import FollowButton from '../components/FollowButton';

const Following = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();

    const fetchFollowing = async () => {
        if (!currentUser) return [];
        try {
            const res = await api.get(`/auth/profile/${currentUser.username}/following`);
            return res.data.following || [];
        } catch (error) {
            console.error('Error fetching following list:', error);
            return [];
        }
    };

    const { data: following = [], isLoading } = useQuery({
        queryKey: ['following', currentUser?.username],
        queryFn: fetchFollowing,
        enabled: !!currentUser
    });

    if (!currentUser) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                        <p className="text-gray-600 mb-6">Please login to see who you're following.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Following</h1>
                    <p className="text-gray-600">People you follow on E-Blog</p>
                </div>

                {/* Following List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : following.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {following.map((user) => (
                                <div key={user._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=64`}
                                                alt={user.name}
                                                className="w-16 h-16 rounded-full object-cover cursor-pointer"
                                                onClick={() => navigate(`/profile/${user.username}`)}
                                            />
                                            <div className="flex-1">
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
                                                    <span>{user.postsCount || 0} posts</span>
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
                                                isFollowing={true}
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Not following anyone yet</h3>
                        <p className="text-gray-600 mb-6">Discover and follow interesting people to see their posts in your feed.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                        >
                            Discover People
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Following;