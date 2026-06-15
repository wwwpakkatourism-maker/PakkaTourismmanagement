import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtK = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

const MOCK_DATA = {
  revenue:     { thisMonth: 4260000, lastMonth: 3600000, growth: 18.4 },
  bookings:    { total: 1247, thisMonth: 89 },
  leads:       { total: 324, converted: 89, lost: 42 },
  pendingPay:  { total: 840000, count: 12 },
  trend: [
    { month: 'Jan', revenue: 2800000 }, { month: 'Feb', revenue: 3100000 },
    { month: 'Mar', revenue: 2750000 }, { month: 'Apr', revenue: 3600000 },
    { month: 'May', revenue: 4260000 }, { month: 'Jun', revenue: 0 },
  ],
  funnel: [
    { stage: 'New Inquiry', count: 324, color: '#60A5FA' },
    { stage: 'In Progress', count: 218, color: '#A78BFA' },
    { stage: 'Quote Sent',  count: 156, color: '#FBBF24' },
    { stage: 'Advance Paid',count: 98,  color: '#FB923C' },
    { stage: 'Confirmed',   count: 89,  color: '#34D399' },
    { stage: 'Lost',        count: 42,  color: '#F87171' },
  ],
  destinations: [
    { name: 'Himachal Pradesh', revenue: 1200000, bookings: 312 },
    { name: 'Kerala',           revenue: 980000,  bookings: 245 },
    { name: 'Rajasthan',        revenue: 870000,  bookings: 198 },
    { name: 'Goa',              revenue: 620000,  bookings: 187 },
    { name: 'International',    revenue: 590000,  bookings: 89 },
  ],
  performance: [
    { name: 'Priya S.',  conversions: 28, revenue: 1200000 },
    { name: 'Rahul M.',  conversions: 24, revenue: 980000 },
    { name: 'Anjali K.', conversions: 19, revenue: 760000 },
    { name: 'Sanjay R.', conversions: 15, revenue: 610000 },
    { name: 'Nisha P.',  conversions: 11, revenue: 480000 },
  ],
  revenue_split: [
    { name: 'Domestic', value: 40, color: '#3B82F6' },
    { name: 'International', value: 25, color: '#10B981' },
    { name: 'MICE', value: 20, color: '#8B5CF6' },
    { name: 'Ancillary', value: 15, color: '#F59E0B' },
  ],
  alerts: [
    { type: 'warning', msg: '3 bookings have overdue payments — ₹1.2L pending' },
    { type: 'success', msg: 'Q2 target achieved — 108% conversion rate' },
    { type: 'info',    msg: 'Pricing update: Himalayan packages up ₹500 for peak season' },
    { type: 'danger',  msg: 'Vendor Sunrise Hotels payment overdue by 14 days' },
  ]
};

const ALERT_STYLE = {
  warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', icon: '⚠️' },
  success: { bg: '#ECFDF5', border: '#A7F3D0', color: '#059669', icon: '✅' },
  info:    { bg: '#F0F9FF', border: '#BAE6FD', color: '#0284C7', icon: 'ℹ️' },
  danger:  { bg: '#FEF2F2', border: '#FEE2E2', color: '#DC2626', icon: '🚨' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const data = MOCK_DATA;

  const kpis = [
    { label:'Gross Revenue',   value: fmtK(data.revenue.thisMonth), change: `↑ ${data.revenue.growth}%`, up: true, icon:'💰', cls:'blue' },
    { label:'Active Bookings', value: data.bookings.thisMonth,       change: `↑ 32 today`, up: true, icon:'📋', cls:'green' },
    { label:'Lead Conversion', value: `${Math.round((data.leads.converted/data.leads.total)*100)}%`, change: '↑ 4.2%', up: true, icon:'🎯', cls:'amber' },
    { label:'Pending Payments',value: fmtK(data.pendingPay.total),  change: `${data.pendingPay.count} bookings`, up: false, icon:'⏳', cls:'red' },
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Real-time business overview · Updated just now</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button className="btn btn-ghost btn-sm">📅 May 2025</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/analytics')}>Full Analytics →</button>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'20px' }}>
        {data.alerts.map((a, i) => {
          const s = ALERT_STYLE[a.type];
          return (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px',
              background: s.bg, border:`1px solid ${s.border}`, borderRadius:'10px',
              fontSize:'13px', color: s.color
            }}>
              <span>{s.icon}</span>
              <span style={{ flex:1 }}>{a.msg}</span>
              <button style={{ border:'none', background:'none', cursor:'pointer', color: s.color, fontSize:'16px', lineHeight:1 }}>×</button>
            </div>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-icon ${k.cls}`} style={{ position:'static', marginBottom:'8px', width:36, height:36 }}>
              <span style={{ fontSize:'18px' }}>{k.icon}</span>
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-footer">
              <span className={`kpi-change ${k.up ? 'up' : 'down'}`}>{k.change}</span>
              <span className="kpi-period">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px', marginBottom:'16px' }}>
        {/* Revenue Trend */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div className="card-title" style={{ marginBottom:0 }}>Revenue Trend</div>
            <span style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>6-month view</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.trend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false}/>
              <Tooltip formatter={v => [fmt(v), 'Revenue']} contentStyle={{ borderRadius:10, border:'1px solid var(--color-border)', background:'var(--color-bg-elevated)', fontSize:12 }}/>
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#revGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Split Donut */}
        <div className="card">
          <div className="card-title">Revenue Split</div>
          <PieChart width={200} height={160} style={{ margin:'0 auto' }}>
            <Pie data={data.revenue_split} cx={95} cy={75} innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
              {data.revenue_split.map((e, i) => <Cell key={i} fill={e.color}/>)}
            </Pie>
            <Tooltip formatter={v => [`${v}%`]} contentStyle={{ borderRadius:10, fontSize:12 }}/>
          </PieChart>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginTop:'8px' }}>
            {data.revenue_split.map(s => (
              <div key={s.name} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: s.color, flexShrink:0 }}/>
                <span style={{ flex:1, color:'var(--color-text-secondary)' }}>{s.name}</span>
                <strong>{s.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
        {/* Lead Funnel */}
        <div className="card">
          <div className="card-title">Lead Pipeline Funnel</div>
          {data.funnel.map((stage, i) => (
            <div key={stage.stage} style={{ marginBottom:'8px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                <span style={{ fontSize:'12px', color:'var(--color-text-secondary)' }}>{stage.stage}</span>
                <span style={{ fontSize:'12px', fontWeight:600 }}>{stage.count}</span>
              </div>
              <div className="progress-wrap">
                <div className="progress-bar" style={{
                  width: `${(stage.count / 324) * 100}%`,
                  background: stage.color, transition:`width ${0.5+i*0.1}s cubic-bezier(0.34,1.56,0.64,1)`
                }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Employee Performance */}
        <div className="card">
          <div className="card-title">Top Sales Performers</div>
          {data.performance.map((emp, i) => (
            <div key={emp.name} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background: i===0?'#F59E0B':i===1?'#94A3B8':'#B45309', display:'grid', placeItems:'center', fontSize:'11px', fontWeight:800, color:'#fff', flexShrink:0 }}>
                {i+1}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:600 }}>{emp.name}</div>
                <div style={{ fontSize:'11px', color:'var(--color-text-muted)' }}>{emp.conversions} conversions · {fmtK(emp.revenue)}</div>
              </div>
              <div className="progress-wrap" style={{ width:'80px' }}>
                <div className="progress-bar progress-blue" style={{ width:`${(emp.conversions/28)*100}%` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Destinations Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="card-title" style={{ margin:0 }}>Top Destinations</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/analytics')}>View All →</button>
        </div>
        <div className="table-wrap">
          <table className="ds-table">
            <thead><tr>
              <th>Destination</th><th>Bookings</th><th>Revenue</th><th>Avg/Booking</th><th>Share</th>
            </tr></thead>
            <tbody>
              {data.destinations.map((d, i) => (
                <tr key={d.name}>
                  <td><div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ fontSize:'18px' }}>{'🏔️🌴🏰🏖️✈️'[i]}</span>
                    <strong>{d.name}</strong>
                  </div></td>
                  <td>{d.bookings}</td>
                  <td className="mono">{fmtK(d.revenue)}</td>
                  <td className="mono">{fmtK(Math.round(d.revenue/d.bookings))}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div className="progress-wrap" style={{ width:'60px' }}>
                        <div className="progress-bar progress-blue" style={{ width:`${(d.revenue/1200000)*100}%` }}/>
                      </div>
                      <span style={{ fontSize:'11px' }}>{Math.round((d.revenue/4260000)*100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div style={{
        marginTop:'16px', background:'linear-gradient(135deg,rgba(37,99,235,0.06),rgba(16,185,129,0.06))',
        border:'1px solid var(--color-accent-border)', borderRadius:'16px', padding:'20px'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
          <span style={{ fontSize:'18px' }}>🤖</span>
          <span style={{ fontWeight:700, fontSize:'14px', color:'var(--color-accent)' }}>AI Insights</span>
          <span style={{ fontSize:'11px', color:'var(--color-text-muted)', marginLeft:'auto' }}>Powered by analytics</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:'12px' }}>
          {[
            { icon:'📈', text:'Revenue is 18.4% above last month. Himalayan packages are driving growth.' },
            { icon:'⚠️', text:'12 leads have been inactive for 7+ days. Consider automated follow-up.' },
            { icon:'💡', text:'Peak season Jun–Aug: Recommend increasing Manali package prices by 12%.' },
            { icon:'🎯', text:'Lead-to-booking conversion is 27.5% — 3.2% above industry average.' },
          ].map((ins, i) => (
            <div key={i} style={{ display:'flex', gap:'10px', padding:'12px', background:'var(--color-bg-surface)', borderRadius:'12px', border:'1px solid var(--color-border)' }}>
              <span style={{ fontSize:'18px', flexShrink:0 }}>{ins.icon}</span>
              <span style={{ fontSize:'12px', color:'var(--color-text-secondary)', lineHeight:1.5 }}>{ins.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
