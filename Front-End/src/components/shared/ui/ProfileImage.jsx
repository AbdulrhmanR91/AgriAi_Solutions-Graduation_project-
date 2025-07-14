import { useState } from 'react';
import PropTypes from 'prop-types';
import { User } from 'lucide-react';

const ProfileImage = ({ 
    src, 
    alt, 
    className = "w-10 h-10 rounded-full object-cover",
    showDefaultIcon = false 
}) => {
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleImageError = () => {
        setImageError(true);
        setLoading(false);
    };

    const handleImageLoad = () => {
        setLoading(false);
    };

    // If no src provided or image failed to load, show default
    if (!src || imageError) {
        if (showDefaultIcon) {
            return (
                <div className={`${className} bg-gray-200 flex items-center justify-center`}>
                    <User className="w-1/2 h-1/2 text-gray-400" />
                </div>
            );
        }        return (
            <img 
                src="/user.png"
                alt={alt || 'Profile'}
                className={className}
            />
        );
    }

    return (
        <div className="relative">
            {loading && (
                <div className={`${className} bg-gray-200 animate-pulse`}></div>
            )}
            <img 
                src={src}
                alt={alt || 'Profile'}
                className={`${className} ${loading ? 'opacity-0 absolute' : ''}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
            />
        </div>    );
};

ProfileImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string,
    showDefaultIcon: PropTypes.bool
};

export default ProfileImage;
