import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { voucherAPI, authAPI } from '../../services/api';
import { formatDiscount } from '../../utils/helpers';

const C = {
  primary: '#022448',
  primaryContainer: '#1e3a5f',
  ctaGold: '#D4A017',
  secondary: '#795900',
  secondaryContainer: '#ffc641',
  secondaryFixed: '#ffdfa0',
  secondaryFixedDim: '#f6be39',
  tertiary: '#002252',
  surface: '#f9f9f8',
  surfaceLow: '#f4f4f3',
  surfaceContainer: '#eeeeed',
  surfaceHigh: '#e8e8e7',
  surfaceHighest: '#e2e2e2',
  surfaceLowest: '#ffffff',
  onSurface: '#1a1c1c',
  onSurfaceVariant: '#43474e',
  outline: '#74777f',
  outlineVariant: '#c4c6cf',
  onPrimary: '#ffffff',
};

const CATEGORY_LABELS = {
  food: 'Food & Dining',
  shopping: 'Shopping',
  travel: 'Travel',
  entertainment: 'Entertainment',
  health: 'Health & Fitness',
};

const CATEGORY_DESCRIPTIONS = {
  food: 'From local hidden gems to world-class fine dining experiences.',
  shopping: 'Redeem points for the latest fashion, tech, and lifestyle brands.',
  travel: 'Flights, hotels, and unique stays around the globe at your fingertips.',
  entertainment: 'Movies, concerts, streaming, and unforgettable live experiences.',
  health: 'Gym memberships, wellness apps, and fitness rewards for your journey.',
};

const CATEGORY_IMAGES = {
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  shopping: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
  travel: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
  entertainment: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80',
  health: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
};

const VOUCHER_GRADIENT = `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`;

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ display: 'inline-block', flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    voucherAPI
      .getAll({ featured: 'true', limit: 8 })
      .then((res) => setFeatured(res.data.data || []))
      .catch(() => {});
    voucherAPI
      .getCategories()
      .then((res) => setCategories(res.data.summary || []))
      .catch(() => {});
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('pp-visible');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.pp-reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [featured, categories]);

  const handleCardMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.03)`;
    card.style.zIndex = '10';
  }, []);

  const handleCardMouseLeave = useCallback((e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    card.style.zIndex = '';
  }, []);

  const handleVoucherMouseMove = useCallback((restRotation) => (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.04)`;
    card.style.zIndex = '10';
  }, []);

  const handleVoucherMouseLeave = useCallback((restRotation) => (e) => {
    const card = e.currentTarget;
    card.style.transform = `rotate(${restRotation}deg)`;
    card.style.zIndex = '';
  }, []);

  const requireLogin = (path) => {
    setMobileMenuOpen(false);
    const token = localStorage.getItem('token');
    if (token) {
      navigate(path);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
    }
  };

  const ms = (size = 24, fill = 0) => ({
    fontFamily: "'Material Symbols Outlined'",
    fontSize: size,
    fontVariationSettings: `"FILL" ${fill}, "wght" 400, "GRAD" 0, "opsz" 24`,
    lineHeight: 1,
    display: 'inline-block',
  });

  return (
    <div style={{
      background: C.surface,
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      color: C.onSurface,
      overflowX: 'hidden',
    }}>

      {/* ═══════════ FIXED FLOATING NAVIGATION ═══════════ */}
      <nav className="pp-nav" style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: 1100,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 8px 32px rgba(2, 36, 72, 0.08)',
        zIndex: 50,
      }}>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, color: C.primary }}>
          PointPerks
        </span>

        {/* Desktop nav links */}
        <div className="pp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: 10 }}>
          <button
            onClick={() => requireLogin('/vouchers')}
            style={{ all: 'unset', background: 'transparent', padding: '8px 16px', borderRadius: 8, color: C.primary, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(2, 36, 72, 0.08)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            Marketplace
          </button>
          <button
            onClick={() => requireLogin('/my-redemptions')}
            style={{ all: 'unset', background: 'transparent', padding: '8px 16px', borderRadius: 8, color: C.onSurfaceVariant, fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(2, 36, 72, 0.08)'; e.target.style.color = C.primary; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = C.onSurfaceVariant; }}
          >
            My Vouchers
          </button>
        </div>

        {/* Desktop auth buttons */}
        <div className="pp-nav-auth" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate('/login')}
            className="pp-nav-btn pp-nav-btn-outline"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="pp-nav-btn pp-nav-btn-solid"
          >
            Sign up
          </button>
        </div>

        
      </nav>


      {/* ═══════════ HERO ═══════════ */}
      <section className="pp-reveal" style={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '120px 24px 64px',
      }}>
        <div className="pp-hero-grid" style={{
          maxWidth: 1280,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}>
          <div style={{ zIndex: 10 }}>
            <div className="pp-badge">
              <span style={ms(16, 1)}>stars</span>
              Join 50k+ savvy savers
            </div>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(28px, 5vw, 48px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: C.primary,
              margin: '24px 0 20px',
              maxWidth: 580,
            }}>
              Turn everyday points into <span style={{ color: C.ctaGold }}>real savings.</span>
            </h1>
            <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', lineHeight: 1.6, color: C.onSurfaceVariant, maxWidth: 480, marginBottom: 28 }}>
              PointPerks helps you unlock the hidden value in your loyalty points. Earn points when you sign up or refer a friend, then redeem them for vouchers across food, shopping, travel, entertainment, and health — each with a unique code, QR, and downloadable PDF.
            </p>
            <div className="pp-hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="pp-btn-hero" onClick={() => navigate('/register')}>
                Get Started
                <span style={ms(20)}>arrow_forward</span>
              </button>
              <button className="pp-btn-outline" onClick={authAPI.googleLogin}>
                <GoogleIcon />
                Continue with Google
              </button>
            </div>
            <div className="pp-hero-stats" style={{ display: 'flex', gap: 32, marginTop: 40 }}>
              {[
                { val: '20+', label: 'active vouchers' },
                { val: '100 pts', label: 'welcome bonus' },
                { val: '5', label: 'categories' },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: C.primary }}>{s.val}</div>
                  <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: C.onSurfaceVariant }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating voucher mock */}
          <div className="pp-hero-visual" style={{ position: 'relative', height: 400 }}>
            <div
              className="pp-voucher-main pp-tilt-card"
              style={{
                position: 'absolute',
                top: 0,
                right: -24,
                width: 'min(320px, 80%)',
                background: `linear-gradient(135deg, ${C.secondary} 0%, ${C.tertiary} 100%)`,
                color: '#fff',
                padding: 24,
                borderRadius: 16,
                boxShadow: '0 20px 60px -12px rgba(0,0,0,0.3)',
                transform: 'rotate(-6deg)',
              }}
              onMouseMove={handleVoucherMouseMove(-6)}
              onMouseLeave={handleVoucherMouseLeave(-6)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ ...ms(40), color: C.secondaryFixed }}>shopping_basket</span>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Flash Sale</p>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 24, fontWeight: 700, color: C.secondaryFixed, margin: 0 }}>25% OFF</p>
                </div>
              </div>
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.3)', paddingTop: 16 }}>
                <p style={{ fontWeight: 700, marginBottom: 4, fontSize: 16 }}>Lazada Flash Sale</p>
                <p style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontFamily: 'monospace' }}>VR-7F2A-9C1D-EE03</p>
              </div>
            </div>

            <div
              className="pp-voucher-points pp-tilt-card"
              style={{
                position: 'absolute',
                bottom: 0,
                left: -20,
                width: 'min(256px, 65%)',
                background: VOUCHER_GRADIENT,
                color: C.onPrimary,
                padding: 24,
                borderRadius: 16,
                boxShadow: '0 20px 60px -12px rgba(0,0,0,0.3)',
                transform: 'rotate(3deg)',
              }}
              onMouseMove={handleVoucherMouseMove(3)}
              onMouseLeave={handleVoucherMouseLeave(3)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ ...ms(40), color: C.secondaryFixed }}>stars</span>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Points Value</p>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 24, fontWeight: 700, color: C.secondaryFixed, margin: 0 }}>2,500</p>
                </div>
              </div>
              <div style={{ borderTop: `1px dashed ${C.primaryContainer}`, paddingTop: 16 }}>
                <p style={{ fontWeight: 700, marginBottom: 4, fontSize: 16 }}>Your Balance</p>
                <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>Redeemable at 500+ locations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="pp-reveal" style={{
        background: C.surfaceLow,
        padding: '64px 24px',
        borderTop: `1px solid ${C.outlineVariant}`,
        borderBottom: `1px solid ${C.outlineVariant}`,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 'clamp(24px, 4vw, 32px)', color: C.primary, marginBottom: 12 }}>Redeem in any category</h2>
            <p style={{ color: C.onSurfaceVariant, fontSize: 16 }}>Universal points, endless possibilities.</p>
          </div>
          <div className="pp-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const cat = categories.find((c) => c._id === key);
              return (
                <div
                  key={key}
                  className="pp-cat-card pp-tilt-card"
                  onClick={() => navigate('/register')}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                >
                  <div style={{ position: 'relative', height: 160, marginBottom: 20, overflow: 'hidden', borderRadius: 12 }}>
                    <div
                      className="pp-cat-img"
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${CATEGORY_IMAGES[key]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.5s',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.primary,
                    }}>
                      {label}
                    </div>
                  </div>
                  <div style={{ padding: '0 12px 16px' }}>
                    <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 18, color: C.primary, marginBottom: 6 }}>{label}</h3>
                    <p style={{ color: C.onSurfaceVariant, fontSize: 14, marginBottom: 16, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{CATEGORY_DESCRIPTIONS[key]}</p>
                    <div className="pp-cat-btn">
                      <span>{cat ? `${cat.count} vouchers available` : 'Browse'}</span>
                      <span style={ms(20)}>arrow_forward</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED VOUCHERS ═══════════ */}
      {featured.length > 0 && (
        <section className="pp-reveal" style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 'clamp(24px, 4vw, 32px)', color: C.primary, marginBottom: 12 }}>Popular right now</h2>
            <p style={{ color: C.onSurfaceVariant, fontSize: 16 }}>Featured vouchers ready for instant redemption.</p>
          </div>

          <div className="pp-feat-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {featured.map((v) => (
              <div
                key={v._id}
                className="pp-feat-card pp-tilt-card"
                onClick={() => requireLogin('/vouchers')}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div style={{
                  padding: '24px 20px 18px',
                  background: `linear-gradient(160deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
                  borderBottom: `1px solid rgba(255,255,255,0.1)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: '-50%', right: '-30%', width: 140, height: 140, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    padding: '6px 18px',
                    borderRadius: 999,
                    marginBottom: 14,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 800, color: C.secondaryFixed }}>
                      {formatDiscount(v.discountType, v.discountValue)}
                    </span>
                  </div>

                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}>
                    {v.image ? (
                      <img src={v.image} alt="merchant" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span style={{ ...ms(22, 1), color: '#fff' }}>storefront</span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: C.onSurface, margin: '0 0 4px', lineHeight: 1.3, minHeight: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: '2', textOverflow: 'ellipsis' }}>
                    {v.title}
                  </h3>
                  <p style={{ fontSize: 12, color: C.outline, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {v.merchant}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ ...ms(18, 1), color: C.ctaGold }}>stars</span>
                      <span style={{ fontWeight: 700, color: C.primary, fontSize: 14, fontFamily: "'Poppins', sans-serif" }}>
                        {v.pointsCost ?? 100} pts
                      </span>
                    </div>
                    <button
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.primary,
                        background: C.surfaceHigh,
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = C.surfaceContainer; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = C.surfaceHigh; }}
                    >
                      Claim
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ VALUE PROPOSITION ═══════════ */}
      <section className="pp-reveal" style={{ padding: '64px 24px', position: 'relative' }}>
        <div className="pp-value-grid" style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}>
          <div className="pp-value-visual" style={{ position: 'relative' }}>
            <div className="pp-progress-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 18, color: C.primary, margin: 0 }}>Redemption Goal</h4>
                  <p style={{ fontSize: 12, color: C.onSurfaceVariant, margin: '4px 0 0' }}>Emirates Business Class Upgrade</p>
                </div>
                <span style={{ fontWeight: 700, color: C.ctaGold, fontFamily: "'Poppins', sans-serif", fontSize: 22 }}>85%</span>
              </div>
              <div style={{ height: 14, background: C.surfaceHigh, borderRadius: 999, overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ height: '100%', width: '85%', background: `linear-gradient(to right, ${C.primary}, ${C.ctaGold})`, borderRadius: 999, transition: 'width 1s ease-out' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Points Balance', value: '12,450 pts' },
                  { label: 'Cash Value', value: 'RM1245.00' },
                ].map((item) => (
                  <div key={item.label} className="pp-progress-stat">
                    <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: '0 0 4px' }}>{item.label}</p>
                    <p style={{ fontWeight: 700, color: C.primary, margin: 0, fontFamily: "'Poppins', sans-serif", fontSize: 15 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              position: 'absolute',
              zIndex: -1,
              top: -48,
              left: -48,
              width: 192,
              height: 192,
              background: `${C.secondaryFixed}40`,
              borderRadius: '50%',
              filter: 'blur(64px)',
            }} />
          </div>

          <div className="pp-value-text">
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 'clamp(24px, 4vw, 32px)', color: C.primary, marginBottom: 20 }}>Precision rewards for smart users.</h2>
            <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', lineHeight: 1.6, color: C.onSurfaceVariant, marginBottom: 24 }}>
              Our platform is designed with financial precision. We track market fluctuations to ensure you always get the maximum value for your points. No more opaque conversion rates or expiration anxiety.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Real-time market valuation', 'Zero-fee redemption engine', 'Multi-point wallet consolidation'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ ...ms(22, 1), color: C.ctaGold }}>check_circle</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="pp-reveal" style={{ background: VOUCHER_GRADIENT, color: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: C.secondaryFixed, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>How it works</span>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 'clamp(22px, 4vw, 32px)', color: '#fff', margin: '16px 0 0' }}>From sign-up to savings in three steps</h2>
          </div>
          <div className="pp-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {[
              { icon: 'person_add', title: 'Create your account', body: 'Sign up with email or Google and get 100 points instantly, free.' },
              { icon: 'search', title: 'Find a voucher', body: 'Browse 20+ vouchers across food, shopping, travel, entertainment and health.' },
              { icon: 'qr_code_2', title: 'Redeem & save', body: 'Get a unique code, QR, and PDF voucher ready to use in seconds.' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(212,160,23,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <span style={{ ...ms(26), color: C.ctaGold }}>{step.icon}</span>
                </div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 17, color: '#fff', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="pp-reveal" style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="pp-cta-card" style={{
            position: 'relative',
            borderRadius: 24,
            padding: '48px 24px',
            overflow: 'hidden',
            textAlign: 'center',
            background: VOUCHER_GRADIENT,
            color: C.onPrimary,
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.1,
              background: 'radial-gradient(circle at center, #fff, transparent)',
            }} />
            <div style={{ position: 'relative', zIndex: 10, maxWidth: 560, margin: '0 auto' }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 'clamp(24px, 4vw, 40px)', marginBottom: 16, lineHeight: 1.2 }}>
                Ready to unlock your points?
              </h2>
              <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', opacity: 0.9, marginBottom: 28, lineHeight: 1.6 }}>
                Join PointPerks today and start converting your loyalty into lifestyle. Your first 100 points are waiting.
              </p>
              <div className="pp-cta-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="pp-btn-gold" onClick={() => navigate('/register')}>
                  Get Started Free
                  <span style={ms(20)}>arrow_forward</span>
                </button>
                <button className="pp-btn-ghost" onClick={() => navigate('/login')}>Log in</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ borderTop: `1px solid ${C.outlineVariant}`, padding: '24px', background: C.surfaceHighest }}>
        <p style={{ fontSize: 12, color: C.onSurfaceVariant, margin: 0, textAlign: 'center' }}>
          © {new Date().getFullYear()} PointPerks. All rights reserved.
        </p>
      </footer>

      {/* ═══════════ STYLES ═══════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .pp-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .pp-reveal.pp-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ══════ NAV STYLES ══════ */
        .pp-nav-btn {
          height: 40px;
          padding: 0 20px;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .pp-nav-btn-outline {
          background: transparent;
          color: ${C.primary};
          border: 1.5px solid ${C.outlineVariant};
        }
        .pp-nav-btn-outline:hover {
          background: ${C.surfaceHigh};
          border-color: ${C.primary};
        }
        .pp-nav-btn-solid {
          background: ${C.primary};
          color: ${C.onPrimary};
          box-shadow: 0 2px 8px rgba(2, 36, 72, 0.15);
        }
        .pp-nav-btn-solid:hover {
          background: ${C.primaryContainer};
          box-shadow: 0 4px 12px rgba(2, 36, 72, 0.25);
          transform: translateY(-1px);
        }

        /* ══════ FEATURED VOUCHER STYLES ══════ */
        .pp-feat-card {
          background: ${C.surfaceLowest};
          border-radius: 20px;
          border: 1px solid ${C.outlineVariant};
          box-shadow: 0px 4px 24px rgba(30,58,95,0.05);
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .pp-feat-card:hover {
          box-shadow: 0 20px 40px rgba(30,58,95,0.12),
                      0 0 0px 1px rgba(212,160,23,0.2);
        }

        /* ══════ MOBILE MENU ITEM ══════ */
        .pp-mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 16px 20px;
          background: transparent;
          border: none;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: ${C.onSurface};
          cursor: pointer;
          transition: background 0.15s;
          text-align: left;
        }
        .pp-mobile-menu-item:hover {
          background: ${C.surfaceContainer};
        }

        /* ══════ BADGE ══════ */
        .pp-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          background: ${C.secondaryContainer};
          color: #715300;
          border-radius: 999px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 12px;
        }

        /* ══════ HERO BUTTONS ══════ */
        .pp-btn-hero {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: ${C.primary};
          color: ${C.onPrimary};
          border: none;
          border-radius: 12px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(2,36,72,0.2);
          transition: all 0.2s;
          white-space: nowrap;
        }
        .pp-btn-hero:hover { box-shadow: 0 8px 24px rgba(2,36,72,0.3); }

        .pp-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border: 2px solid ${C.primary};
          color: ${C.primary};
          background: transparent;
          border-radius: 12px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .pp-btn-outline:hover { background: ${C.surfaceContainer}; }

        /* ══════ TILT CARDS ══════ */
        .pp-tilt-card {
          transform-style: preserve-3d;
          will-change: transform;
          transition: transform 0.3s cubic-bezier(0.03, 0.98, 0.52, 0.99),
                      box-shadow 0.3s ease;
        }

        .pp-voucher-main { cursor: pointer; }
        .pp-voucher-main:hover {
          box-shadow: 0 30px 80px -16px rgba(0,0,0,0.4),
                      0 0 0px 1px rgba(212,160,23,0.15);
        }
        .pp-voucher-points { cursor: pointer; }
        .pp-voucher-points:hover {
          box-shadow: 0 30px 80px -16px rgba(0,0,0,0.4),
                      0 0 0px 1px rgba(212,160,23,0.15);
        }

        /* ══════ CATEGORY CARDS ══════ */
        .pp-cat-card {
          background: ${C.surfaceLowest};
          padding: 8px;
          border-radius: 16px;
          border: 1px solid ${C.outlineVariant};
          box-shadow: 0px 4px 20px rgba(30,58,95,0.04);
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .pp-cat-card:hover {
          box-shadow: 0px 20px 40px rgba(30,58,95,0.12),
                      0px 0px 0px 1px rgba(212,160,23,0.19);
        }
        .pp-cat-card:hover .pp-cat-img { transform: scale(1.1); }
        .pp-cat-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${C.primary};
          font-weight: 700;
          font-size: 14px;
          transition: gap 0.3s;
        }
        .pp-cat-card:hover .pp-cat-btn { gap: 16px; }

        /* ══════ PROGRESS CARD ══════ */
        .pp-progress-card {
          background: ${C.surfaceLowest};
          padding: 24px;
          border-radius: 16px;
          border: 1px solid ${C.outlineVariant};
          box-shadow: 0px 12px 32px rgba(30,58,95,0.08);
        }
        .pp-progress-stat {
          padding: 14px;
          background: rgba(30, 58, 95, 0.06);
          border-radius: 8px;
          border: 1px solid rgba(2, 36, 72, 0.06);
        }

        /* ══════ CTA BUTTONS ══════ */
        .pp-btn-gold {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: ${C.ctaGold};
          color: #261a00;
          padding: 16px 32px;
          border-radius: 999px;
          border: none;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(212,160,23,0.3);
          transition: all 0.2s;
          white-space: nowrap;
        }
        .pp-btn-gold:hover { background: ${C.secondaryFixedDim}; }

        .pp-btn-ghost {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 16px 32px;
          border-radius: 999px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .pp-btn-ghost:hover { background: rgba(255,255,255,0.2); }

        .pp-footer-link {
          font-size: 12px;
          color: ${C.onSurfaceVariant};
          cursor: pointer;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .pp-footer-link:hover { color: ${C.primary}; }

        /* ══════════════════════════════════════════
           RESPONSIVE BREAKPOINTS
           ══════════════════════════════════════════ */

        /* Tablet: 768px - 1024px */
        @media (max-width: 1024px) {
          .pp-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .pp-hero-visual {
            height: 320px !important;
          }
          .pp-value-grid {
            grid-template-columns: 1fr !important;
          }
          .pp-value-visual { order: 2; }
          .pp-value-text { order: 1; }
          .pp-cat-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Mobile: below 768px */
        @media (max-width: 768px) {
          /* --- NAV --- */
          .pp-nav {
            top: 12px !important;
            width: calc(100% - 32px) !important;
            height: 56px !important;
            padding: 0 16px !important;
            border-radius: 14px !important;
          }
          .pp-nav-links,
          .pp-nav-auth {
            display: none !important;
          }
          .pp-hamburger {
            display: flex !important;
          }

          /* --- HERO --- */
          .pp-hero-grid {
            gap: 32px !important;
          }
          .pp-hero-visual {
            height: 280px !important;
          }
          .pp-hero-btns {
            flex-direction: column !important;
          }
          .pp-hero-btns .pp-btn-hero,
          .pp-hero-btns .pp-btn-outline {
            width: 100%;
            justify-content: center;
            padding: 14px 20px !important;
            font-size: 15px !important;
          }
          .pp-hero-stats {
            gap: 24px !important;
          }

          /* --- CATEGORIES --- */
          .pp-cat-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          /* --- FEATURED VOUCHERS --- */
          .pp-feat-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          /* --- STEPS --- */
          .pp-steps-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }

          /* --- CTA --- */
          .pp-cta-card {
            padding: 40px 20px !important;
            border-radius: 16px !important;
          }
          .pp-cta-btns {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .pp-cta-btns .pp-btn-gold,
          .pp-cta-btns .pp-btn-ghost {
            width: 100%;
            justify-content: center;
            padding: 16px 24px !important;
            font-size: 15px !important;
          }

          /* --- PROGRESS CARD --- */
          .pp-progress-card {
            padding: 20px !important;
          }
        }

        /* Small mobile: below 400px */
        @media (max-width: 400px) {
          .pp-nav {
            top: 8px !important;
            width: calc(100% - 16px) !important;
            height: 48px !important;
            padding: 0 12px !important;
            border-radius: 12px !important;
          }
          .pp-hero-visual {
            height: 220px !important;
          }
          .pp-hero-stats {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .pp-voucher-main {
            width: 200px !important;
            padding: 16px !important;
          }
          .pp-voucher-main p[style*="fontSize: 24"] {
            font-size: 18px !important;
          }
          .pp-voucher-points {
            width: 170px !important;
            padding: 16px !important;
          }
          .pp-voucher-points p[style*="fontSize: 24"] {
            font-size: 18px !important;
          }
        }

        /* Disable 3D tilt on touch devices to prevent stuck transforms */
        @media (hover: none) and (pointer: coarse) {
          .pp-tilt-card {
            transform: none !important;
            transition: box-shadow 0.3s ease !important;
          }
          .pp-voucher-main {
            transform: rotate(-6deg) !important;
          }
          .pp-voucher-points {
            transform: rotate(3deg) !important;
          }
        }
      `}</style>
    </div>
  );
};

const mobileMenuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  padding: '16px 20px',
  background: 'transparent',
  border: 'none',
  borderRadius: 12,
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: 16,
  color: '#1a1c1c',
  cursor: 'pointer',
  transition: 'background 0.15s',
  textAlign: 'left',
};

export default LandingPage;