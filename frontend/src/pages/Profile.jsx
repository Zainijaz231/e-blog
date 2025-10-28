import api from "../api/axios";
import { useState, useEffect } from "react";
import useAuthStore from "../store/authSore";
import { useParams, useNavigate } from "react-router-dom";
import FollowButton from "../components/FollowButton";
import LikeButton from "../components/LikeButton";
import CommentButton from "../components/CommentButton";
import ShareButton from "../components/ShareButton";
import PostActions from "../components/PostActions";
import Layout from "../components/Layout";
import { useQuery, useQueryClient } from '@tanstack/react-query'

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, fetchUser } = useAuthStore();
    const [updating, setUpdating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [activeSection, setActiveSection] = useState('posts')
    const [showComments, setShowComments] = useState({})
    const [newComment, setNewComment] = useState('')
    const [commentingOn, setCommentingOn] = useState(null)
    const queryClient = useQueryClient();

    const fetchProfile = async (username) => {
        try {
            const res = await api.get(`/auth/profile/${username}`)
            return res.data.user;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }

    const fetchPost = async (username) => {
        try {
            const res = await api.get(`/post/${username}`)
            return res.data.posts || [];
        } catch (error) {
            console.error('Error fetching posts:', error);
            return []; // Return empty array on error
        }
    }

    const { data: profile, isLoading, error, refetch } = useQuery({
        queryKey: ['profile', username],
        queryFn: () => fetchProfile(username),
        enabled: !!username,
        retry: 2
    })

    const { data: posts = [] } = useQuery({
        queryKey: ['post', username],
        queryFn: () => fetchPost(username),
        enabled: !!username,
        retry: 2
    })

    const [form, setForm] = useState({
        name: "",
        username: "",
        bio: "",
        avatar: null,
    });

    // Update form when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setForm({
                name: currentUser.name || "",
                username: currentUser.username || "",
                bio: currentUser.bio || "",
                avatar: null,
            });
        }
    }, [currentUser]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setForm({ ...form, avatar: file });

        // Create preview
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("username", form.username);
            formData.append("bio", form.bio);
            if (form.avatar) {
                formData.append("avatar", form.avatar);
            }

            await api.put("/auth/update-profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            await fetchUser();
            refetch()
            setShowModal(false);
            setPreviewImage(null);

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            successDiv.textContent = 'Profile updated successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => document.body.removeChild(successDiv), 3000);

        } catch (error) {
            console.error("Error updating profile:", error);

            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            errorDiv.textContent = 'Failed to update profile. Please try again.';
            document.body.appendChild(errorDiv);
            setTimeout(() => document.body.removeChild(errorDiv), 3000);
        } finally {
            setUpdating(false);
        }
    };

    const openModal = () => {
        setForm({
            name: currentUser?.name || "",
            username: currentUser?.username || "",
            bio: currentUser?.bio || "",
            avatar: null,
        });
        setPreviewImage(null);
        setShowModal(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile || error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600">The user you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    // Comment functions
    const toggleComments = (postId) => {
        setShowComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleAddComment = async (postId) => {
        if (!newComment.trim()) return;
        
        try {
            await api.post(`/post/${postId}/comment`, { content: newComment });
            setNewComment('');
            setCommentingOn(null);
            // Refresh posts to show new comment
            queryClient.invalidateQueries(['post', username]);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
                {/* Enhanced Profile Header with Animated Gradient */}
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 h-40 sm:h-48 lg:h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-700/90"></div>
                    <div className="absolute inset-0 opacity-20">
                        <div className="w-full h-full" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundRepeat: 'repeat'
                        }}></div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-28 sm:-mt-32 lg:-mt-36">
                        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                            {/* Enhanced Profile Info */}
                            <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12">
                                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                                    {/* Enhanced Avatar */}
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                        <img
                                            src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff&size=160`}
                                            alt="Avatar"
                                            className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-2xl object-cover ring-4 ring-blue-100"
                                        />
                                        <div className="absolute bottom-3 right-3 w-7 h-7 bg-green-500 border-3 border-white rounded-full shadow-lg animate-pulse"></div>
                                    </div>

                                    {/* Enhanced User Info */}
                                    <div className="flex-1 text-center lg:text-left max-w-2xl">
                                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                                            {profile.name}
                                        </h1>
                                        <p className="text-lg sm:text-xl text-blue-600 font-medium mb-4">@{profile.username}</p>
                                        <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                                            {profile.bio || "✨ No bio available yet. This user prefers to keep an air of mystery!"}
                                        </p>

                                        {/* Enhanced Stats */}
                                        <div className="flex justify-center lg:justify-start space-x-8 sm:space-x-12">
                                            <div className="text-center group cursor-pointer">
                                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {posts?.length || 0}
                                                </div>
                                                <div className="text-sm sm:text-base text-gray-600 font-medium">Posts</div>
                                            </div>
                                            <div className="text-center group cursor-pointer">
                                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                    {profile.followersCount || 0}
                                                </div>
                                                <div className="text-sm sm:text-base text-gray-600 font-medium">Followers</div>
                                            </div>
                                            <div className="text-center group cursor-pointer">
                                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {profile.followingCount || 0}
                                                </div>
                                                <div className="text-sm sm:text-base text-gray-600 font-medium">Following</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Action Buttons */}
                                    <div className="flex flex-col space-y-3">
                                        {currentUser ? (
                                            currentUser.username === profile.username ? (
                                                <button
                                                    onClick={openModal}
                                                    className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                >
                                                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    <span>Edit Profile</span>
                                                </button>
                                            ) : (
                                                <FollowButton
                                                    username={username}
                                                    currentUser={currentUser?.username}
                                                    isFollowing={profile.followers?.some(f =>
                                                        f.username === currentUser?.username ||
                                                        f._id === currentUser?._id ||
                                                        f === currentUser?._id
                                                    ) || false}
                                                />
                                            )
                                        ) : (
                                            <FollowButton username={username} currentUser={null} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Content Tabs */}
                        <div className="mt-8">
                            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                                <div className="border-b border-gray-100">
                                    <nav className="flex space-x-1 px-6 sm:px-8 bg-gray-50/50">
                                        <button
                                            className={`relative py-4 px-6 font-semibold text-sm transition-all duration-300 rounded-t-2xl ${activeSection === 'posts'
                                                ? "bg-white text-blue-600 shadow-lg -mb-px border-t-2 border-blue-500"
                                                : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
                                                }`}
                                            onClick={() => setActiveSection('posts')}
                                        >
                                            <span className="flex items-center space-x-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                </svg>
                                                <span>Posts</span>
                                            </span>
                                        </button>
                                        <button
                                            className={`relative py-4 px-6 font-semibold text-sm transition-all duration-300 rounded-t-2xl ${activeSection === 'media'
                                                ? "bg-white text-purple-600 shadow-lg -mb-px border-t-2 border-purple-500"
                                                : "text-gray-600 hover:text-purple-600 hover:bg-white/50"
                                                }`}
                                            onClick={() => setActiveSection('media')}
                                        >
                                            <span className="flex items-center space-x-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>Media</span>
                                            </span>
                                        </button>
                                        {currentUser && currentUser.username === profile.username && (
                                            <button
                                                className={`relative py-4 px-6 font-semibold text-sm transition-all duration-300 rounded-t-2xl ${activeSection === 'drafts'
                                                    ? "bg-white text-amber-600 shadow-lg -mb-px border-t-2 border-amber-500"
                                                    : "text-gray-600 hover:text-amber-600 hover:bg-white/50"
                                                    }`}
                                                onClick={() => setActiveSection('drafts')}
                                            >
                                                <span className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span>Drafts</span>
                                                </span>
                                            </button>
                                        )}
                                    </nav>
                                </div>

                                <div className="p-8">
                                    {activeSection === 'posts' && (
                                        <>
                                            {posts && posts.length > 0 ? (
                                                <div className="space-y-6">
                                                    {posts.map((post, index) => (
                                                        <div key={post._id || index} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500 cursor-pointer transform hover:-translate-y-1"
                                                            onClick={() => navigate(`/post/${post._id}`)}>
                                                            {/* Enhanced Post Header */}
                                                            <div className="p-6 pb-4">
                                                                <div className="flex items-center space-x-4 mb-5">
                                                                    <div className="relative">
                                                                        <img
                                                                            src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff&size=48`}
                                                                            alt={profile.name}
                                                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all"
                                                                        />
                                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{profile.name}</h4>
                                                                        <p className="text-sm text-gray-500 font-medium">@{profile.username}</p>
                                                                    </div>
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                                        </div>
                                                                        <PostActions post={post} showInDropdown={true} />
                                                                    </div>
                                                                </div>

                                                                {/* Enhanced Post Title */}
                                                                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                                                                    {post.title}
                                                                </h3>

                                                                {/* Enhanced Post Description */}
                                                                {post.description && (
                                                                    <p className="text-gray-700 leading-relaxed mb-5 text-base">{post.description}</p>
                                                                )}

                                                                {/* Post Images */}
                                                                {post.images && post.images.length > 0 && (
                                                                    <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? 'grid-cols-1' :
                                                                        post.images.length === 2 ? 'grid-cols-2' :
                                                                            'grid-cols-2 md:grid-cols-3'
                                                                        }`}>
                                                                        {post.images.map((image, imgIndex) => (
                                                                            <div key={imgIndex} className="rounded-lg overflow-hidden">
                                                                                <img
                                                                                    src={image}
                                                                                    alt={`Post image ${imgIndex + 1}`}
                                                                                    className="w-full h-48 object-cover"
                                                                                    onError={(e) => {
                                                                                        e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Image+Not+Found';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Post Tags */}
                                                                {post.tags && post.tags.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                                        {post.tags.map((tag, tagIndex) => (
                                                                            <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                                                                #{tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Enhanced Post Actions */}
                                                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100/50">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-8">
                                                                        {currentUser ? (
                                                                            <LikeButton
                                                                                postId={post._id}
                                                                                initialCount={post.likes?.length || 0}
                                                                                initialLiked={post.likes?.includes(currentUser._id) || false}
                                                                                onLike={(postId, isLiked) => {
                                                                                    // Refresh posts data after like/unlike
                                                                                    queryClient.invalidateQueries(['post', username]);
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => window.location.href = '/login'}
                                                                                className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                                                                                title="Login to like posts"
                                                                            >
                                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                                </svg>
                                                                                <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                                                                            </button>
                                                                        )}

                                                                        {currentUser ? (
                                                                            <CommentButton
                                                                                postId={post._id}
                                                                                initialCount={post.commentCount || 0}
                                                                                onComment={(postId, showComments) => {
                                                                                    toggleComments(postId);
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => window.location.href = '/login'}
                                                                                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                                                                                title="Login to comment on posts"
                                                                            >
                                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                                </svg>
                                                                                <span className="text-sm font-medium">{post.commentCount || 0}</span>
                                                                            </button>
                                                                        )}

                                                                        {currentUser ? (
                                                                            <ShareButton
                                                                                postId={post._id}
                                                                                initialCount={post.shareCount || 0}
                                                                                onShare={(postId, isShared) => {
                                                                                    // TODO: Add API call for share/unshare
                                                                                    console.log('Share clicked:', postId, isShared);
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => window.location.href = '/login'}
                                                                                className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                                                                                title="Login to share posts"
                                                                            >
                                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                                                                </svg>
                                                                                <span className="text-sm font-medium">{post.shareCount || 0}</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Comments Section */}
                                                            {showComments[post._id] && (
                                                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                                                                    {/* Add Comment */}
                                                                    {currentUser && (
                                                                        <div className="mb-4">
                                                                            <div className="flex space-x-3">
                                                                                <img
                                                                                    src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}&background=6366f1&color=fff&size=32`}
                                                                                    alt={currentUser.name}
                                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                                />
                                                                                <div className="flex-1">
                                                                                    <textarea
                                                                                        value={commentingOn === post._id ? newComment : ''}
                                                                                        onChange={(e) => {
                                                                                            setNewComment(e.target.value);
                                                                                            setCommentingOn(post._id);
                                                                                        }}
                                                                                        placeholder="Write a comment..."
                                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                                                        rows={2}
                                                                                    />
                                                                                    {commentingOn === post._id && newComment.trim() && (
                                                                                        <div className="flex justify-end mt-2 space-x-2">
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setNewComment('');
                                                                                                    setCommentingOn(null);
                                                                                                }}
                                                                                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                                                                            >
                                                                                                Cancel
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleAddComment(post._id)}
                                                                                                className="px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                                                                            >
                                                                                                Comment
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Comments List */}
                                                                    {post.comments && post.comments.length > 0 ? (
                                                                        <div className="space-y-3">
                                                                            {post.comments.map((comment, index) => (
                                                                                <div key={index} className="flex space-x-3">
                                                                                    <img
                                                                                        src={comment.user?.avatarUrl || `https://ui-avatars.com/api/?name=${comment.user?.name}&background=6366f1&color=fff&size=32`}
                                                                                        alt={comment.user?.name}
                                                                                        className="w-8 h-8 rounded-full object-cover"
                                                                                    />
                                                                                    <div className="flex-1">
                                                                                        <div className="bg-white rounded-lg px-3 py-2">
                                                                                            <div className="flex items-center space-x-2 mb-1">
                                                                                                <span className="font-medium text-sm text-gray-900">
                                                                                                    {comment.user?.name}
                                                                                                </span>
                                                                                                <span className="text-xs text-gray-500">
                                                                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <p className="text-sm text-gray-700">{comment.content}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-center text-gray-500 text-sm py-4">
                                                                            No comments yet. Be the first to comment!
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-16">
                                                    <div className="text-6xl mb-4">📝</div>
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                                                    <p className="text-gray-600">When {profile.name} shares something, it will appear here.</p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {activeSection === 'media' && (
                                        <>
                                            {posts && posts.some(post => post.images && post.images.length > 0) ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                    {posts
                                                        .filter(post => post.images && post.images.length > 0)
                                                        .flatMap(post => post.images.map((image, index) => ({
                                                            image,
                                                            postId: post._id,
                                                            index,
                                                            createdAt: post.createdAt
                                                        })))
                                                        .map((item, index) => (
                                                            <div key={`${item.postId}-${item.index}`} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                                <img
                                                                    src={item.image}
                                                                    alt={`Media ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Image+Not+Found';
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-16">
                                                    <div className="text-6xl mb-4">🖼️</div>
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No media yet</h3>
                                                    <p className="text-gray-600">When {profile.name} shares photos, they will appear here.</p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {activeSection === 'drafts' && currentUser && currentUser.username === profile.username && (
                                        <>
                                            <div className="space-y-6">
                                                {/* Draft from localStorage */}
                                                {(() => {
                                                    const draft = localStorage.getItem('postDraft');
                                                    if (draft) {
                                                        const parsedDraft = JSON.parse(draft);
                                                        return (
                                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center space-x-2">
                                                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        <span className="font-medium text-yellow-800">Unsaved Draft</span>
                                                                    </div>
                                                                    <span className="text-sm text-yellow-600">
                                                                        Saved {new Date(parsedDraft.savedAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <h3 className="font-bold text-gray-900 mb-2">
                                                                    {parsedDraft.title || 'Untitled Draft'}
                                                                </h3>
                                                                {parsedDraft.description && (
                                                                    <p className="text-gray-700 mb-4">{parsedDraft.description}</p>
                                                                )}
                                                                <div className="flex space-x-3">
                                                                    <button
                                                                        onClick={() => navigate('/create-post')}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                                    >
                                                                        Continue Writing
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (confirm('Are you sure you want to delete this draft?')) {
                                                                                localStorage.removeItem('postDraft');
                                                                                window.location.reload();
                                                                            }
                                                                        }}
                                                                        className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                                                    >
                                                                        Delete Draft
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                {/* No drafts message */}
                                                {!localStorage.getItem('postDraft') && (
                                                    <div className="text-center py-16">
                                                        <div className="text-6xl mb-4">📝</div>
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No drafts yet</h3>
                                                        <p className="text-gray-600 mb-6">Start writing a post and save it as draft to see it here.</p>
                                                        <button
                                                            onClick={() => navigate('/create-post')}
                                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                                                        >
                                                            Create New Post
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Edit Profile Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-in zoom-in-95 duration-300">
                            {/* Enhanced Modal Header */}
                            <div className="flex items-center justify-between p-8 border-b border-gray-100">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Edit Profile
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Enhanced Modal Body */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                {/* Enhanced Avatar Upload */}
                                <div className="text-center">
                                    <div className="relative inline-block group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                        <img
                                            src={previewImage || profile.avatar || profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff&size=128`}
                                            alt="Avatar Preview"
                                            className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                                        />
                                        <label className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <input
                                                type="file"
                                                name="avatar"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-4 font-medium">Click the camera icon to change your photo</p>
                                </div>

                                {/* Enhanced Form Fields */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-base font-semibold text-gray-800 mb-3">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            value={form.name}
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none bg-gray-50/50 hover:bg-white text-lg"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-base font-semibold text-gray-800 mb-3">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Choose a unique username"
                                            onChange={handleChange}
                                            value={form.username}
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 outline-none bg-gray-50/50 hover:bg-white text-lg"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-base font-semibold text-gray-800 mb-3">Bio</label>
                                        <textarea
                                            name="bio"
                                            placeholder="Tell us about yourself..."
                                            onChange={handleChange}
                                            value={form.bio}
                                            rows={4}
                                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 outline-none resize-none bg-gray-50/50 hover:bg-white text-lg"
                                        />
                                        <p className="text-sm text-gray-500 mt-2 font-medium">{form.bio.length}/150 characters</p>
                                    </div>
                                </div>

                                {/* Enhanced Modal Footer */}
                                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-200 border-2 border-transparent hover:border-gray-300"
                                        disabled={updating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                                    >
                                        {updating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Profile;