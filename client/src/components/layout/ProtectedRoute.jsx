import { Navigate, Outlet, useLocation } from 'react-router-dom';

import Spinner from '../ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute() {
  const { initializing, isAuthenticated } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="page-loader">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
