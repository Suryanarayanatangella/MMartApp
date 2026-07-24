import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Package, RefreshCw } from 'lucide-react';
import { useAppSelector } from '../hooks/hooks';
import { selectCurrentUser } from '../store/authSlice';
import api from '../api/api';
import BillModal from '../modals/BillModal';
import type { Order, OrderStatus } from '../types/index';

// ── Constants ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED:    'bg-indigo-100 text-indigo-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
  RETURNED:   'bg-gray-100 text-gray-800',
};

const ALL_STATUSES: OrderStatus[] = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED',
];

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const user = useAppSelector(selectCurrentUser);

  const [orders,        setOrders]        = useState<Order[]>([]);
  const [loading,       setLoading]       = useState<boolean>(true);
  const [error,         setError]         = useState<string>('');
  const [filterStatus,  setFilterStatus]  = useState<OrderStatus | ''>('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingId,    setUpdatingId]    = useState<string | null>(null);
  const [billOrder,     setBillOrder]     = useState<Order | null>(null);

  const fetchOrders = useCallback(async (status: OrderStatus | '' = ''): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = { limit: 50 };
      if (status) params.status = status;
      const res = await api.get('/api/orders/admin/all', { params });
      setOrders((res as unknown as { orders: Order[] }).orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(filterStatus); }, [filterStatus, fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus): Promise<void> => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  // AdminLayout handles the admin guard — no need for early return here
  if (user && user.role !== 'ADMIN') return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-1">
            {orders.length} orders {filterStatus ? `with status: ${filterStatus}` : 'total'}
          </p>
        </div>
        <button aria-label="Refresh orders"
          onClick={() => fetchOrders(filterStatus)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Status filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {ALL_STATUSES.map((s) => (
          <button aria-label={`Filter by status: ${s}`} key={s}
            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`p-3 rounded-xl text-center border-2 transition-all ${
              filterStatus === s ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white'
            }`}>
            <p className="text-xl font-bold text-gray-900">{counts[s] || 0}</p>
            <p className={`text-xs font-medium mt-1 px-1.5 py-0.5 rounded-full ${STATUS_COLORS[s]}`}>{s}</p>
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-4 opacity-40" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div className="min-w-[160px]">
                  <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <p className="text-sm font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</p>
                  <p className="text-xs text-gray-500">{order.user.email}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{order.items.length}</p>
                  <p className="text-xs text-gray-500">items</p>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-sm font-bold text-gray-900">₹{Number(order.finalAmount).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">total</p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <select value={order.status} disabled={updatingId === order.id}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[order.status]}`}>
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="text-gray-400">
                  {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <button aria-label="View bill" onClick={() => setBillOrder(order)}
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors">
                    🧾 View Bill
                  </button>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <img src={item.product?.image || 'https://placehold.co/48x48'}
                              alt={item.product?.name}
                              className="w-10 h-10 object-cover rounded-lg flex-shrink-0" loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/48x48'; }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product?.name || 'Deleted product'}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200 space-y-1 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span><span>₹{Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                        {Number(order.discount) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span><span>-₹{Number(order.discount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>Total Paid</span><span>₹{Number(order.finalAmount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Shipping Details</h4>
                      <div className="bg-white rounded-lg p-4 text-sm text-gray-700 space-y-1 border border-gray-100">
                        <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                        <p>{order.shippingAddress}</p>
                        <p>{order.shippingCity}, {order.shippingState} — {order.shippingZip}</p>
                        <p className="text-gray-500">📞 {order.shippingPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BillModal order={billOrder} onClose={() => setBillOrder(null)} />
    </div>
  );
}
