import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { voucherAPI, authAPI } from '../../services/api';
import { formatDiscount, categoryIcons } from '../../utils/helpers';

const CATEGORY_LABELS = {
  food: 'Food & Dining',
  shopping: 'Shopping',
  travel: 'Travel',
  entertainment: 'Entertainment',
  health: 'Health & Fitness',
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    voucherAPI.getAll({ featured: 'true', limit: 4 })
      .then((res) => setFeatured(res.data.data || []))
      .catch(() => {});
    voucherAPI.getCategories()
      .then((res) => setCategories(res.data.summary || []))
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--surface-50)', minHeight: '100vh' }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1180, margin: '0 auto', padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="pi pi-ticket" style={{ color: '#fff', fontSize: '1.1rem' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>
            Vouchly
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button label="Log in" text onClick={() => navigate('/login')} />
          <Button label="Sign up free" onClick={() => navigate('/register')}
            style={{ background: 'var(--ink-900)', border: 'none', borderRadius: 999 }} />
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem', alignItems: 'center' }}
          className="vx-hero-grid">
          <div>
            <span className="vx-eyebrow">Points-powered rewards</span>
            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.05,
              margin: '0.75rem 0 1.25rem', color: 'var(--ink-900)',
            }}>
              Turn everyday points<br />into real <span className="vx-grad-text">savings</span>.
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink-500)', maxWidth: 480, marginBottom: '2rem' }}>
              Earn points when you sign up or refer a friend, then redeem them for
              vouchers across food, shopping, travel, entertainment, and health —
              each one with a unique code, QR, and downloadable PDF.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Button label="Get started — it's free" icon="pi pi-arrow-right" iconPos="right"
                onClick={() => navigate('/register')}
                style={{
                  background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500))',
                  border: 'none', padding: '0.9rem 1.6rem', borderRadius: 999, fontWeight: 600,
                }} />
              <Button label="Continue with Google" icon="pi pi-google" severity="secondary" outlined
                onClick={authAPI.googleLogin}
                style={{ padding: '0.9rem 1.6rem', borderRadius: 999, fontWeight: 600 }} />
            </div>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>20+</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>active vouchers</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>100 pts</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>welcome bonus</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>5</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>categories</div>
              </div>
            </div>
          </div>

          {/* Floating voucher mock */}
          <div style={{ position: 'relative', height: 420 }}>
            <div style={{
              position: 'absolute', top: 20, right: 10, width: 290,
              background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-500) 60%, var(--accent-amber) 140%)',
              borderRadius: 'var(--radius-lg)', padding: '1.75rem', color: '#fff',
              boxShadow: '0 24px 48px -12px rgba(109,40,217,0.4)', transform: 'rotate(4deg)',
            }}>
              <i className="pi pi-shopping-bag" style={{ fontSize: '1.6rem', opacity: 0.85 }} />
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.75rem' }}>25% OFF</div>
              <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>Lazada Flash Sale</div>
              <div style={{
                marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.4)',
                fontSize: '0.75rem', opacity: 0.85, fontFamily: 'monospace', letterSpacing: '0.05em',
              }}>VR-7F2A-9C1D-EE03</div>
            </div>
            <div style={{
              position: 'absolute', bottom: 10, left: 0, width: 260,
              background: 'var(--surface-0)', borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              boxShadow: 'var(--shadow-card-hover)', transform: 'rotate(-6deg)',
              border: '1px solid var(--surface-border)',
            }}>
              <i className="pi pi-star-fill" style={{ color: 'var(--accent-amber)', fontSize: '1.3rem' }} />
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink-900)', marginTop: '0.5rem' }}>
                480 pts
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>Your balance</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────────────── */}
      <section style={{ background: 'var(--surface-0)', borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '3.5rem 1.5rem' }}>
          <span className="vx-eyebrow">Browse by category</span>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0.5rem 0 2rem' }}>
            Something for every part of your week
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}
            className="vx-cat-grid">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const cat = categories.find((c) => c._id === key);
              return (
                <div key={key} className="vx-card vx-card-hover" style={{
                  padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer',
                }} onClick={() => navigate('/register')}>
                  <i className={categoryIcons[key]} style={{ fontSize: '1.6rem', color: 'var(--brand-600)' }} />
                  <div style={{ fontWeight: 600, marginTop: '0.75rem', fontSize: '0.9rem' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '0.2rem' }}>
                    {cat ? `${cat.count} vouchers` : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Vouchers ───────────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '4rem 1.5rem' }}>
          <span className="vx-eyebrow">Popular right now</span>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0.5rem 0 2rem' }}>
            Featured vouchers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}
            className="vx-feat-grid">
            {featured.map((v) => (
              <div key={v._id} className="vx-card vx-card-hover" style={{ overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => navigate('/register')}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))',
                  padding: '1.5rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                    {formatDiscount(v.discountType, v.discountValue)}
                  </div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{v.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink-500)', marginTop: '0.2rem' }}>{v.merchant}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── How it works ────────────────────────────────────────────── */}
      <section style={{ background: 'var(--ink-900)', color: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '4rem 1.5rem' }}>
          <span style={{ color: 'var(--brand-400)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            How it works
          </span>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0.5rem 0 2.5rem', color: '#fff' }}>
            From sign-up to savings in three steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}
            className="vx-steps-grid">
            {[
              { icon: 'pi-user-plus', title: 'Create your account', body: 'Sign up with email or Google and get 100 points instantly, free.' },
              { icon: 'pi-search', title: 'Find a voucher', body: 'Browse 20+ vouchers across food, shopping, travel, entertainment and health.' },
              { icon: 'pi-qrcode', title: 'Redeem & save', body: 'Get a unique code, QR, and PDF voucher ready to use in seconds.' },
            ].map((step, i) => (
              <div key={i}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: 'rgba(124,92,252,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
                }}>
                  <i className={`pi ${step.icon}`} style={{ color: 'var(--brand-400)', fontSize: '1.3rem' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
          Ready to start saving?
        </h2>
        <p style={{ color: 'var(--ink-500)', marginBottom: '2rem' }}>
          Join free — your first 100 points are waiting.
        </p>
        <Button label="Create your account" icon="pi pi-arrow-right" iconPos="right"
          onClick={() => navigate('/register')}
          style={{
            background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500))',
            border: 'none', padding: '1rem 2rem', borderRadius: 999, fontWeight: 600, fontSize: '1rem',
          }} />
      </section>

      <footer style={{ borderTop: '1px solid var(--surface-border)', padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--ink-500)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} Vouchly. Built for the Capstone Project.
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .vx-hero-grid { grid-template-columns: 1fr !important; }
          .vx-cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .vx-feat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .vx-steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
