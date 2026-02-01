import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

const ENFORCE_EMAIL_VERIFICATION = import.meta.env.VITE_ENFORCE_EMAIL_VERIFICATION === 'true';

export const PublicRoute = ({ allowAuthenticated = false, children }) => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <LoadingState />;
  }

  if (isAuthenticated && !allowAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing, isVerified } = useAuth();

  if (initializing) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: 'Please sign in to continue.' }}
      />
    );
  }

  if (ENFORCE_EMAIL_VERIFICATION && !isVerified) {
    return (
      <Navigate
        to="/verify-email"
        replace
        state={{ message: 'Verify your email to access the dashboard.' }}
      />
    );
  }

  return children;
};
