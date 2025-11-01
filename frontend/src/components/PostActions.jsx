import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import useAuthStore from '../store/authSore';

const PostActions = ({ post, showInDropdown = false }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Check if current user is the author
    const isAuthor = currentUser && post.author && (
        post.author._id === currentUser._id || 
        post.author === currentUser._id ||
        post.author._id === currentUser.id ||
        post.author === currentUser.id ||
        (typeof post.author === 'string' && post.author === currentUser._id) ||
        (typeof post.author === 'string' && post.author === currentUser.id)
    );

    // Delete post mutation
    const deletePostMutation = useMutation({
        mutationFn: async () => {
            const res = await api.delete(`/post/${post._id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['all-posts']);
            queryClient.invalidateQueries(['following-posts']);
            queryClient.invalidateQueries(['user-posts']);
            queryClient.invalidateQueries(['post']);
            queryClient.invalidateQueries(['post-detail']);
            navigate('/');
        },
        onError: (error) => {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        }
    });

    const handleEdit = () => {
        navigate(`/edit-post/${post._id}`);
        setShowDropdown(false);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deletePostMutation.mutateAsync();
            console.log('Post deleted successfully');
        } catch (error) {
            console.error('Error deleting post:', error);
            alert(`Failed to delete post: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (!isAuthor) {
        console.log('PostActions: User is not author, hiding actions');
        return null;
    }

    if (showInDropdown) {
        return (
            <div className="relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(!showDropdown);
                    }}
                    className="group p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-gray-200 hover:shadow-lg"
                    title="Post options"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>

                {showDropdown && (
                    <>
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute right-0 top-full mt-3 w-52 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 z-20 overflow-hidden">
                            <div className="p-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit();
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-3 rounded-xl transition-all duration-200 group"
                                >
                                    <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">Edit Post</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteModal(true);
                                        setShowDropdown(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center space-x-3 rounded-xl transition-all duration-200 group"
                                >
                                    <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">Delete Post</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Enhanced Delete Confirmation Modal for Dropdown */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/20 animate-in zoom-in-95 duration-300">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-red-100 to-pink-100 mb-6 animate-pulse">
                                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Post</h3>
                                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                    Are you sure you want to delete this post? This action cannot be undone and all comments will be lost.
                                </p>
                                <div className="flex items-center justify-center space-x-4">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={isDeleting}
                                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-red-400 disabled:to-pink-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                                    >
                                        {isDeleting && (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        )}
                                        <span>{isDeleting ? 'Deleting...' : 'Delete Post'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Inline buttons (for detailed view)
    return (
        <div className="flex items-center space-x-3">
            <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
            </button>
            <button
                onClick={() => {
                    console.log('Delete button clicked');
                    setShowDeleteModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
            </button>

            {/* Enhanced Delete Confirmation Modal for Inline */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-red-100 to-pink-100 mb-6 animate-pulse">
                                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Post</h3>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                Are you sure you want to delete this post? This action cannot be undone and all comments will be lost.
                            </p>
                            <div className="flex items-center justify-center space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-red-400 disabled:to-pink-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                                >
                                    {isDeleting && (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    )}
                                    <span>{isDeleting ? 'Deleting...' : 'Delete Post'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostActions;
