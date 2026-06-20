import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');

  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate(result.payload.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface-50)', padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="pi pi-ticket" style={{ color: '#fff', fontSize: '1.1rem' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>Vouchly</span>
        </div>

        <div className="vx-card" style={{ padding: '2.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--ink-500)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Log in to access your points and vouchers.
          </p>

          {oauthError && (
            <Message severity="error" text="Google sign-in failed. Please try again or use email." className="w-full mb-3" />
          )}
          {error && <Message severity="error" text={error} className="w-full mb-3" />}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Email</label>
              <InputText
                type="email" value={form.email} required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" className="w-full" style={{ padding: '0.7rem 0.9rem' }}
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Password</label>
              <Password
                value={form.password} required feedback={false} toggleMask
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" className="w-full" inputClassName="w-full"
                inputStyle={{ padding: '0.7rem 0.9rem', width: '100%' }}
              />
            </div>

            <Button type="submit" label="Log in" loading={loading}
              className="w-full" style={{
                marginTop: '1.25rem', background: 'var(--ink-900)', border: 'none',
                borderRadius: 10, padding: '0.8rem', fontWeight: 600,
              }} />
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--surface-border)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-300)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--surface-border)' }} />
          </div>

          <Button label="Continue with Google" icon="pi pi-google" outlined severity="secondary"
            onClick={authAPI.googleLogin}
            className="w-full" style={{ borderRadius: 10, padding: '0.8rem', fontWeight: 600 }} />

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-500)', marginTop: '1.75rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
