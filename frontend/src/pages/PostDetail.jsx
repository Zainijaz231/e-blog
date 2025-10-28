import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import useAuthStore from '../store/authSore';
import LikeButton from '../components/LikeButton';
import CommentButton from '../components/CommentButton';
import ShareButton from '../components/ShareButton';
import PostActions from '../components/PostActions';
import Layout from '../components/Layout';

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();
    
    // Comment system state
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [showAllComments, setShowAllComments] = useState(false);

    const fetchPost = async (postId) => {
        const res = await api.get(`/post/details/${postId}`);
        return res.data.post;
    };

    const fetchComments = async (postId) => {
        const res = await api.get(`/post/${postId}/comments`);
        return res.data.comments || [];
    };

    const { data: post, isLoading, error } = useQuery({
        queryKey: ['post-detail', postId],
        queryFn: () => fetchPost(postId),
        enabled: !!postId
    });

    const { data: comments = [] } = useQuery({
        queryKey: ['post-comments', postId],
        queryFn: () => fetchComments(postId),
        enabled: !!postId
    });

    // Add comment mutation
    const addCommentMutation = useMutation({
        mutationFn: async ({ postId, content }) => {
            const res = await api.post(`/post/${postId}/comment`, { content });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['post-comments', postId]);
            queryClient.invalidateQueries(['post-detail', postId]);
            setNewComment('');
        }
    });

    // Reply to comment mutation
    const replyCommentMutation = useMutation({
        mutationFn: async ({ postId, commentId, content }) => {
            const res = await api.post(`/post/${postId}/comment/${commentId}/reply`, { content });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['post-comments', postId]);
            setReplyingTo(null);
            setReplyText('');
        }
    });

    // Delete comment mutation
    const deleteCommentMutation = useMutation({
        mutationFn: async ({ postId, commentId }) => {
            const res = await api.delete(`/post/${postId}/comments/${commentId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['post-comments', postId]);
            queryClient.invalidateQueries(['post-detail', postId]);
        }
    });

    // Track post view and increment view count
    useEffect(() => {
        if (post) {
            // Track view count in backend
            const trackView = async () => {
                try {
                    await api.post(`/post/${postId}/view`);
                } catch (error) {
                    console.error('Error tracking view:', error);
                }
            };
            
            // Track view after a short delay to ensure user is actually viewing
            const viewTimer = setTimeout(trackView, 2000);
            
            // Add to recently viewed posts (for authenticated users)
            if (currentUser) {
                const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                const postData = {
                    _id: post._id,
                    title: post.title,
                    author: post.author,
                    createdAt: post.createdAt,
                    viewedAt: new Date().toISOString()
                };
                
                // Remove if already exists and add to beginning
                const filtered = recentlyViewed.filter(p => p._id !== post._id);
                const updated = [postData, ...filtered].slice(0, 10); // Keep only last 10
                localStorage.setItem('recentlyViewed', JSON.stringify(updated));
            }
            
            return () => clearTimeout(viewTimer);
        }
    }, [post, currentUser, postId]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !currentUser) return;
        addCommentMutation.mutate({ postId, content: newComment });
    };

    const handleReply = async (commentId) => {
        if (!replyText.trim() || !currentUser) return;
        replyCommentMutation.mutate({ postId, commentId, content: replyText });
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            deleteCommentMutation.mutate({ postId, commentId });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading post...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
                    <p className="text-gray-600 mb-4">The post you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-4 sm:py-6 lg:py-8">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8">
                {/* Enhanced Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="group mb-4 sm:mb-6 lg:mb-8 flex items-center space-x-2 sm:space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-200 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl border border-white/20"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium text-sm sm:text-base">Back</span>
                </button>

                {/* Enhanced Post Content */}
                <article className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Enhanced Post Header */}
                    <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 border-b border-gray-100">
                        <div className="flex flex-col space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                                    <div className="relative">
                                        <img
                                            src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author?.name}&background=6366f1&color=fff&size=64`}
                                            alt={post.author?.name}
                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-2 sm:ring-4 ring-blue-100 shadow-lg"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer truncate">
                                            {post.author?.name}
                                        </h3>
                                        <p className="text-sm sm:text-base text-gray-600 font-medium truncate">@{post.author?.username}</p>
                                        <div className="text-xs sm:text-sm text-gray-500 mt-1 bg-gray-50 px-2 sm:px-3 py-1 rounded-full inline-block">
                                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <PostActions post={post} showInDropdown={true} />
                            </div>
                        </div>

                        {/* Enhanced Post Title */}
                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
                            {post.title}
                        </h1>

                        {/* Enhanced Post Description */}
                        {post.description && (
                            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed mb-6 sm:mb-8 font-light">
                                {post.description}
                            </p>
                        )}

                        {/* Enhanced Post Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {post.tags.map((tag, index) => (
                                    <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold rounded-full border border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-all cursor-pointer">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Enhanced Post Images */}
                    {post.images && post.images.length > 0 && (
                        <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 border-b border-gray-100">
                            <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${post.images.length === 1 ? 'grid-cols-1' :
                                post.images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                                    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                }`}>
                                {post.images.map((image, index) => (
                                    <div key={index} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                                        <img
                                            src={image}
                                            alt={`Post image ${index + 1}`}
                                            className="w-full h-48 sm:h-64 lg:h-80 object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                                            onClick={() => window.open(image, '_blank')}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Enhanced Post Content */}
                    <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-10 lg:py-12">
                        <div
                            className="post-content prose prose-base sm:prose-lg lg:prose-xl max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>

                    {/* Enhanced Post Actions */}
                    <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
                                {currentUser ? (
                                    <>
                                        <LikeButton
                                            postId={post._id}
                                            initialCount={post.likes?.length || 0}
                                            initialLiked={post.likes?.includes(currentUser._id) || false}
                                        />
                                        <div className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span className="text-base font-medium">{comments.length}</span>
                                        </div>
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
                                            title="Login to like posts"
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
                                            <span className="text-sm font-medium">{comments.length}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>{post.viewCount || 0} views</span>
                                </div>
                                <span className="hidden sm:inline">•</span>
                                <span>{post.isPublic ? 'Public' : 'Private'}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="truncate">{post.author?.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Comments Section */}
                    <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 bg-white border-t border-gray-100">
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2 sm:space-x-3">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>Comments ({comments.length})</span>
                            </h3>

                            {/* Add Comment Form */}
                            {currentUser ? (
                                <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                                    <div className="flex space-x-3 sm:space-x-4">
                                        <div className="relative">
                                            <img
                                                src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}&background=6366f1&color=fff&size=48`}
                                                alt={currentUser.name}
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200 shadow-lg"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Share your thoughts about this post..."
                                                className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none bg-white/80 backdrop-blur-sm text-base sm:text-lg"
                                                rows={3}
                                            />
                                            {newComment.trim() && (
                                                <div className="flex justify-end mt-4 space-x-3">
                                                    <button
                                                        onClick={() => setNewComment('')}
                                                        className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-xl transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleAddComment}
                                                        disabled={addCommentMutation.isLoading}
                                                        className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                                                    >
                                                        {addCommentMutation.isLoading && (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        )}
                                                        <span>{addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 text-center border border-gray-200">
                                    <div className="text-6xl mb-4">💬</div>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Join the Conversation</h4>
                                    <p className="text-gray-600 mb-6">Sign in to share your thoughts and engage with other readers.</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Sign In to Comment
                                    </button>
                                </div>
                            )}

                            {/* Comments List */}
                            {comments.length > 0 ? (
                                <div className="space-y-6">
                                    {(showAllComments ? comments : comments.slice(0, 5)).map((comment, index) => (
                                        <div key={comment._id || index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                            <div className="flex space-x-4">
                                                <div className="relative">
                                                    <img
                                                        src={comment.user?.avatarUrl || `https://ui-avatars.com/api/?name=${comment.user?.name}&background=6366f1&color=fff&size=48`}
                                                        alt={comment.user?.name}
                                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 shadow-md"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <h5 className="font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                                                                {comment.user?.name}
                                                            </h5>
                                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                                @{comment.user?.username}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        {currentUser && (comment.user?._id === currentUser._id || post.author._id === currentUser._id) && (
                                                            <button
                                                                onClick={() => handleDeleteComment(comment._id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                                                title="Delete comment"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed text-lg mb-4">{comment.content}</p>
                                                    
                                                    {currentUser && (
                                                        <div className="flex items-center space-x-4">
                                                            <button
                                                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                                                className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors font-medium"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                </svg>
                                                                <span>Reply</span>
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Reply Form */}
                                                    {replyingTo === comment._id && currentUser && (
                                                        <div className="mt-4 ml-4 pl-4 border-l-2 border-blue-200">
                                                            <div className="flex space-x-3">
                                                                <img
                                                                    src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}&background=6366f1&color=fff&size=32`}
                                                                    alt={currentUser.name}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                                <div className="flex-1">
                                                                    <textarea
                                                                        value={replyText}
                                                                        onChange={(e) => setReplyText(e.target.value)}
                                                                        placeholder={`Reply to ${comment.user?.name}...`}
                                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                                                                        rows={2}
                                                                    />
                                                                    {replyText.trim() && (
                                                                        <div className="flex justify-end mt-2 space-x-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setReplyingTo(null);
                                                                                    setReplyText('');
                                                                                }}
                                                                                className="px-4 py-1 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleReply(comment._id)}
                                                                                disabled={replyCommentMutation.isLoading}
                                                                                className="px-6 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                                                                            >
                                                                                {replyCommentMutation.isLoading && (
                                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                                                )}
                                                                                <span>{replyCommentMutation.isLoading ? 'Replying...' : 'Reply'}</span>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Replies */}
                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-200 space-y-4">
                                                            {comment.replies.map((reply, replyIndex) => (
                                                                <div key={reply._id || replyIndex} className="flex space-x-3">
                                                                    <img
                                                                        src={reply.user?.avatarUrl || `https://ui-avatars.com/api/?name=${reply.user?.name}&background=6366f1&color=fff&size=32`}
                                                                        alt={reply.user?.name}
                                                                        className="w-8 h-8 rounded-full object-cover"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="bg-gray-50 rounded-xl px-4 py-3">
                                                                            <div className="flex items-center space-x-2 mb-1">
                                                                                <span className="font-semibold text-sm text-gray-900">
                                                                                    {reply.user?.name}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">
                                                                                    {new Date(reply.createdAt).toLocaleDateString()}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-700">{reply.content}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Show More Comments Button */}
                                    {comments.length > 5 && (
                                        <div className="text-center pt-6">
                                            <button
                                                onClick={() => setShowAllComments(!showAllComments)}
                                                className="px-8 py-3 bg-gradient-to-r from-gray-100 to-blue-100 hover:from-gray-200 hover:to-blue-200 text-gray-700 font-semibold rounded-2xl transition-all duration-200 border border-gray-200 hover:border-blue-300"
                                            >
                                                {showAllComments ? 'Show Less Comments' : `Show All ${comments.length} Comments`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                                    <div className="text-6xl mb-4">💭</div>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-2">No comments yet</h4>
                                    <p className="text-gray-600">Be the first to share your thoughts about this post!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </article>
            </div>
        </div>
        </Layout>
    );
};

export default PostDetail;