import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ProductStats = ({ 
  totalProducts, 
  filteredProducts = null, 
  addProductLink, 
  addProductText,
  searchTerm = '',
  selectedCategory = '',
  onSearchChange = null,
  onCategoryChange = null,
  sortBy = 'name',
  onSortChange = null,
  t,
  showFilters = false 
}) => {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">إجمالي المنتجات</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">{totalProducts}</span>
            {filteredProducts !== null && filteredProducts !== totalProducts && (
              <span className="text-sm text-gray-500">({filteredProducts} معروض)</span>
            )}
          </div>
          <Link
            to={addProductLink}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
          >
            {addProductText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </Link>
        </div>

        {showFilters && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="البحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange?.('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange?.(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">كل الفئات</option>
                <option value="equipment">{t('common.Market.Equipment')}</option>
                <option value="pesticides">{t('common.Market.pesticides')}</option>
                <option value="seeds">{t('common.Market.seeds')}</option>
                <option value="vegetables">{t('common.Market.vegitables')}</option>
                <option value="fruits">{t('common.Market.Fruits')}</option>
                <option value="cotton">{t('common.Market.Cotton')}</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">ترتيب حسب الاسم</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
                <option value="quantity">الكمية</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ProductStats.propTypes = {
  totalProducts: PropTypes.number.isRequired,
  filteredProducts: PropTypes.number,
  addProductLink: PropTypes.string.isRequired,
  addProductText: PropTypes.string.isRequired,
  searchTerm: PropTypes.string,
  selectedCategory: PropTypes.string,
  onSearchChange: PropTypes.func,
  onCategoryChange: PropTypes.func,
  sortBy: PropTypes.string,
  onSortChange: PropTypes.func,
  t: PropTypes.func.isRequired,
  showFilters: PropTypes.bool
};

export default ProductStats;
