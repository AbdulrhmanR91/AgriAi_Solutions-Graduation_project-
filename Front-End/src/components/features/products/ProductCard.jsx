import { Card, CardContent } from '../../shared/ui/card';
import { Edit, Trash2, Pencil } from 'lucide-react';
import PropTypes from 'prop-types';

const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  getImageUrl, 
  userImage, 
  t,
  iconType = 'edit' // 'edit' or 'pencil'
}) => {
  const EditIcon = iconType === 'pencil' ? Pencil : Edit;

  return (
    <Card className="product-card group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
      <div className="relative w-full h-52 overflow-hidden">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="product-image w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            console.log('Image failed to load:', product.image);
            e.target.src = userImage;
            e.target.onerror = null;
          }}
          onLoad={() => console.log('Image loaded successfully:', product.image)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onEdit(product)}
            className="action-button p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            title="تعديل المنتج"
          >
            <EditIcon className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="action-button p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 transition-colors"
            title="حذف المنتج"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="category-badge px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
            {t(`common.Market.${product.type}`) || product.type}
          </span>
        </div>

        {/* Status Indicator */}
        {product.quantity === 0 && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              نفد المخزون
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-green-600 transition-colors">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">{product.price}</span>
              <span className="text-sm text-gray-500 font-medium">{t('common.EGP')}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{t('common.Available')}</p>
              <p className={`text-sm font-semibold ${product.quantity === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                {product.quantity}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
            >
              <EditIcon className="w-4 h-4" />
              {t('common.Edit')}
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              {t('common.Delete')}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    quantity: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    image: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  getImageUrl: PropTypes.func.isRequired,
  userImage: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  iconType: PropTypes.oneOf(['edit', 'pencil'])
};

export default ProductCard;
