import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Search, Menu, X, User,
  Bell, LogOut, ChevronDown
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import {
  selectCartCount,
  fetchCart,
  clearCart
} from '../../store/cartSlice';
import {
  selectCurrentUser,
  selectIsLoggedIn,
  logout
} from '../../store/authSlice';
import SmartSearchBar from '../ui/SmartSearchBar';

// ── Nav link shape ────────────────────────────────────────────────────────

interface NavLink {
  name: string;
  href: string;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const cartCount  = useAppSelector(selectCartCount);
  const user       = useAppSelector(selectCurrentUser);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen,   setIsUserMenuOpen]   = useState<boolean>(false);
  const [searchValue,      setSearchValue]      = useState<string>('');

  const userMenuRef = useRef<HTMLDivElement>(null);

  // ── Effects ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchCart());
  }, [isLoggedIn, dispatch]);

  useEffect(() => {
    setSearchValue(new URLSearchParams(location.search).get('search') || '');
  }, [location.search]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSignOut = (): void => {
    dispatch(logout());
    dispatch(clearCart());
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) {
      navigate(`/store?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/store');
    }
  };

  // ── Nav links ─────────────────────────────────────────────────────────

  const navLinks: NavLink[] = [
    { name: 'Home',       href: '/' },
    ...(isLoggedIn ? [{ name: 'Store', href: '/store' }] : []),
    { name: 'Categories', href: '/categories' },
    { name: 'About',      href: '/about' },
    { name: 'Contact',    href: '/contact' },
    ...(user?.role === 'ADMIN'
      ? [
          { name: 'Add Product', href: '/admin/products/new' },
          { name: 'Orders',      href: '/admin/orders' },
        ]
      : []),
  ];

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start sm:justify-between gap-4 h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-1">
            <div className="w-5 h-5 flex items-center justify-center">
              <img src="/favicon.svg" className="img-fluid" alt="Logo" />
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:inline">M-Mart</span>
          </Link>

          {/* Desktop nav */}
          <div className="flex items-center justify-between w-full gap-4">
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-4">
              <SmartSearchBar className="hidden lg:flex w-64" />

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} className="text-gray-700" />
              </button>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                        {user?.firstName}
                      </span>
                      <ChevronDown size={14} className="text-gray-500" />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          {user?.role === 'ADMIN' && (
                            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              Admin
                            </span>
                          )}
                        </div>

                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/cart"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          My Cart
                          {cartCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {cartCount}
                            </span>
                          )}
                        </Link>

                        <hr className="my-1 border-gray-100" />

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User size={20} className="text-gray-700" />
                  </button>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart size={20} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <SmartSearchBar className="px-4 py-2 w-full" />
            {isLoggedIn && (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
