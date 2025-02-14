import { BASE_URL } from '../config/constants';
import user from '/src/assets/images/user.png';

export const getImageUrl = (imagePath) => {
    if (!imagePath) return user;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
};

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};