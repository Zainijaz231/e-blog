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
        <div className="min-h-screen bg-gray-50">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 sm:h-40 lg:h-48"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-24">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Profile Info */}
                        <div className="px-8 py-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                                {/* Avatar */}
                                <div className="relative">
                                    <img
                                        src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff&size=128`}
                                        alt="Avatar"
                                        className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                                    />
                                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>

                                {/* User Info */}
                                <div className="flex-1 text-center sm:text-left">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                                    <p className="text-xl text-gray-600 mb-3">@{profile.username}</p>
                                    <p className="text-gray-700 max-w-2xl leading-relaxed">
                                        {profile.bio || "No bio available yet."}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex justify-center sm:justify-start space-x-6 sm:space-x-8 mt-4 sm:mt-6">
                                        <div className="text-center">
                                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{posts?.length || 0}</div>
                                            <div className="text-xs sm:text-sm text-gray-600">Posts</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{profile.followersCount || 0}</div>
                                            <div className="text-xs sm:text-sm text-gray-600">Followers</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{profile.followingCount || 0}</div>
                                            <div className="text-xs sm:text-sm text-gray-600">Following</div>
                                        </div>
                                    </div>
                                </div>


                                {currentUser ? (
                                    currentUser.username === profile.username ? (
                                        <div className="flex flex-col space-y-2">
                                            <button
                                                onClick={openModal}
                                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span>Edit Profile</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <FollowButton
                                                username={username}
                                                currentUser={currentUser?.username}
                                                isFollowing={profile.followers?.some(f =>
                                                    f.username === currentUser?.username ||
                                                    f._id === currentUser?._id ||
                                                    f === currentUser?._id
                                                ) || false}
                                            />
                                        </div>
                                    )
                                ) : (
                                    <div>
                                        <FollowButton username={username} currentUser={null} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Tabs */}
                    <div className="mt-8">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8 px-8">
                                    <button
                                        className={`py-4 px-1 font-medium text-sm ${activeSection === 'posts'
                                            ? "border-b-2 border-blue-500 text-blue-600"
                                            : "text-gray-600 hover:text-blue-600"
                                            }`}
                                        onClick={() => setActiveSection('posts')}
                                    >
                                        Posts
                                    </button>
                                    <button
                                        className={`py-4 px-1 font-medium text-sm ${activeSection === 'media'
                                            ? "border-b-2 border-blue-500 text-blue-600"
                                            : "text-gray-600 hover:text-blue-600"
                                            }`}
                                        onClick={() => setActiveSection('media')}
                                    >
                                        Media
                                    </button>
                                    {currentUser && currentUser.username === profile.username && (
                                        <button
                                            className={`py-4 px-1 font-medium text-sm ${activeSection === 'drafts'
                                                ? "border-b-2 border-blue-500 text-blue-600"
                                                : "text-gray-600 hover:text-blue-600"
                                                }`}
                                            onClick={() => setActiveSection('drafts')}
                                        >
                                            Drafts
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
                                                    <div key={post._id || index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                                        onClick={() => navigate(`/post/${post._id}`)}>
                                                        {/* Post Header */}
                                                        <div className="p-6 pb-4">
                                                            <div className="flex items-center space-x-3 mb-4">
                                                                <img
                                                                    src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff&size=40`}
                                                                    alt={profile.name}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                                                                    <p className="text-sm text-gray-500">@{profile.username}</p>
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                                </div>
                                                                <PostActions post={post} showInDropdown={true} />
                                                            </div>

                                                            {/* Post Title */}
                                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>

                                                            {/* Post Description */}
                                                            {post.description && (
                                                                <p className="text-gray-700 leading-relaxed mb-4">{post.description}</p>
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

                                                        {/* Post Actions */}
                                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-6">
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

            {/* Edit Profile Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Avatar Upload */}
                                <div className="text-center">
                                    <div className="relative inline-block">
                                        <img
                                            src={previewImage || profile.avatar || profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff&size=128`}
                                            alt="Avatar Preview"
                                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                        />
                                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition duration-200">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <p className="text-sm text-gray-600 mt-2">Click the camera icon to change your photo</p>
                                </div>

                                {/* Form Fields */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        value={form.name}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Choose a unique username"
                                        onChange={handleChange}
                                        value={form.username}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        placeholder="Tell us about yourself..."
                                        onChange={handleChange}
                                        value={form.bio}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none resize-none"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">{form.bio.length}/150 characters</p>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition duration-200"
                                        disabled={updating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center"
                                    >
                                        {updating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                )
            }
        </div >
        </Layout>
    );
}


export default Profile;