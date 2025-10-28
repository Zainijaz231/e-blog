import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authSore';
import api from '../api/axios';
import RichTextEditor from '../components/RichTextEditor';
import Layout from '../components/Layout';

const CreatePost = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);

    // Debug: Check if user is loaded
    console.log('CreatePost - User:', user);
    
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-4">Please login to create posts.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        images: [],
        isPublic: true,
        tags: ''
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        // Add new files to formData
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));

        // Create preview URLs
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImages(prev => [...prev, {
                    file,
                    url: e.target.result,
                    id: Date.now() + Math.random()
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
        setPreviewImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Title and content are required');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('content', formData.content);
            submitData.append('isPublic', formData.isPublic);
            
            // Add tags as array
            if (formData.tags.trim()) {
                const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                tagsArray.forEach(tag => submitData.append('tags', tag));
            }
            
            // Add images
            formData.images.forEach(image => {
                submitData.append('imageUrl', image);
            });

            const response = await api.post('/post/create-post', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Clear draft after successful post
            localStorage.removeItem('postDraft');
            
            // Success message
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
            successDiv.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Post published successfully!</span>
            `;
            document.body.appendChild(successDiv);
            setTimeout(() => document.body.removeChild(successDiv), 3000);

            // Redirect to profile or home
            navigate(`/profile/${user.username}`);
            
        } catch (error) {
            console.error('Error creating post:', error);
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            errorDiv.textContent = error.response?.data?.message || 'Failed to create post. Please try again.';
            document.body.appendChild(errorDiv);
            setTimeout(() => document.body.removeChild(errorDiv), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const saveDraft = () => {
        const draft = {
            ...formData,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('postDraft', JSON.stringify(draft));
        
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = 'Draft saved locally!';
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);
    };

    // Auto-save functionality
    const autoSave = () => {
        if (formData.title.trim() || formData.content.trim()) {
            const draft = {
                ...formData,
                savedAt: new Date().toISOString(),
                autoSaved: true
            };
            localStorage.setItem('postDraft', JSON.stringify(draft));
        }
    };

    // Auto-save every 30 seconds
    useState(() => {
        const interval = setInterval(autoSave, 30000);
        return () => clearInterval(interval);
    }, [formData]);

    const loadDraft = () => {
        const draft = localStorage.getItem('postDraft');
        if (draft) {
            const parsedDraft = JSON.parse(draft);
            const savedTime = new Date(parsedDraft.savedAt);
            const now = new Date();
            const timeDiff = (now - savedTime) / (1000 * 60); // minutes
            
            if (confirm(`Found a draft saved ${Math.round(timeDiff)} minutes ago. Do you want to load it?`)) {
                setFormData({
                    title: parsedDraft.title || '',
                    description: parsedDraft.description || '',
                    content: parsedDraft.content || '',
                    images: [],
                    isPublic: parsedDraft.isPublic ?? true,
                    tags: parsedDraft.tags || ''
                });
                
                const successDiv = document.createElement('div');
                successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                successDiv.textContent = 'Draft loaded successfully!';
                document.body.appendChild(successDiv);
                setTimeout(() => document.body.removeChild(successDiv), 3000);
            }
        } else {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'fixed top-4 right-4 bg-gray-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            infoDiv.textContent = 'No draft found.';
            document.body.appendChild(infoDiv);
            setTimeout(() => document.body.removeChild(infoDiv), 3000);
        }
    };

    return (
        <Layout showSidebar={false}>
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
                            <div className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={loadDraft}
                                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    Load Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={saveDraft}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    Save Draft
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter your post title..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none text-lg"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Brief description of your post..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content *
                            </label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(content) => {
                                    setFormData(prev => ({ ...prev, content }));
                                }}
                                placeholder="Write your blog post content here... Use the toolbar above for formatting options."
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-gray-500">
                                    {formData.content.replace(/<[^>]*>/g, '').length} characters (excluding HTML tags)
                                </p>
                                <p className="text-sm text-gray-400">
                                    Rich text editor • Supports images, tables, code blocks & more
                                </p>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="Enter tags separated by commas (e.g., technology, web, react)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Separate tags with commas
                            </p>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Images (Max 5)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="mt-4">
                                        <p className="text-lg font-medium text-gray-900">Click to upload images</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 10MB each</p>
                                    </div>
                                </label>
                            </div>

                            {/* Image Previews */}
                            {previewImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {previewImages.map((image, index) => (
                                        <div key={image.id} className="relative group">
                                            <img
                                                src={image.url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Visibility */}
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="isPublic"
                                    checked={formData.isPublic === true}
                                    onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Public</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="isPublic"
                                    checked={formData.isPublic === false}
                                    onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Private</span>
                            </label>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition duration-200 flex items-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Publishing...
                                    </>
                                ) : (
                                    'Publish Post'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </Layout>
    );
};

export default CreatePost;