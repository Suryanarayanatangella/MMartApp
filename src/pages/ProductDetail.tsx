import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, ShoppingCart, ArrowLeft, ImageOff,
  Truck, ShieldCheck, RefreshCw, Package,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../api/api';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { addToCart } from '../store/cartSlice';
import { selectIsLoggedIn, selectCurrentUser } from '../store/authSlice';
import type { Product, Review } from '../types/index';

const FALLBACK = 'https://placehold.co/600x600?text=No+Image';

export default function ProductDetail() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();

  const isLoggedIn  = useAppSelector(selectIsLoggedIn);
  const currentUser = useAppSelector(selectCurrentUser);

  const [product,       setProduct]       = useState<Product | null>(null);
  const [reviews,       setReviews]       = useState<Review[]>([]);
  const [avgRating,     setAvgRating]     = useState<number>(0);
  const [loading,       setLoading]       = useState<boolean>(true);
  const [error,         setError]         = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imgError,      setImgError]      = useState<boolean>(false);
  const [canReview,     setCanReview]     = useState<boolean>(false);

  const [isAdding,   setIsAdding]   = useState<boolean>(false);
  const [addedMsg,   setAddedMsg]   = useState<string>('');
  const [rating,     setRating]     = useState<number>(0);
  const [hoverRating,setHoverRating]= useState<number>(0);
  const [comment,    setComment]    = useState<string>('');
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewError,   setReviewError]   = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api.get(`/api/products/${id}`)
      .then((res) => {
        const p = (res as unknown as { product: Product }).product;
        setProduct(p);
        setSelectedImage(p.image || p.images?.[0] || null);
      })
      .catch((err: Error) => setError(err.message || 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/reviews/product/${id}`)
      .then((res) => {
        const r = res as unknown as { reviews: Review[]; avgRating: number };
        setReviews(r.reviews || []);
        setAvgRating(r.avgRating || 0);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id || !isLoggedIn) { setCanReview(false); return; }
    api.get(`/api/reviews/eligible/${id}`)
      .then((res) => setCanReview((res as unknown as { eligible: boolean }).eligible === true))
      .catch(() => setCanReview(false));
  }, [id, isLoggedIn]);

  const handleAddToCart = async (): Promise<void> => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!product) return;
    setIsAdding(true);
    const result = await dispatch(addToCart(product.id));
    if (addToCart.fulfilled.match(result)) {
      setAddedMsg('Added to cart!');
      setTimeout(() => setAddedMsg(''), 2500);
      navigate('/cart');
    }
    setIsAdding(false);
  };

  const handleSubmitReview = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    if (rating === 0) { setReviewError('Please select a rating'); return; }
    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      await api.post('/api/reviews', { productId: id, rating, comment });
      setReviewSuccess('Review submitted successfully!');
      setRating(0);
      setComment('');
      const res = await api.get(`/api/reviews/product/${id}`);
      const r = res as unknown as { reviews: Review[]; avgRating: number };
      setReviews(r.reviews || []);
      setAvgRating(r.avgRating || 0);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const price      = Number(product?.price)    || 0;
  const discount   = Number(product?.discount) || 0;
  const finalPrice = price - (price * discount) / 100;
  const allImages  = product
    ? [product.image, ...(product.images || [])].filter(Boolean) as string[]
    : [];
  const hasAlreadyReviewed = reviews.some((r) => r.user?.id === currentUser?.id);

  if (loading) return (
    <div><Header />
      <div className="max-w-6xl mx-auto px-4 py-24 text-center text-gray-400">Loading product...</div>
    <Footer /></div>
  );

  if (error || !product) return (
    <div><Header />
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
        <button aria-label="Back to store" onClick={() => navigate('/store')} className="text-blue-600 hover:underline">← Back to Store</button>
      </div>
    <Footer /></div>
  );

  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button aria-label="Go back" onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <div>
            <div className="bg-gray-50 rounded-xl overflow-hidden mb-3 aspect-square flex items-center justify-center">
              {imgError || !selectedImage ? (
                <div className="flex flex-col items-center text-gray-300">
                  <ImageOff size={48} /><span className="text-sm mt-2">No image</span>
                </div>
              ) : (
                <img src={selectedImage} alt={product.name} loading="lazy"
                  className="w-full h-full object-cover" onError={() => setImgError(true)} />
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button aria-label={`View image ${i + 1}`} key={i}
                    onClick={() => { setSelectedImage(img); setImgError(false); }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === img ? 'border-blue-500' : 'border-gray-200'}`}>
                    <img src={img} alt={`view ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">{product.category}</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} size={16} className={i <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{avgRating}</span>
              <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">₹{finalPrice.toFixed(2)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{price.toFixed(2)}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">-{discount}% OFF</span>
                </>
              )}
            </div>
            <p className={`text-sm font-medium mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>
            <button aria-label="Add to cart" onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 mb-4 ${addedMsg ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <ShoppingCart size={18} />
              {isAdding ? 'Adding...' : addedMsg ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {([
                { icon: <Truck size={16} />,       text: 'Free delivery over ₹500' },
                { icon: <ShieldCheck size={16} />, text: 'Quality assured'          },
                { icon: <RefreshCw size={16} />,   text: 'Easy returns'             },
                { icon: <Package size={16} />,     text: 'Secure packaging'         },
              ] as const).map((perk) => (
                <div key={perk.text} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                  <span className="text-blue-500">{perk.icon}</span>{perk.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t pt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Customer Reviews <span className="ml-2 text-sm font-normal text-gray-400">({reviews.length})</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
              ) : reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {review.user?.firstName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {review.user?.firstName} {review.user?.lastName}
                      </span>
                    </div>
                    <div className="flex">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} size={13} className={i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Write a Review</h3>
              {!isLoggedIn ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                  Please <button aria-label="Log in" onClick={() => navigate('/login')} className="underline font-medium">log in</button> to leave a review.
                </div>
              ) : hasAlreadyReviewed ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">You've already reviewed this product. Thank you!</div>
              ) : !canReview ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">You can only review this product after it has been delivered.</div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating <span className="text-red-500">*</span></label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <button aria-label={`Rate ${i} stars`} key={i} type="button"
                          onClick={() => setRating(i)}
                          onMouseEnter={() => setHoverRating(i)}
                          onMouseLeave={() => setHoverRating(0)} className="p-0.5">
                          <Star size={28} className={i <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
                      placeholder="Share your experience..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}
                  {reviewSuccess && <p className="text-sm text-green-600">{reviewSuccess}</p>}
                  <button aria-label="Submit review" type="submit" disabled={reviewLoading}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60">
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
