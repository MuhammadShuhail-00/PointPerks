import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import toast from 'react-hot-toast';
import { voucherAPI } from '../../services/api';
import { formatDate, formatDiscount, categoryColors } from '../../utils/helpers';

const ManageVouchers = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = () => {
    setLoading(true);
    voucherAPI.getAll({ search: search || undefined, showExpired: 'true', limit: 100 })
      .then((res) => setVouchers(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handle = setTimeout(fetchData, 300);
    return () => clearTimeout(handle);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = async (id) => {
    try {
      await voucherAPI.toggle(id);
      toast.success('Voucher status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = (voucher) => {
    confirmDialog({
      message: `Delete "${voucher.title}"? This cannot be undone.`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await voucherAPI.delete(voucher._id);
          toast.success('Voucher removed');
          fetchData();
        } catch {
          toast.error('Failed to delete');
        }
      },
    });
  };

  const discountBody = (row) => formatDiscount(row.discountType, row.discountValue);
  const categoryBody = (row) => <Tag value={row.category} severity={categoryColors[row.category]} />;
  const redeemedBody = (row) => (
    <span>{row.redeemedCount}{row.totalLimit ? ` / ${row.totalLimit}` : ''}</span>
  );
  const statusBody = (row) => (
    <InputSwitch checked={row.isActive} onChange={() => handleToggle(row._id)} />
  );
  const expiryBody = (row) => formatDate(row.expiryDate);
  const actionsBody = (row) => (
    <div style={{ display: 'flex', gap: '0.4rem' }}>
      <Button icon="pi pi-pencil" rounded text severity="secondary"
        onClick={() => navigate(`/admin/vouchers/${row._id}/edit`)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(row)} />
    </div>
  );

  return (
    <div>
      <ConfirmDialog />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Manage vouchers</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>{vouchers.length} vouchers total</p>
        </div>
        <Button label="Add voucher" icon="pi pi-plus" onClick={() => navigate('/admin/vouchers/new')}
          style={{ background: 'var(--brand-600)', border: 'none', borderRadius: 10, fontWeight: 600 }} />
      </div>

      <div className="vx-card" style={{ padding: '1.25rem' }}>
        <span className="p-input-icon-left" style={{ display: 'block', marginBottom: '1.25rem', maxWidth: 320 }}>
          <i className="pi pi-search" />
          <InputText value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vouchers..." className="w-full" style={{ paddingLeft: '2.5rem' }} />
        </span>

        <DataTable value={vouchers} loading={loading} paginator rows={10}
          emptyMessage="No vouchers found" stripedRows responsiveLayout="scroll">
          <Column field="title" header="Title" style={{ minWidth: 200 }} />
          <Column field="merchant" header="Merchant" style={{ minWidth: 150 }} />
          <Column header="Category" body={categoryBody} />
          <Column header="Discount" body={discountBody} />
          <Column header="Redeemed" body={redeemedBody} />
          <Column header="Expiry" body={expiryBody} />
          <Column header="Active" body={statusBody} />
          <Column header="Actions" body={actionsBody} style={{ width: 100 }} />
        </DataTable>
      </div>
    </div>
  );
};

export default ManageVouchers;
