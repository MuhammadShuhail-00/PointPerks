import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

// This page handles the redirect after Google OAuth
// Backend redirects to: /auth/callback?token=JWT
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      navigate('/login?error=google_failed');
      return;
    }

    // Store token then fetch user info
    localStorage.setItem('token', token);

    authAPI.getMe()
      .then((res) => {
        dispatch(setCredentials({ token, user: res.data.user }));
        // Redirect based on role
        if (res.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login?error=auth_failed');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <Loader message="Signing you in with Google..." />;
};

export default AuthCallback;
