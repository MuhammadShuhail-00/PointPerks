import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../store/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  const logout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isUser,
    loading,
    error,
    logout,
  };
};

export default useAuth;
