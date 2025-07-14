import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers, toggleBlockAdminUser, getImageUrl } from '../../../utils/apiService';
import toast from 'react-hot-toast';
import { Search, Filter, AlertTriangle, X, Check, Eye, UserCog } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      let queryParams = `page=${currentPage}&limit=10`;
      if (userTypeFilter) queryParams += `&userType=${userTypeFilter}`;
      if (searchQuery) queryParams += `&search=${searchQuery}`;
      
      const response = await getAdminUsers(queryParams);
      
      if (response.success) {
        setUsers(response.data);
        
        // Calculate total pages
        if (response.pagination) {
          setTotalPages(Math.ceil(response.total / 10));
        }
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(error.message || 'An error occurred while loading users');
    } finally {
      setLoading(false);
    }
  

  }, [currentPage, userTypeFilter, searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const handleToggleBlock = async (userId, isCurrentlyBlocked) => {
    try {
      const action = isCurrentlyBlocked ? 'unblock' : 'block';
      const confirmed = window.confirm(
        `Are you sure you want to ${action} this user?`
      );

      if (!confirmed) return;

      const response = await toggleBlockAdminUser(userId);
      
      if (response.success) {
        toast.success(response.message || `User ${action}ed successfully`);
        
        // Update user in the state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, blocked: !user.blocked } : user
          )
        );
      } else {
        toast.error(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${isCurrentlyBlocked ? 'unblocking' : 'blocking'} user:`, error);
      toast.error(error.message || `An error occurred while ${isCurrentlyBlocked ? 'unblocking' : 'blocking'} user`);
    }
  };

  const getUserTypeLabel = (userType) => {
    switch(userType) {
      case 'farmer': return { color: 'bg-blue-100 text-blue-800', label: 'Farmer' };
      case 'expert': return { color: 'bg-purple-100 text-purple-800', label: 'Expert' };
      case 'company': return { color: 'bg-orange-100 text-orange-800', label: 'Company' };
      default: return { color: 'bg-gray-100 text-gray-800', label: userType };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <div className="text-sm text-gray-500">
          Showing {users.length} of {users.length} users
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-green-500 text-white rounded"
            >
              Search
            </button>
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400" />
          <select
            value={userTypeFilter}
            onChange={(e) => {
              setUserTypeFilter(e.target.value);
              setCurrentPage(1); // Reset to first page
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All User Types</option>
            <option value="farmer">Farmers</option>
            <option value="expert">Experts</option>
            <option value="company">Companies</option>
          </select>
        </div>
      </div>
      
      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
          <AlertTriangle className="text-yellow-500 mr-3 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-yellow-800">No users found</h3>
            <p className="text-yellow-700 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">User Info</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Contact</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Type</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Registered</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const userType = getUserTypeLabel(user.userType);
                return (
                  <tr key={user._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {user.profileImage ? (
                            <img 
                              src={getImageUrl(user.profileImage)}
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40?text=' + user.name.charAt(0).toUpperCase();
                              }}
                            />
                          ) : (
                            <span className="text-gray-500 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${userType.color}`}>
                        {userType.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.blocked ? (
                          <X className="mr-1" size={12} />
                        ) : (
                          <Check className="mr-1" size={12} />
                        )}
                        {user.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        
                        <button
                          onClick={() => handleToggleBlock(user._id, user.blocked)}
                          className={`p-1.5 hover:bg-${user.blocked ? 'green' : 'red'}-50 rounded-full
                            ${user.blocked ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}`}
                          title={user.blocked ? 'Unblock User' : 'Block User'}
                        >
                          <UserCog size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;