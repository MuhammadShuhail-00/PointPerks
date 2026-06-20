import React, { useRef } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Menu } from 'primereact/menu';
import { Divider } from 'primereact/divider';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import useAuth from '../../hooks/useAuth';

const UserLayout = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', icon: 'pi pi-home', command: () => navigate('/dashboard') },
    { label: 'Vouchers', icon: 'pi pi-ticket', command: () => navigate('/vouchers') },
    { label: 'My Redemptions', icon: 'pi pi-check-circle', command: () => navigate('/my-redemptions') },
    { label: 'Points', icon: 'pi pi-star', command: () => navigate('/points-history') },
    { label: 'Referral', icon: 'pi pi-share-alt', command: () => navigate('/referral') },
  ];

  const userMenuItems = [
    { label: user?.name, disabled: true, style: { fontWeight: 'bold' } },
    { separator: true },
    { label: 'Profile', icon: 'pi pi-user', command: () => navigate('/profile') },
    { label: 'My Points', icon: 'pi pi-star', command: () => navigate('/points-history') },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: handleLogout },
  ];

  const end = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span className="p-overlay-badge" style={{ cursor: 'pointer' }}
        onClick={() => navigate('/points-history')}>
        <i className="pi pi-star" style={{ fontSize: '1.2rem', color: '#f59e0b' }} />
        <Badge value={user?.points || 0} severity="warning" />
      </span>
      <Avatar
        label={user?.name?.[0]?.toUpperCase()}
        image={user?.avatar}
        shape="circle"
        style={{ cursor: 'pointer', backgroundColor: '#6366f1', color: '#fff' }}
        onClick={(e) => menuRef.current.toggle(e)}
      />
      <Menu model={userMenuItems} popup ref={menuRef} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Menubar model={navItems} end={end} style={{ borderRadius: 0, position: 'sticky', top: 0, zIndex: 100 }} />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
