import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ImageOff, Pencil } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { addToCart } from '../../store/cartSlice';
import { selectIsLoggedIn, selectCurrentUser } from '../../store/authSlice';
import type { Product } from '../../index';

// ── Props Interface ───────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
}

// ── Constants ─────────────────────────────────────────────────────────────

const FALLBACK_IMAGE = 'https://placehold.co/400x400?text=No+Image';

// ── Component ─────────────────────────────────────────────────────────────

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = user?.role === 'ADMIN';

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addedMsg, setAddedMsg] = useState<string>('');
  const [imgError, setImgError] = useState<boolean>(false);

  // ── Derived values ──────────────────────────────────────────────────────
  const price = Number(product.price) || 0;
  const discountPercent = Number(product.discount) || 0;
  const finalPrice = price - (price * discountPercent) / 100;
  const imageSrc = imgError || !product.image ? FALLBACK_IMAGE : product.image;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAddToCart = async (): Promise<void> => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsAdding(true);
    setAddedMsg('');

    const result = await dispatch(addToCart(product.id));

    if (addToCart.fulfilled.match(result)) {
      setAddedMsg('Added!');
      setTimeout(() => setAddedMsg(''), 2000);
    }
    setIsAdding(false);
  };

  const handleViewDetail = (): void => {
    navigate(`/product/${product.id}`);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">

      {/* Image */}
      <div className="relative">
        {imgError || !product.image ? (
          <div className="w-full h-48 rounded-lg bg-gray-100 flex flex-col items-center justify-center text-gray-400">
            <ImageOff size={36} />
            <span className="text-xs mt-2">No image</span>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleViewDetail}
            onError={() => setImgError(true)}
          />
        )}

        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercent}% OFF
          </div>
        )}

        {isAdmin && (
          <button
            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
            title="Edit product"
            className="absolute top-2 right-2 bg-white border border-gray-200 text-gray-700 rounded-full p-1.5 shadow hover:bg-blue-600 hover:text-white transition-colors"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex items-center flex-col mt-2 gap-2">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
          {product.category}
        </span>

        <h3
          onClick={handleViewDetail}
          className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 text-center cursor-pointer hover:text-blue-600 transition-colors"
        >
          {product.name}
        </h3>

        <p className={`text-xs mb-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
        </p>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-gray-900">₹{finalPrice.toFixed(2)}</span>
          {discountPercent > 0 && (
            <span className="text-sm text-gray-500 line-through">₹{price.toFixed(2)}</span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.floor(product.avgRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            {product.avgRating} ({product.reviewCount})
          </span>
        </div>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0 || isAdding}
        className={`mt-auto flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors disabled:opacity-50
          ${addedMsg ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        <ShoppingCart size={16} />
        {isAdding ? 'Adding...' : addedMsg ? '✓ Added!' : 'Add to Cart'}
      </button>
    </div>
  );
}
