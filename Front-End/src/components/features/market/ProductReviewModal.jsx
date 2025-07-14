import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, User, ShoppingBag, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StarRating from '../../shared/ui/StarRating';
import { addProductReview, getProductReviews, deleteProductReview } from '../../../utils/apiService';
import toast from 'react-hot-toast';

const ProductReviewModal = ({ 
    isOpen, 
    onClose, 
    product, 
    currentUser 
}) => {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');    const [showAddForm, setShowAddForm] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadReviews = useCallback(async () => {
        if (!product) return;
        
        try {
            setLoading(true);
            const response = await getProductReviews(product._id, page);
            if (response.success) {
                setReviews(response.data.reviews);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            toast.error(t('Failed to load reviews'));
        } finally {
            setLoading(false);
        }
    }, [product, page, t]);

    useEffect(() => {
        if (isOpen && product) {
            loadReviews();
        }
    }, [isOpen, product, page, loadReviews]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            toast.error(t('Please write a comment'));
            return;
        }

        try {
            setSubmitting(true);
            const response = await addProductReview(product._id, newRating, newComment.trim());
            if (response.success) {
                toast.success(response.message);
                setNewComment('');
                setNewRating(5);
                setShowAddForm(false);
                setPage(1);
                loadReviews();
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.message || t('Failed to submit review'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm(t('Are you sure you want to delete this review?'))) {
            return;
        }

        try {
            const response = await deleteProductReview(product._id, reviewId);
            if (response.success) {
                toast.success(response.message);
                loadReviews();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error(error.message || t('Failed to delete review'));
        }
    };

    const canAddReview = currentUser && currentUser._id !== product?.seller?._id;
    const userHasReviewed = reviews.some(review => review.user._id === currentUser?._id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-blue-50 rounded-t-2xl">
                    <div className="flex items-center gap-4">                        <img 
                            src={product?.image ? `http://localhost:5000/${product.image}` : '/user.png'}
                            alt={product?.name}
                            className="w-16 h-16 rounded-xl object-cover shadow-md border-2 border-gray-200"
                            onError={(e) => {
                                e.target.src = '/user.png';
                            }}
                        />
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{product?.name}</h2>
                            <div className="flex items-center gap-2">
                                <StarRating 
                                    rating={product?.averageRating || 0} 
                                    size={16}
                                    showCount={true}
                                    count={product?.reviewCount || 0}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Add Review Form */}
                    {canAddReview && !userHasReviewed && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            {!showAddForm ? (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                >
                                    {t('Write a Review')}
                                </button>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('Rating')}</label>
                                        <StarRating
                                            rating={newRating}
                                            onRatingChange={setNewRating}
                                            interactive={true}
                                            size={24}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t('Your Review')}</label>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                            rows="4"
                                            placeholder={t('Share your experience with this product...')}
                                            maxLength={500}
                                            required
                                        />
                                        <div className="text-right text-xs text-gray-500 mt-1">
                                            {newComment.length}/500
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddForm(false);
                                                setNewComment('');
                                                setNewRating(5);
                                            }}
                                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {t('Cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                                        >
                                            {submitting ? t('Submitting...') : t('Submit Review')}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Reviews List */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">{t('No Reviews Yet')}</h3>
                            <p className="text-gray-500">{t('Be the first to review this product!')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-800 mb-4">
                                {t('Customer Reviews')} ({reviews.length})
                            </h3>
                            {reviews.map((review) => (
                                <div key={review._id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-start justify-between mb-3">                                        <div className="flex items-center gap-3">                                            <img
                                                src={review.user.profileImage ? 
                                                    `http://localhost:5000/${review.user.profileImage}` : 
                                                    '/user.png'
                                                }
                                                alt={review.user.name}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                onError={(e) => {
                                                    e.target.src = '/user.png';
                                                }}
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-800">{review.user.name}</p>
                                                    {review.isVerifiedPurchase && (
                                                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                                                            <ShoppingBag className="w-3 h-3" />
                                                            <span>{t('Verified Purchase')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <StarRating rating={review.rating} size={14} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                            {currentUser?._id === review.user._id && (
                                                <button
                                                    onClick={() => handleDeleteReview(review._id)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                </div>
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`px-3 py-2 rounded-lg transition-colors ${
                                                page === pageNum
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>    );
};

ProductReviewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    product: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        image: PropTypes.string,
        averageRating: PropTypes.number,
        reviewCount: PropTypes.number,
        seller: PropTypes.shape({
            _id: PropTypes.string.isRequired
        })
    }),
    currentUser: PropTypes.shape({
        _id: PropTypes.string.isRequired
    })
};

export default ProductReviewModal;
