import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

/**
 * Component to display a rating notification with star icons
 */
const RatingNotification = ({ rating = 5, farmerName = 'A farmer', feedback = '', timestamp }) => {
  // Convert rating to a number if it's not already
  const ratingNum = parseInt(rating, 10) || 5;
  
  return (
    <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-amber-800">Rating received</span>
        <span className="text-xs text-amber-600">
          {timestamp ? new Date(timestamp).toLocaleString() : 'Just now'}
        </span>
      </div>
      
      <div className="flex gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < ratingNum ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
          />
        ))}
      </div>
        <div className="text-sm text-gray-700">
        <span className="font-medium">{farmerName}</span> rated your consultation with {ratingNum} {ratingNum === 1 ? 'star' : 'stars'}
      </div>
      
      {feedback && (
        <blockquote className="mt-2 pl-2 border-l-2 border-amber-300 text-sm italic text-gray-600">
          {`"${feedback}"`}
        </blockquote>
      )}
    </div>
  );
};

RatingNotification.propTypes = {
  rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  farmerName: PropTypes.string,
  feedback: PropTypes.string,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
};

export default RatingNotification;
