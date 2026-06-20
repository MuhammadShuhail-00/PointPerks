import React, { useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { Tag } from 'primereact/tag';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import useAuth from '../../hooks/useAuth';

const AdminLayout = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: 'pi pi-chart-bar', command: () => navigate('/admin/dashboard') },
    { label: 'Vouchers', icon: 'pi pi-ticket', command: () => navigate('/admin/vouchers') },
    { label: 'Users', icon: 'pi pi-users', command: () => navigate('/admin/users') },
    { label: 'Redemptions', icon: 'pi pi-list', command: () => navigate('/admin/redemptions') },
    { label: 'Analytics', icon: 'pi pi-chart-line', command: () => navigate('/admin/analytics') },
  ];

  const userMenuItems = [
    { label: 'Logout', icon: 'pi pi-sign-out', command: handleLogout },
  ];

  const start = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <i className="pi pi-shield" style={{ color: '#6366f1', fontSize: '1.3rem' }} />
      <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Admin Panel</span>
      <Tag value="ADMIN" severity="danger" style={{ fontSize: '0.65rem' }} />
    </div>
  );

  const end = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>{user?.name}</span>
      <Avatar
        label={user?.name?.[0]?.toUpperCase()}
        image={user?.avatar}
        shape="circle"
        style={{ cursor: 'pointer', backgroundColor: '#dc2626', color: '#fff' }}
        onClick={(e) => menuRef.current.toggle(e)}
      />
      <Menu model={userMenuItems} popup ref={menuRef} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <Menubar model={navItems} start={start} end={end}
        style={{ borderRadius: 0, position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#1e1b4b', border: 'none' }} />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
