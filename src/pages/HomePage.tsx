import { ArrowRight, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';
import { selectIsLoggedIn } from '../store/authSlice';

// ── Types ─────────────────────────────────────────────────────────────────

interface Category {
  name:  string;
  image: string;
  count: string;
  link:  string;
}

interface Testimonial {
  name:    string;
  role:    string;
  comment: string;
  rating:  number;
  image:   string;
}

// ── Static data ───────────────────────────────────────────────────────────

const categories: Category[] = [
  { name: 'Electronics',    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',  count: '2,345 products', link: '/store' },
  { name: 'Fashion',        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300&h=300&fit=crop',  count: '5,678 products', link: '/store' },
  { name: 'Home & Living',  image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop',     count: '3,456 products', link: '/store' },
  { name: 'Sports & Outdoor', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop', count: '2,123 products', link: '/store' },
];

const testimonials: Testimonial[] = [
  { name: 'Sarah Johnson', role: 'Verified Buyer', comment: 'Amazing quality and fast delivery. Highly recommended!',            rating: 5, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { name: 'Michael Chen',  role: 'Verified Buyer', comment: 'Great customer service and excellent products. Will buy again!',   rating: 5, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { name: 'Emma Davis',    role: 'Verified Buyer', comment: 'Best shopping experience ever. Prices are competitive too!',       rating: 5, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate   = useNavigate();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const handleCategoryClick = (category: Category): void => {
    if (isLoggedIn) {
      navigate(`/store?category=${encodeURIComponent(category.name)}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-t from-blue-600 to-purple-600 text-white py-10 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold text-blue-600">✨ New Collection Available</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Discover Amazing Products
              </h1>
              <p className="text-lg text-blue-100 max-w-lg">
                Shop from our exclusive collection of high-quality products at unbeatable prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button aria-label="Shop now" onClick={() => navigate('/store')}
                  className="flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold">
                  Shop Now <ArrowRight size={20} />
                </button>
                <button aria-label="Learn more" onClick={() => navigate('/about')}
                  className="border border-white text-white hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-lg font-semibold">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"
                alt="Hero" loading="lazy" className="rounded-lg shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {([
              { icon: <Truck size={32} className="text-blue-600" />,   bg: 'bg-blue-100',   title: 'Fast Shipping',   desc: 'Free delivery on orders over ₹500'       },
              { icon: <Shield size={32} className="text-green-600" />, bg: 'bg-green-100',  title: 'Secure Payment',  desc: '100% secure transactions guaranteed'     },
              { icon: <RotateCcw size={32} className="text-purple-600" />, bg: 'bg-purple-100', title: 'Easy Returns', desc: '30-day hassle-free return policy'         },
              { icon: <Star size={32} className="text-yellow-600" />,  bg: 'bg-yellow-100', title: 'Best Quality',    desc: 'Handpicked products from trusted brands'  },
            ] as const).map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${f.bg} rounded-full mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.name} onClick={() => handleCategoryClick(cat)}
                className="cursor-pointer group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img src={cat.image} alt={cat.name} loading="lazy"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Join thousands of satisfied customers who trust Maheswari Store</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{t.comment}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.image} alt={t.name} loading="lazy" className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-600">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Shopping?</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Explore thousands of products and find exactly what you're looking for
          </p>
          <button aria-label="Shop now" onClick={() => navigate('/store')}
            className="flex items-center gap-2 mx-auto bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold">
            Shop Now <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
