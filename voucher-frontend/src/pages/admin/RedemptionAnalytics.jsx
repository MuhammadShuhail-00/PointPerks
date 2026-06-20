import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { analyticsAPI } from '../../services/api';

const RedemptionAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [overTime, setOverTime] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [userActivity, setUserActivity] = useState([]);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getRedemptionsOverTime({ period: 'daily', days: 30 }),
      analyticsAPI.getCategoryBreakdown(),
      analyticsAPI.getUserActivity(10),
    ]).then(([oRes, cRes, uRes]) => {
      setOverTime(oRes.data.data || []);
      setCategoryData(cRes.data.data || []);
      setUserActivity(uRes.data.users || []);
    }).finally(() => setLoading(false));
  }, []);

  const lineData = {
    labels: overTime.map((d) => d._id),
    datasets: [{
      label: 'Redemptions',
      data: overTime.map((d) => d.count),
      borderColor: '#a78bfa',
      backgroundColor: 'rgba(167,139,250,0.15)',
      tension: 0.35,
      fill: true,
      pointRadius: 0,
    }],
  };

  const lineOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.06)' } },
    },
  };

  const pieData = {
    labels: categoryData.map((c) => c.category),
    datasets: [{
      data: categoryData.map((c) => c.redemptions),
      backgroundColor: ['#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'],
      borderWidth: 0,
    }],
  };

  const pieOptions = {
    plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.8)' } } },
  };

  const rankBody = (row, options) => (
    <div style={{
      width: 26, height: 26, borderRadius: 8, background: 'var(--surface-100)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
    }}>{options.rowIndex + 1}</div>
  );

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <Skeleton height="320px" borderRadius="16px" />
        <Skeleton height="320px" borderRadius="16px" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Analytics</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Redemption trends and engagement.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}
        className="vx-chart-grid">
        <div className="vx-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>Redemptions — last 30 days</h2>
          <Chart type="line" data={lineData} options={lineOptions} style={{ height: 260 }} />
        </div>
        <div className="vx-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>By category</h2>
          <Chart type="doughnut" data={pieData} options={pieOptions} style={{ height: 260 }} />
        </div>
      </div>

      <div className="vx-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>Most active users</h2>
        <DataTable value={userActivity} stripedRows responsiveLayout="scroll" emptyMessage="No activity yet">
          <Column header="#" body={rankBody} style={{ width: 50 }} />
          <Column field="name" header="Name" />
          <Column field="email" header="Email" />
          <Column field="redemptionCount" header="Redemptions" />
          <Column field="referralCount" header="Referrals" />
          <Column field="points" header="Points" />
        </DataTable>
      </div>

      <style>{`@media (max-width: 900px) { .vx-chart-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
};

export default RedemptionAnalytics;
