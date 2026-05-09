import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user, authReady } = useContext(AuthContext);

  if (!authReady) return null; // or a loading spinner

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;