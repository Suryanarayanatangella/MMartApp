import { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SmartSearchBar from '../components/ui/SmartSearchBar';
import ProductCard from '../components/ui/ProductCard';
import api from '../api/api';

import crockeryBrands  from '../assets/images/crockery-brands.jpg';
import detergentBrands from '../assets/images/detergent-brands.jpg';
import diaperBrands    from '../assets/images/diapper-brands.jpg';
import halfpriceStore  from '../assets/images/halfprice-store.jpg';
import riceBrands      from '../assets/images/Rice-brands.jpg';

import type { Product, AISearchResult } from '../types/index';

// ── Component ─────────────────────────────────────────────────────────────

export default function Store() {
  const location     = useLocation();
  const navigate     = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery     = searchParams.get('search')   || '';
  const aiQuery         = searchParams.get('aiQuery')  || '';
  const categoryFromUrl = searchParams.get('category') || '';

  const [products,         setProducts]         = useState<Product[]>([]);
  const [allByCategory,    setAllByCategory]    = useState<Record<string, Product[]>>({});
  const [categories,       setCategories]       = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [loading,          setLoading]          = useState<boolean>(false);
  const [error,            setError]            = useState<string | null>(null);
  const [page,             setPage]             = useState<number>(1);
  const [aiResults,        setAiResults]        = useState<AISearchResult | null>(null);

  const limit = 12;

  // Sync category from URL — derive directly, avoid setState in effect
  const effectiveCategory = categoryFromUrl;

  useEffect(() => {
    setSelectedCategory(effectiveCategory);
    setPage(1);
    setAiResults(null);
  }, [effectiveCategory]);

  // Fetch AI results
  useEffect(() => {
    if (!aiQuery) {
      setAiResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    api.post<AISearchResult>('/api/search/ai', { query: aiQuery })
      .then((res) => {
        setAiResults(res as unknown as AISearchResult);
        setSelectedCategory('');
        setPage(1);
      })
      .catch((err: Error) => { setError(err.message || 'AI search failed'); setAiResults(null); })
      .finally(() => setLoading(false));
  }, [aiQuery]);

  // Fetch categories once
  useEffect(() => {
    api.get<{ products: Product[] }>('/api/products', { params: { limit: 100 } })
      .then((res) => {
        const allProducts = (res as unknown as { products: Product[] }).products || [];
        const normalize   = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
        const derived     = Array.from(new Set(allProducts.map((p) => normalize(p.category)).filter(Boolean)));
        setCategories(derived);
        const grouped: Record<string, Product[]> = {};
        derived.forEach((cat) => { grouped[cat] = allProducts.filter((p) => normalize(p.category) === cat); });
        setAllByCategory(grouped);
      })
      .catch(() => {});
  }, []);

  // Fetch filtered products
  const fetchProducts = useCallback(async (): Promise<void> => {
    if (aiQuery) { setProducts([]); return; }
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const params: Record<string, unknown> = { page, limit };
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery)       params.search   = searchQuery;
      const res = await api.get('/api/products', { params, signal: controller.signal });
      setProducts((res as unknown as { products: Product[] }).products ?? []);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || 'Failed to load products');
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [page, limit, selectedCategory, searchQuery, aiQuery]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAIResults = (res: AISearchResult): void => {
    setAiResults(res);
    setSelectedCategory('');
    setPage(1);
  };

  const isSearching        = searchQuery.length > 0;
  const isCategoryFiltered = selectedCategory.length > 0;
  const isAIMode           = !!aiResults;

  return (
    <div>
      <Header />

      {/* Banner Swiper */}
      <div className="max-w-full mx-auto p-0">
        <Swiper modules={[Navigation, Pagination, Autoplay]} spaceBetween={20} slidesPerView={3}
          navigation pagination={{ clickable: true }} autoplay={{ delay: 3000 }} loop
          breakpoints={{ 640: { slidesPerView: 1 }, 768: { slidesPerView: 1 }, 1024: { slidesPerView: 1 } }}>
          <SwiperSlide><img src={crockeryBrands}  alt="Crockery Brands"  loading="eager" fetchPriority="high" className="w-full h-auto" /></SwiperSlide>
          <SwiperSlide><img src={detergentBrands} alt="Detergent Brands" loading="lazy"  className="w-full h-auto" /></SwiperSlide>
          <SwiperSlide><img src={diaperBrands}    alt="Diaper Brands"    loading="lazy"  className="w-full h-auto" /></SwiperSlide>
          <SwiperSlide><img src={halfpriceStore}  alt="Half Price Store" loading="lazy"  className="w-full h-auto" /></SwiperSlide>
          <SwiperSlide><img src={riceBrands}      alt="Rice Brands"      loading="lazy"  className="w-full h-auto" /></SwiperSlide>
        </Swiper>
      </div>

      {/* AI Search bar */}
      <div className="max-w-2xl mx-auto px-4 mt-6 mb-2">
        <SmartSearchBar onResults={handleAIResults} className="w-full" />
        <p className="text-xs text-gray-400 text-center mt-2">
          💡 Try: "healthy snacks under ₹200" · "warm clothing" · "cheap beverages"
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">

        {/* AI Mode */}
        {isAIMode && (
          <div className="mb-8">
            <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-900">{aiResults.intent}</p>
                  <p className="text-xs text-purple-600 mt-0.5">
                    {aiResults.total} product{aiResults.total !== 1 ? 's' : ''} found
                    {aiResults.filters?.category && ` in ${aiResults.filters.category}`}
                    {aiResults.filters?.maxPrice  && ` under ₹${aiResults.filters.maxPrice}`}
                    {aiResults.filters?.minPrice  && ` above ₹${aiResults.filters.minPrice}`}
                  </p>
                </div>
              </div>
              <button aria-label="Clear AI search" onClick={() => setAiResults(null)}
                className="flex items-center gap-1 text-xs text-purple-600 hover:underline flex-shrink-0">
                <X size={12} /> Clear
              </button>
            </div>
            {aiResults.products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Sparkles size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No products matched your search.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {aiResults.products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        )}

        {/* Normal mode */}
        {!isAIMode && (
          <div className="row-wrap">
            {/* Sidebar */}
            <div className="grid-20">
              <div className="flex flex-col gap-2 mr-4 sticky top-24">
                <button aria-label="All categories" onClick={() => { setSelectedCategory(''); setPage(1); }}
                  className={`px-3 py-1 rounded text-left ${selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                  All
                </button>
                {categories.map((cat) => (
                  <button aria-label={`Category: ${cat}`} key={cat}
                    onClick={() => { setSelectedCategory(cat); setPage(1); }}
                    className={`px-3 py-1 rounded text-left ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Main */}
            <div className="grid-80">
              {loading && <div className="py-8 text-center text-gray-500">Loading products...</div>}
              {error   && <div className="text-red-500 py-4">{error}</div>}

              {/* Keyword search */}
              {isSearching && !loading && (
                <>
                  <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Results for <span className="font-semibold text-blue-700">"{searchQuery}"</span>
                      {' '}— {products.length} product{products.length !== 1 ? 's' : ''} found
                    </p>
                    <button aria-label="Clear search" onClick={() => { navigate('/store'); setPage(1); }}
                      className="text-xs text-blue-600 hover:underline">Clear ✕</button>
                  </div>
                  {products.length > 0
                    ? <div className="flex flex-wrap gap-4 mb-10">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
                    : <div className="py-8 text-center text-gray-500 mb-10">No products found for "{searchQuery}"</div>
                  }
                  <div className="border-t pt-8 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Browse Other Categories</h2>
                  </div>
                  {categories.map((cat) => {
                    const catProducts = allByCategory[cat] || [];
                    if (!catProducts.length) return null;
                    return (
                      <div key={cat} className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">{cat}</h3>
                          <button aria-label={`View all in ${cat}`}
                            onClick={() => { setSelectedCategory(cat); navigate('/store'); }}
                            className="text-xs text-blue-600 hover:underline">View all →</button>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {catProducts.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Category filtered */}
              {isCategoryFiltered && !isSearching && !loading && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{selectedCategory}</h2>
                    <span className="text-sm text-gray-500">{products.length} products</span>
                  </div>
                  {products.length > 0
                    ? <div className="flex flex-wrap gap-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
                    : <div className="py-8 text-center text-gray-500">No products in this category</div>
                  }
                </>
              )}

              {/* All grouped */}
              {!isCategoryFiltered && !isSearching && !loading && (
                <>
                  {categories.map((cat) => {
                    const catProducts = allByCategory[cat] || [];
                    if (!catProducts.length) return null;
                    return (
                      <div key={cat} className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">{cat}</h3>
                          <button aria-label={`View all in ${cat}`}
                            onClick={() => { setSelectedCategory(cat); setPage(1); }}
                            className="text-xs text-blue-600 hover:underline">View all →</button>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {catProducts.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
