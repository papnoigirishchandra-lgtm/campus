import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, authReady } = useContext(AuthContext);

  if (!authReady) return null; // Wait for auth state to load

  // If the user is already logged in, redirect them away from public pages like Login/Register
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;
