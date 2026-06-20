import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pointsDialog, setPointsDialog] = useState(null);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [pointsDesc, setPointsDesc] = useState('');

  const fetchData = () => {
    setLoading(true);
    userAPI.getAll({ search: search || undefined, limit: 100 })
      .then((res) => setUsers(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handle = setTimeout(fetchData, 300);
    return () => clearTimeout(handle);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleStatus = async (user) => {
    try {
      await userAPI.toggleStatus(user._id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await userAPI.updateRole(user._id, newRole);
      toast.success(`Role updated to ${newRole}`);
      fetchData();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handlePointsAdjust = async () => {
    try {
      await userAPI.adjustPoints(pointsDialog._id, { points: pointsAmount, description: pointsDesc });
      toast.success('Points adjusted');
      setPointsDialog(null);
      setPointsAmount(0);
      setPointsDesc('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Adjustment failed');
    }
  };

  const userBody = (row) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <Avatar label={row.name?.[0]?.toUpperCase()} image={row.avatar} shape="circle"
        style={{ backgroundColor: 'var(--brand-100)', color: 'var(--brand-700)' }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{row.name}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>{row.email}</div>
      </div>
    </div>
  );
  const roleBody = (row) => (
    <Tag value={row.role} severity={row.role === 'admin' ? 'danger' : 'info'} style={{ cursor: 'pointer' }}
      onClick={() => handleRoleToggle(row)} />
  );
  const pointsBody = (row) => (
    <Button label={`${row.points} pts`} link onClick={() => setPointsDialog(row)} style={{ padding: 0, fontWeight: 600 }} />
  );
  const statusBody = (row) => (
    <Tag value={row.isActive ? 'Active' : 'Inactive'} severity={row.isActive ? 'success' : 'secondary'} />
  );
  const joinedBody = (row) => formatDate(row.createdAt);
  const actionsBody = (row) => (
    <Button label={row.isActive ? 'Deactivate' : 'Activate'} size="small" outlined
      severity={row.isActive ? 'danger' : 'success'} onClick={() => handleToggleStatus(row)} />
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Manage users</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>{users.length} registered users</p>
      </div>

      <div className="vx-card" style={{ padding: '1.25rem' }}>
        <span className="p-input-icon-left" style={{ display: 'block', marginBottom: '1.25rem', maxWidth: 320 }}>
          <i className="pi pi-search" />
          <InputText value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..." className="w-full" style={{ paddingLeft: '2.5rem' }} />
        </span>

        <DataTable value={users} loading={loading} paginator rows={10}
          emptyMessage="No users found" stripedRows responsiveLayout="scroll">
          <Column header="User" body={userBody} style={{ minWidth: 220 }} />
          <Column header="Role" body={roleBody} />
          <Column header="Points" body={pointsBody} />
          <Column field="referralCount" header="Referrals" />
          <Column header="Status" body={statusBody} />
          <Column header="Joined" body={joinedBody} />
          <Column header="Actions" body={actionsBody} style={{ width: 140 }} />
        </DataTable>
      </div>

      <Dialog visible={!!pointsDialog} onHide={() => setPointsDialog(null)}
        header={`Adjust points — ${pointsDialog?.name}`} style={{ width: '90vw', maxWidth: 400 }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Points (negative to deduct)
          </label>
          <InputNumber value={pointsAmount} onValueChange={(e) => setPointsAmount(e.value)} className="w-full" />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Reason</label>
          <InputText value={pointsDesc} onChange={(e) => setPointsDesc(e.target.value)}
            placeholder="e.g. Customer support adjustment" className="w-full" />
        </div>
        <Button label="Apply adjustment" onClick={handlePointsAdjust} className="w-full"
          style={{ background: 'var(--ink-900)', border: 'none', borderRadius: 10 }} />
      </Dialog>
    </div>
  );
};

export default ManageUsers;
