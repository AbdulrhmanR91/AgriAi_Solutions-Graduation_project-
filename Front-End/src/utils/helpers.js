import config from '../config/config';
import user from '/src/assets/images/user.png';

export const getImageUrl = (imagePath, defaultImage = null) => {
  if (!imagePath) return defaultImage || user;
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/')) {
    return `${config.API_URL}${imagePath}`;
  }
  
  return `${config.API_URL}/${imagePath}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};