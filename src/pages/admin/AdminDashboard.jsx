import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Users, TrendingUp, Plus, Eye } from 'lucide-react';
import api from '../../api/api';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders for stats
        const ordersRes = await api.get('/api/orders/admin/all', {
          params: { limit: 100 }
        });
        const orders = ordersRes.orders || [];

        // Fetch products for count
        const productsRes = await api.get('/api/products', { params: { limit: 1 } });

        const totalRevenue = orders.reduce(
          (sum, o) => sum + Number(o.finalAmount), 0
        );
        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders,
          totalProducts: productsRes.pagination?.total || 0,
        });

        // Show 5 most recent orders
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingBag size={22} className="text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: <TrendingUp size={22} className="text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <Package size={22} className="text-yellow-600" />,
      bg: 'bg-yellow-50',
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      icon: <Users size={22} className="text-purple-600" />,
      bg: 'bg-purple-50',
    },
  ];

  const STATUS_COLORS = {
    PENDING:    'bg-yellow-100 text-yellow-800',
    CONFIRMED:  'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED:    'bg-indigo-100 text-indigo-800',
    DELIVERED:  'bg-green-100 text-green-800',
    CANCELLED:  'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-white rounded-xl p-5 shadow-sm text-left hover:shadow-md transition-shadow border border-gray-100 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Manage Orders</p>
              <p className="text-sm text-gray-500 mt-1">View, update, and track all orders</p>
            </div>
            <Eye size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/products/new')}
          className="bg-white rounded-xl p-5 shadow-sm text-left hover:shadow-md transition-shadow border border-gray-100 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Add New Product</p>
              <p className="text-sm text-gray-500 mt-1">Upload images, set price and stock</p>
            </div>
            <Plus size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </button>
      </div>

      {/* Recent orders table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-sm text-blue-600 hover:underline"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No orders yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    {order.user?.firstName} {order.user?.lastName}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  {order.status}
                </span>
                <p className="text-sm font-bold text-gray-900 min-w-[80px] text-right">
                  ₹{Number(order.finalAmount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}