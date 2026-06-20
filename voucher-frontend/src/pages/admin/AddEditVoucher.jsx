import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import toast from 'react-hot-toast';
import { voucherAPI } from '../../services/api';

const CATEGORY_OPTIONS = [
  { label: 'Food', value: 'food' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Travel', value: 'travel' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Health', value: 'health' },
];

const DISCOUNT_OPTIONS = [
  { label: 'Percentage (%)', value: 'percentage' },
  { label: 'Fixed amount (RM)', value: 'fixed' },
];

const EMPTY_FORM = {
  title: '', description: '', category: 'food', discountType: 'percentage', discountValue: 0,
  originalPrice: null, pointsCost: 0, merchant: '', merchantLogo: '', image: '', terms: '',
  totalLimit: null, perUserLimit: 1, expiryDate: null, isActive: true, isFeatured: false,
};

const AddEditVoucher = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      voucherAPI.getOne(id).then((res) => {
        const v = res.data.voucher;
        setForm({ ...v, expiryDate: v.expiryDate ? new Date(v.expiryDate) : null });
      }).finally(() => setLoading(false));
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => setForm({ ...form, [key]: e.target ? e.target.value : e.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit) {
        await voucherAPI.update(id, payload);
        toast.success('Voucher updated');
      } else {
        await voucherAPI.create(payload);
        toast.success('Voucher created');
      }
      navigate('/admin/vouchers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: '#fff' }}>Loading...</p>;

  const field = (label, children) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div>
      <Button label="Back to vouchers" icon="pi pi-arrow-left" text
        onClick={() => navigate('/admin/vouchers')} style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', paddingLeft: 0 }} />

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>
        {isEdit ? 'Edit voucher' : 'Add new voucher'}
      </h1>

      <form onSubmit={handleSubmit} className="vx-card" style={{ padding: '2rem', maxWidth: 720 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.25rem' }} className="vx-form-grid">
          {field('Title', <InputText value={form.title} onChange={set('title')} required className="w-full" />)}
          {field('Merchant', <InputText value={form.merchant} onChange={set('merchant')} required className="w-full" />)}
        </div>

        {field('Description', <InputTextarea value={form.description} onChange={set('description')} required rows={3} className="w-full" />)}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.25rem' }} className="vx-form-grid">
          {field('Category', <Dropdown value={form.category} options={CATEGORY_OPTIONS} onChange={set('category')} className="w-full" />)}
          {field('Discount type', <Dropdown value={form.discountType} options={DISCOUNT_OPTIONS} onChange={set('discountType')} className="w-full" />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1.25rem' }} className="vx-form-grid-3">
          {field('Discount value', <InputNumber value={form.discountValue} onValueChange={set('discountValue')} className="w-full" />)}
          {field('Points cost', <InputNumber value={form.pointsCost} onValueChange={set('pointsCost')} className="w-full" />)}
          {field('Original price (RM)', <InputNumber value={form.originalPrice} onValueChange={set('originalPrice')} className="w-full" />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1.25rem' }} className="vx-form-grid-3">
          {field('Total limit (blank = unlimited)', <InputNumber value={form.totalLimit} onValueChange={set('totalLimit')} className="w-full" />)}
          {field('Per-user limit', <InputNumber value={form.perUserLimit} onValueChange={set('perUserLimit')} className="w-full" />)}
          {field('Expiry date', <Calendar value={form.expiryDate} onChange={set('expiryDate')} dateFormat="dd/mm/yy" showIcon className="w-full" required />)}
        </div>

        {field('Merchant logo URL', <InputText value={form.merchantLogo} onChange={set('merchantLogo')} className="w-full" />)}
        {field('Terms & conditions', <InputTextarea value={form.terms} onChange={set('terms')} rows={3} className="w-full" />)}

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.value })} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <InputSwitch checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.value })} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Featured</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button type="button" label="Cancel" outlined severity="secondary" onClick={() => navigate('/admin/vouchers')} />
          <Button type="submit" label={isEdit ? 'Save changes' : 'Create voucher'} loading={saving}
            style={{ background: 'var(--brand-600)', border: 'none', borderRadius: 10, fontWeight: 600 }} />
        </div>
      </form>

      <style>{`
        @media (max-width: 600px) {
          .vx-form-grid, .vx-form-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AddEditVoucher;
