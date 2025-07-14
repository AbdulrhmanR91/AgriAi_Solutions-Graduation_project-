import React from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

const StarRating = ({ 
    rating = 0, 
    onRatingChange = null, 
    size = 20, 
    interactive = false,
    showCount = false,
    count = 0,
    className = ""
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    const handleStarClick = (starValue) => {
        if (interactive && onRatingChange) {
            onRatingChange(starValue);
        }
    };

    const handleStarHover = (starValue) => {
        if (interactive) {
            setHoverRating(starValue);
        }
    };

    const handleStarLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = interactive ? (hoverRating || rating) : rating;

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={size}
                        className={`transition-colors ${
                            interactive 
                                ? 'cursor-pointer hover:scale-110 transition-transform' 
                                : ''
                        } ${
                            star <= displayRating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                        }`}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={handleStarLeave}
                    />
                ))}
            </div>
            {showCount && count > 0 && (
                <span className="text-sm text-gray-500 ml-1">
                    ({count} {count === 1 ? 'review' : 'reviews'})
                </span>
            )}
        </div>    );
};

StarRating.propTypes = {
    rating: PropTypes.number,
    onRatingChange: PropTypes.func,
    size: PropTypes.number,
    interactive: PropTypes.bool,
    showCount: PropTypes.bool,
    count: PropTypes.number,
    className: PropTypes.string
};

export default StarRating;
