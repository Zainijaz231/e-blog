import api from './axios';

// Like/Unlike post
export const toggleLike = async (postId) => {
    try {
        const response = await api.post(`/post/${postId}/like`);
        return response.data;
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
};

// Get post details (for checking if user liked)
export const getPostDetails = async (postId) => {
    try {
        const response = await api.get(`/post/details/${postId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching post details:', error);
        throw error;
    }
};

// Add comment
export const addComment = async (postId, content) => {
    try {
        const response = await api.post(`/post/${postId}/comment`, { content });
        return response.data;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
};

// Delete comment
export const deleteComment = async (postId, commentId) => {
    try {
        const response = await api.delete(`/post/${postId}/comments/${commentId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
};