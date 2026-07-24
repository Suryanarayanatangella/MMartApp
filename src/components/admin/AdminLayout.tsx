import { Navigate, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAppSelector } from '../../hooks/hooks';
import { selectCurrentUser, selectIsLoggedIn } from '../../store/authSlice';

export default function AdminLayout() {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user       = useAppSelector(selectCurrentUser);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/store" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.firstName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
