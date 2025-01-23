// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { Tab, Tabs, Table, Button, Form, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';
import PaginationControls from '../components/PaginationControls';
import { RevenueChart, TopProductsChart } from '../components/RevenueChart'
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    userId: '',
  });
  const [newProduct, setNewProduct] = useState({ 
    name: '', price: 0, description: '', category: '', image: '' 
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    topProducts: []
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
    totalItems: 0
  });

  // Generic data fetcher
  const fetchData = async (endpoint, params, setter) => {
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.get(`/api/admin/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...params
        }
      });
      setter(data.data);
      setPagination(prev => ({
        ...prev,
        totalItems: data.total,
        totalPages: data.totalPages
      }));
    } catch (err) {
      setError(err.response?.data?.error || `Failed to fetch ${endpoint}`);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchData('products', {}, setProducts);
    fetchData('users', {}, setUsers);
  }, [pagination.currentPage, pagination.itemsPerPage]);

  // Fetch orders with filters
  const fetchOrders = async () => {
    const params = {
      status: filters.status,
      userId: filters.userId,
      startDate: filters.startDate,
      endDate: filters.endDate
    };
    await fetchData('orders', params, setOrders);
  };

  useEffect(() => {
    fetchOrders();
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.get('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyticsData({
        revenue: data.revenueData,
        topProducts: data.topProducts
      });
    } catch (err) {
      setError('Failed to load analytics: ' + (err.response?.data?.error || err.message));
    }
  };
  
  // Add to useEffect that runs on component mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Products CRUD
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.post('/api/admin/products', newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts([...products, data]);
      setNewProduct({ name: '', price: 0, description: '', category: '', image: '' });
    } catch (err) {
      setError('Product creation failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // Add these functions
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.post('/api/admin/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewProduct({ ...newProduct, image: data.imageUrl });
    } catch (err) {
      setError('Image upload failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.post('/api/admin/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setEditingProduct(prev => ({ ...prev, image: data.imageUrl }));
    } catch (err) {
      setError('Image upload failed: ' + err.message);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.put(
        `/api/admin/products/${editingProduct._id}`,
        editingProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProducts(prev => 
        prev.map(p => p._id === data._id ? data : p)
      );
      setShowEditModal(false);
    } catch (err) {
      setError('Update failed: ' + err.message);
    }
  };

  // Delete For products
  const handleDeleteProductClick = (productId, productName) => {
    setItemToDelete({ id: productId, name: productName });
    setDeleteType('product');
    setShowDeleteModal(true);
  };

  // Orders
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map(order => order._id === data._id ? data : order));
    } catch (err) {
      setError('Status update failed: ' + (err.response?.data?.error || err.message));
    }
  };

  

  // Users
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRoleChange = async (userId, isAdmin) => {
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.put(
        `/api/admin/users/${userId}/role`,
        { isAdmin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(user => user._id === userId ? data : user));
    } catch (err) {
      setError('Role update failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // Common delete handler
  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'user') {
        await handleDeleteUser(itemToDelete.id);
      } else {
        await axios.delete(`/api/admin/products/${itemToDelete.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
        });
        setProducts(products.filter(p => p._id !== itemToDelete.id));
      }
      setShowDeleteModal(false);
    } catch (err) {
      setError('Deletion failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteUserClick = (userId, userName) => {
    setItemToDelete({ id: userId, name: userName });
    setDeleteType('user');
    setShowDeleteModal(true);
  };


  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateProduct}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={editingProduct?.name || ''}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={editingProduct?.price || 0}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={handleEditImageUpload}
                accept="image/*"
              />
              {editingProduct?.image && (
                <img 
                  src={editingProduct.image} 
                  alt="Preview" 
                  className="mt-2"
                  style={{ width: '100px' }}
                />
              )}
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <Tabs defaultActiveKey="products">
        <Tab eventKey="products" title="Products">
        <Form onSubmit={handleAddProduct} className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                required
              />
              {newProduct.image && (
                <img 
                  src={newProduct.image} 
                  alt="Preview" 
                  style={{ width: '100px', marginTop: '10px' }}
                />
              )}
            </Form.Group>
            <Button type="submit">Add Product</Button>
          </Form>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>
                    <Button 
                      variant="warning" 
                      className="me-2"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger"
                      onClick={() => handleDeleteProductClick(product._id, product.name)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <PaginationControls 
            pagination={pagination} 
            setPagination={setPagination}
          />
        </Tab>
        {/* Orders Tab */}
        <Tab eventKey="orders" title="Orders">
          {/* FILTERS */}
          <div className="mb-4">
            {/* Status Filter */}
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>

            {/* Date Range Filters */}
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </Form.Group>

            {/* User ID Filter */}
            <Form.Group className="mb-3">
              <Form.Label>User ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter User ID"
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              />
            </Form.Group>
          </div>    
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.user?.name}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <Form.Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Button 
                      as={Link} 
                      to={`/admin/orders/${order._id}`}
                      variant="info"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <PaginationControls 
            pagination={pagination} 
            setPagination={setPagination}
          />
        </Tab>
        {/* Users Tab */}
        <Tab eventKey="users" title="Users">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Form.Select
                      value={user.isAdmin}
                      onChange={(e) => 
                        handleRoleChange(user._id, e.target.value === 'true')
                      }
                    >
                      <option value={true}>Admin</option>
                      <option value={false}>User</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteUserClick(user._id, user.name)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <PaginationControls 
            pagination={pagination} 
            setPagination={setPagination}
          />
        </Tab>
        <Tab eventKey="analytics" title="Sales Dashboard">
          <div className="mt-4">
            <h4>Revenue Trends</h4>
            <div className="mb-5" style={{ height: '400px' }}>
              {analyticsData.revenue.length > 0 ? (
                <RevenueChart data={analyticsData.revenue} />
              ) : (
                <Alert variant="info">No revenue data available</Alert>
              )}
            </div>
            
            <h4>Top Performing Products</h4>
            <div style={{ height: '400px' }}>
              {analyticsData.topProducts.length > 0 ? (
                <TopProductsChart data={analyticsData.topProducts} />
              ) : (
                <Alert variant="info">No product sales data</Alert>
              )}
            </div>
          </div>
        </Tab>
      </Tabs>
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Body>
          Delete {deleteType}: {itemToDelete?.name}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>
      
    </div>
  );
};

export default AdminDashboard;
