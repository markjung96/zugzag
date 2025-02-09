import { Navigate, useLocation } from 'react-router-dom';

import useAuthStore from '@/features/login/model/store';

const ProtectedRouter: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRouter;
