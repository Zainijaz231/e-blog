import api from '../api/axios';

// Upload image to Cloudinary via backend
export const uploadImageToCloudinary = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data.imageUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
};

// Convert blob to file for upload
export const blobToFile = (blob, fileName) => {
    return new File([blob], fileName, { type: blob.type });
};