import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import toast from 'react-hot-toast';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { authAPI, referralAPI } from '../../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: '', email: '', password: '', referralCode: searchParams.get('ref') || '',
  });
  const [referrerInfo, setReferrerInfo] = useState(null);

  useEffect(() => {
    if (form.referralCode && form.referralCode.length >= 6) {
      referralAPI.validate(form.referralCode)
        .then((res) => setReferrerInfo(res.data))
        .catch(() => setReferrerInfo(null));
    } else {
      setReferrerInfo(null);
    }
  }, [form.referralCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to Vouchly 🎉');
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface-50)', padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' }}>Create your account</h1>
          <p style={{ color: 'var(--ink-500)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Sign up free and get <strong style={{ color: 'var(--ink-900)' }}>100 points</strong> instantly.
          </p>

          {error && <Message severity="error" text={error} className="w-full mb-3" />}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Full name</label>
              <InputText
                value={form.name} required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe" className="w-full" style={{ padding: '0.7rem 0.9rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Email</label>
              <InputText
                type="email" value={form.email} required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" className="w-full" style={{ padding: '0.7rem 0.9rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Password</label>
              <Password
                value={form.password} required toggleMask
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters" className="w-full" inputClassName="w-full"
                inputStyle={{ padding: '0.7rem 0.9rem', width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Referral code <span style={{ fontWeight: 400, color: 'var(--ink-300)' }}>(optional)</span>
              </label>
              <InputText
                value={form.referralCode}
                onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
                placeholder="e.g. AB12CD34" className="w-full" style={{ padding: '0.7rem 0.9rem' }}
              />
              {referrerInfo?.valid && (
                <Tag severity="success" style={{ marginTop: '0.5rem' }}
                  value={`✓ Referred by ${referrerInfo.referrerName} — bonus applies on signup`} />
              )}
            </div>

            <Button type="submit" label="Create account" loading={loading}
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
            Already have an account? <Link to="/login" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
