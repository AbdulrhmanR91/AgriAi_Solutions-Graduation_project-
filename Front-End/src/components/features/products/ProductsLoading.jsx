import PropTypes from 'prop-types';
const ProductCardSkeleton = () => (
  <div className="product-card overflow-hidden animate-pulse">
    <div className="w-full h-52 bg-gray-300 shimmer"></div>
    <div className="p-5 space-y-3">
      <div className="h-6 bg-gray-300 rounded shimmer"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 shimmer"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-300 rounded w-20 shimmer"></div>
        <div className="h-4 bg-gray-300 rounded w-16 shimmer"></div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-300 rounded shimmer"></div>
        <div className="flex-1 h-10 bg-gray-300 rounded shimmer"></div>
      </div>
    </div>
  </div>
);

const ProductsLoading = ({ count = 8 }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* Header Skeleton */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-10 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-lg shimmer"></div>
              <div>
                <div className="h-8 bg-gray-300 rounded w-32 shimmer mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-24 shimmer"></div>
              </div>
            </div>
            <div className="w-32 h-12 bg-gray-300 rounded-xl shimmer"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Skeleton */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-6 bg-gray-300 rounded w-32 shimmer"></div>
                <div className="h-8 bg-gray-300 rounded w-8 shimmer"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-24 shimmer"></div>
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </main>
    </div>
  );
};

ProductsLoading.propTypes = {
  count: PropTypes.number
};

export default ProductsLoading;
