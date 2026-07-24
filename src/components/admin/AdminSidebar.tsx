import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag,
  LogOut, Store, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppDispatch } from '../../hooks/hooks';
import { logout } from '../../store/authSlice';
import { clearCart } from '../../store/cartSlice';

// ── Types ─────────────────────────────────────────────────────────────────

interface NavItem {
  to: string;
  icon: ReactNode;
  label: string;
}

// ── Static data ───────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  { to: '/admin',              icon: <LayoutDashboard size={20} />, label: 'Dashboard'   },
  { to: '/admin/orders',       icon: <ShoppingBag size={20} />,    label: 'Orders'      },
  { to: '/admin/products/new', icon: <Package size={20} />,        label: 'Add Product' },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminSidebar() {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const handleLogout = (): void => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/');
  };

  return (
    <aside
      className={`flex flex-col bg-gray-900 text-white h-screen flex-shrink-0 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
        {!collapsed && (
          <span className="font-bold text-lg text-white">M-Mart Admin</span>
        )}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-4 border-t border-gray-700 pt-4 space-y-1">
        <NavLink
          to="/store"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
        >
          <Store size={20} className="flex-shrink-0" />
          {!collapsed && <span>View Store</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900 hover:text-red-300 transition-colors text-sm font-medium"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
