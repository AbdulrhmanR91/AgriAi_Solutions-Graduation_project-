import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAdminUserDetails, deleteAdminUser, getImageUrl } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Briefcase, Building, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await getAdminUserDetails(id);
        if (response.success) {
          setUser(response.data);
        } else {
          toast.error('Failed to load user details');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error(error.message || 'An error occurred while loading user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      const response = await deleteAdminUser(id);
      if (response.success) {
        toast.success('User deleted successfully');
        navigate('/admin/users');
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'An error occurred while deleting user');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderUserTypeSpecificDetails = () => {
    if (!user) return null;

    switch (user.userType) {
      case 'farmer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="mr-2 text-green-600" size={20} />
                Farm Details
              </h3>
              {user.farmDetails ? (
                <div className="space-y-3">
                  {user.farmDetails.farms && user.farmDetails.farms.length > 0 ? (
                    user.farmDetails.farms.map((farm, index) => (
                      <div key={index} className="border-l-4 border-green-400 pl-4 mb-4">
                        <h4 className="font-medium text-green-700">Farm #{index + 1}</h4>
                        <p><span className="font-medium">Name:</span> {farm.farmName || 'Not specified'}</p>
                        <p><span className="font-medium">Size:</span> {farm.farmSize} acres</p>
                        <p><span className="font-medium">Location:</span> {farm.farmLocationText || 'Not specified'}</p>
                        <p><span className="font-medium">Crops:</span> {farm.mainCrops?.join(', ') || 'Not specified'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No farms registered</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No farm details available</p>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Activity Statistics</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Products listed:</span> {user.productCount || 0}</p>
                <p><span className="font-medium">Orders placed:</span> {user.orderCount?.placed || 0}</p>
                <p><span className="font-medium">Orders received:</span> {user.orderCount?.received || 0}</p>
                <p><span className="font-medium">Plant analyses:</span> {user.analysisCount || 0}</p>
              </div>
            </div>
          </div>
        );
        
      case 'expert':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Briefcase className="mr-2 text-green-600" size={20} />
                Expert Details
              </h3>
              {user.expertDetails ? (
                <div className="space-y-3">
                  <p><span className="font-medium">Expertise:</span> {user.expertDetails.expertAt || 'Not specified'}</p>
                  <p><span className="font-medium">University:</span> {user.expertDetails.university || 'Not specified'}</p>
                  <p><span className="font-medium">College:</span> {user.expertDetails.college || 'Not specified'}</p>
                  <div>
                    <p className="font-medium mb-1">Services:</p>
                    {user.expertDetails.services ? (
                      <ul className="list-disc pl-5">
                        {user.expertDetails.services.split(',').map((service, index) => (
                          <li key={index} className="text-gray-700">{service.trim()}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No services listed</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No expert details available</p>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Consultation Statistics</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Total consultations:</span> {user.consultCount?.total || 0}</p>
                <p><span className="font-medium">Pending consultations:</span> {user.consultCount?.pending || 0}</p>
                <p><span className="font-medium">Completed consultations:</span> {user.consultCount?.completed || 0}</p>
                <p><span className="font-medium">Average rating:</span> {user.averageRating || 'No ratings yet'}</p>
              </div>
            </div>
          </div>
        );
        
      case 'company':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="mr-2 text-green-600" size={20} />
                Company Details
              </h3>
              {user.companyDetails ? (
                <div className="space-y-3">
                  <p><span className="font-medium">Company Name:</span> {user.companyDetails.companyName || user.name}</p>
                  <p><span className="font-medium">Business Address:</span> {user.companyDetails.businessAddress || 'Not specified'}</p>
                  <p><span className="font-medium">Trade License Number:</span> {user.companyDetails.tradeLicenseNumber || 'Not provided'}</p>
                  <p><span className="font-medium">Tax Registration Number:</span> {user.companyDetails.taxRegistrationNumber || 'Not provided'}</p>
                </div>
              ) : (
                <p className="text-gray-500">No company details available</p>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Business Statistics</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Products listed:</span> {user.productCount || 0}</p>
                <p><span className="font-medium">Orders received:</span> {user.orderCount?.received || 0}</p>
                <p><span className="font-medium">Orders placed:</span> {user.orderCount?.placed || 0}</p>
                <p><span className="font-medium">Revenue generated:</span> EGP {user.revenue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return <p className="text-gray-500">No additional details available for this user type.</p>;
    }
  };

  // Delete confirmation modal
  const DeleteConfirmDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in">
        <h3 className="text-xl font-bold text-red-600 mb-4">Delete User</h3>
        <p className="mb-6">Are you sure you want to permanently delete user <span className="font-semibold">{user?.name}</span>? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={handleDeleteUser}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center"
          >
            <Trash2 size={16} className="mr-2" /> Delete User
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">User Not Found</h2>
          <p className="mt-2">The requested user could not be found or you don&apos;t have permission to view it.</p>
          <Link to="/admin/users" className="mt-4 inline-flex items-center text-red-700 hover:text-red-800">
            <ArrowLeft size={16} className="mr-2" /> Back to Users List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Link to="/admin/users" className="inline-flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft size={16} className="mr-2" /> Back to Users List
        </Link>
        
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          <Trash2 size={16} className="mr-2" /> Delete User
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-green-600 to-green-400 p-6 text-white">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden">
              {user.profileImage ? (
                <img 
                  src={getImageUrl(user.profileImage)} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=' + user.name.charAt(0).toUpperCase();
                  }}
                />
              ) : (
                <span className="text-green-600 text-3xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                  ${user.userType === 'farmer' ? 'bg-blue-100 text-blue-800' : 
                    user.userType === 'expert' ? 'bg-purple-100 text-purple-800' : 
                    'bg-orange-100 text-orange-800'}`
                }>
                  {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                </span>
                <span className={`ml-2 inline-block px-3 py-1 rounded-full text-xs font-semibold
                  ${user.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`
                }>
                  {user.blocked ? 'Blocked' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User className="mr-2 text-green-600" size={20} />
                Personal Information
              </h2>
              <div className="space-y-3">
                <p className="flex items-center">
                  <Mail className="mr-3 text-gray-400" size={18} />
                  <span className="font-medium mr-2">Email:</span> {user.email}
                </p>
                <p className="flex items-center">
                  <Phone className="mr-3 text-gray-400" size={18} />
                  <span className="font-medium mr-2">Phone:</span> {user.phone}
                </p>
                <p className="flex items-center">
                  <Calendar className="mr-3 text-gray-400" size={18} />
                  <span className="font-medium mr-2">Joined:</span> {formatDate(user.createdAt)}
                </p>
                <p className="flex items-center">
                  {user.blocked ? 
                    <XCircle className="mr-3 text-red-500" size={18} /> : 
                    <CheckCircle className="mr-3 text-green-500" size={18} />
                  }
                  <span className="font-medium mr-2">Account Status:</span> 
                  {user.blocked ? 'Blocked' : 'Active'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium -mb-px ${
                activeTab === 'profile' 
                  ? 'border-b-2 border-green-500 text-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} Details
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium -mb-px ${
                activeTab === 'orders' 
                  ? 'border-b-2 border-green-500 text-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            {user.userType !== 'expert' && (
              <button
                className={`px-6 py-3 text-sm font-medium -mb-px ${
                  activeTab === 'products' 
                    ? 'border-b-2 border-green-500 text-green-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('products')}
              >
                Products
              </button>
            )}
          </nav>
        </div>
        
        {activeTab === 'profile' && renderUserTypeSpecificDetails()}
        
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Orders History</h3>
            {user.orders && user.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {user.orders.map(order => (
                      <tr key={order._id}>
                        <td className="px-4 py-2 text-sm">{order._id}</td>
                        <td className="px-4 py-2 text-sm">{order.product?.name || 'Unknown'}</td>
                        <td className="px-4 py-2 text-sm">EGP {order.totalPrice}</td>
                        <td className="px-4 py-2 text-sm">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No orders found for this user.</p>
            )}
          </div>
        )}
        
        {activeTab === 'products' && user.userType !== 'expert' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Products Listed</h3>
            {user.products && user.products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.products.map(product => (
                  <div key={product._id} className="border rounded-lg overflow-hidden">
                    <div className="h-40 bg-gray-100">
                      {product.image ? (
                        <img 
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{product.type}</p>
                      <div className="mt-2 flex justify-between">
                        <span className="text-green-600 font-bold">EGP {product.price}</span>
                        <span className="text-gray-500">Qty: {product.quantity}</span>
                      </div>
                      {product.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No products found for this user.</p>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && <DeleteConfirmDialog />}
    </div>
  );
};

export default UserDetails;