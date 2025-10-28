import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import useAuthStore from '../store/authSore';
import RichTextEditor from '../components/RichTextEditor';
import Layout from '../components/Layout';

const EditPost = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        isPublic: true
    });
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch post data
    const { data: post, isLoading, error } = useQuery({
        queryKey: ['post-edit', postId],
        queryFn: async () => {
            const res = await api.get(`/post/details/${postId}`);
            return res.data.post;
        },
        enabled: !!postId
    });

    // Set form data when post is loaded
    useEffect(() => {
        if (post) {
            // Check if current user is the author
            const isAuthor = currentUser && post.author && (
                post.author._id === currentUser._id || 
                post.author === currentUser._id ||
                post.author._id === currentUser.id ||
                post.author === currentUser.id
            );
            
            if (!isAuthor) {
                navigate('/');
                return;
            }

            setFormData({
                title: post.title || '',
                description: post.description || '',
                content: post.content || '',
                isPublic: post.isPublic ?? true
            });
        }
    }, [post, currentUser, navigate]);

    // Update post mutation
    const updatePostMutation = useMutation({
        mutationFn: async (data) => {
            const formDataToSend = new FormData();
            formDataToSend.append('title', data.title);
            formDataToSend.append('description', data.description);
            formDataToSend.append('content', data.content);
            formDataToSend.append('isPublic', data.isPublic);

            // Add new images if any
            images.forEach((image) => {
                formDataToSend.append('imageUrl', image);
            });

            const res = await api.put(`/post/${postId}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['post-detail', postId]);
            queryClient.invalidateQueries(['all-posts']);
            queryClient.invalidateQueries(['following-posts']);
            queryClient.invalidateQueries(['post']);
            queryClient.invalidateQueries(['user-posts']);
            navigate(`/post/${postId}`);
        },
        onError: (error) => {
            console.error('Error updating post:', error);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            alert('Title is required');
            return;
        }

        if (!formData.content.trim()) {
            alert('Content is required');
            return;
        }

        setIsSubmitting(true);
        try {
            await updatePostMutation.mutateAsync(formData);
        } catch (error) {
            console.error('Error updating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading post...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !post) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
                        <p className="text-gray-600 mb-4">The post you're trying to edit doesn't exist.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Enhanced Header */}
                    <div className="mb-10">
                        <button
                            onClick={() => navigate(`/post/${postId}`)}
                            className="group mb-6 flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-200 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl border border-white/20"
                        >
                            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium">Back to Post</span>
                        </button>
                        <div className="text-center">
                            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                                Edit Post
                            </h1>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Update your post content and settings to keep your audience engaged</p>
                        </div>
                    </div>

                    {/* Enhanced Edit Form */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-8 lg:p-12">
                            {/* Enhanced Title */}
                            <div className="mb-8">
                                <label htmlFor="title" className="block text-base font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span>Title *</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg font-medium bg-gray-50/50 hover:bg-white"
                                    placeholder="Enter your post title..."
                                    required
                                />
                            </div>

                            {/* Enhanced Description */}
                            <div className="mb-8">
                                <label htmlFor="description" className="block text-base font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    <span>Description</span>
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 resize-none bg-gray-50/50 hover:bg-white"
                                    placeholder="Brief description of your post..."
                                />
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content *
                                </label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                />
                            </div>

                            {/* Current Images */}
                            {post.images && post.images.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Images
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {post.images.map((image, index) => (
                                            <div key={index} className="relative rounded-lg overflow-hidden">
                                                <img
                                                    src={image}
                                                    alt={`Current image ${index + 1}`}
                                                    className="w-full h-32 object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Upload new images below to replace current ones
                                    </p>
                                </div>
                            )}

                            {/* New Images */}
                            <div className="mb-6">
                                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload New Images (Optional)
                                </label>
                                <input
                                    type="file"
                                    id="images"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    You can upload up to 5 images. Supported formats: JPG, PNG, GIF
                                </p>
                            </div>

                            {/* Privacy Setting */}
                            <div className="mb-8">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Make this post public
                                    </span>
                                </label>
                                <p className="text-sm text-gray-500 mt-1 ml-8">
                                    Public posts can be seen by everyone. Private posts are only visible to you.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/post/${postId}`)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition duration-200 flex items-center space-x-2"
                                >
                                    {isSubmitting && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    <span>{isSubmitting ? 'Updating...' : 'Update Post'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EditPost;