import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus, Search, RefreshCw, ImageOff, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import api from '../../api/api';
import type { Product } from '../../index';

// ── Types ─────────────────────────────────────────────────────────────────

interface Pagination {
  total: number;
  page:  number;
  limit: number;
  pages: number;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminProducts() {
  const navigate = useNavigate();

  const [products,    setProducts]   = useState<Product[]>([]);
  const [pagination,  setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, pages: 1 });
  const [loading,     setLoading]    = useState<boolean>(true);
  const [error,       setError]      = useState<string>('');
  const [search,      setSearch]     = useState<string>('');
  const [searchInput, setSearchInput]= useState<string>('');
  const [deletingId,  setDeletingId] = useState<string | null>(null);

  // ── Fetch products ────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (page = 1): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = { page, limit: 12 };
      if (search) params.search = search;

      const res = await api.get('/api/products', { params });
      const data = res as unknown as { products: Product[]; pagination: Pagination };
      setProducts(data.products || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 12, pages: 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleDelete = async (product: Product): Promise<void> => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await api.delete(`/api/products/${product.id}`);
      // Remove from local state — no refetch needed
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage: number): void => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchProducts(newPage);
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total <strong>{pagination.total}</strong> product{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); }}
            className="px-4 py-2 text-sm text-red-500 hover:underline"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={() => fetchProducts(pagination.page)}
          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Discount</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton rows
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                      </div>
                    </td>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16 ml-auto" />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No products found{search ? ` for "${search}"` : ''}</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const price     = Number(product.price)    || 0;
                  const discount  = Number(product.discount) || 0;
                  const finalPrice = price - (price * discount) / 100;

                  return (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">

                      {/* Product name + image */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <ImageOff size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-400">ID: {product.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        <p className="font-semibold text-gray-900">₹{finalPrice.toFixed(2)}</p>
                        {discount > 0 && (
                          <p className="text-xs text-gray-400 line-through">₹{price.toFixed(2)}</p>
                        )}
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3 text-right">
                        {discount > 0 ? (
                          <span className="text-red-600 font-medium">{discount}% OFF</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {product.stock > 0 ? product.stock : 'Out of stock'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages} — {pagination.total} products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 text-gray-500 hover:text-blue-600 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">
                {pagination.page}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 text-gray-500 hover:text-blue-600 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
