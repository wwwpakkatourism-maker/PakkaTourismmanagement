import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';

const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN');

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const MY_LEADS = [
    { name: 'Rajesh Kumar',    dest: 'Manali',    pax: 8,  stage: 'new_inquiry',     followUp: 'Today 3pm',  priority: 'urgent' },
    { name: 'Priya Sharma',    dest: 'Kerala',    pax: 4,  stage: 'quote_sent',      followUp: 'Tomorrow',   priority: 'high' },
    { name: 'Corporate Group', dest: 'Goa',       pax: 22, stage: 'advance_pending', followUp: 'Today 5pm',  priority: 'urgent' },
    { name: 'Amit & Family',   dest: 'Rajasthan', pax: 6,  stage: 'in_progress',     followUp: 'May 28',     priority: 'medium' },
    { name: 'Suresh Travels',  dest: 'Himachal',  pax: 15, stage: 'confirmed',       followUp: 'Jun 10',     priority: 'high' },
  ];

  const TASKS = [
    { text: 'Send quotation to Rajesh Kumar — Manali 8 pax',    done: false, urgent: true },
    { text: 'Follow up with Corporate Group for Goa advance',   done: false, urgent: true },
    { text: 'Update itinerary for Suresh Travels (Himachal)',    done: false, urgent: false },
    { text: 'Collect balance from Anjali Verma',                 done: true,  urgent: false },
    { text: 'Send booking confirmation to Rohit Party',          done: true,  urgent: false },
  ];

  const STAGE_COLOR = {
    new_inquiry: '#60A5FA', in_progress: '#A78BFA', quote_sent: '#FBBF24',
    advance_pending: '#FB923C', confirmed: '#34D399', finished: '#94A3B8', lost: '#F87171',
  };
  const PRIORITY_STYLE = {
    urgent: { bg: '#FEF2F2', color: '#DC2626', border: '#FEE2E2' },
    high:   { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    medium: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
    low:    { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' },
  };

  return (
    <div className="page-content">
      {/* Greeting Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title" style={{ fontSize: '26px' }}>
          {greeting}, {user?.name?.split(' ')[0] || 'Team'} 👋
        </h1>
        <p className="page-sub">
          {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Here's your workday overview
        </p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '20px' }}>
        {[
          { label: 'My Active Leads',   value: '12',    icon: '🎯', change: '↑ 3 this week', up: true },
          { label: 'Quotes Pending',     value: '5',     icon: '📋', change: '2 expiring soon', up: false },
          { label: 'My Conversions',     value: '28',    icon: '✅', change: '↑ 4 this month', up: true },
          { label: 'Revenue Generated',  value: '₹12L', icon: '💰', change: '↑ 18%', up: true },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{k.icon}</div>
            <div className="kpi-value" style={{ fontSize: '24px' }}>{k.value}</div>
            <span className={`kpi-change ${k.up ? 'up' : 'down'}`} style={{ fontSize: '11px' }}>{k.change}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>

        {/* ── Left: Today's Leads ── */}
        <div>
          {/* Urgent Follow-ups */}
          <div className="card" style={{ marginBottom: '16px', borderLeft: '3px solid #DC2626' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '18px' }}>🔥</span>
              <div className="card-title" style={{ marginBottom: 0, color: '#DC2626' }}>Urgent Follow-ups</div>
              <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>
                {MY_LEADS.filter(l => l.priority === 'urgent').length} urgent
              </span>
            </div>
            {MY_LEADS.filter(l => l.priority === 'urgent').map((lead, i) => {
              const ps = PRIORITY_STYLE[lead.priority];
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                  background: 'var(--color-danger-bg)', borderRadius: '10px', marginBottom: '8px',
                  border: '1px solid var(--color-danger-border)'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{lead.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      📍 {lead.dest} · 👥 {lead.pax} pax · ⏰ {lead.followUp}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-ghost btn-xs" title="WhatsApp" style={{ color: '#25D366' }}>💬</button>
                    <button className="btn btn-ghost btn-xs" title="Call">📞</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* My Pipeline */}
          <div className="table-card">
            <div className="table-toolbar">
              <div className="card-title" style={{ margin: 0 }}>My Leads Pipeline</div>
              <button className="btn btn-primary btn-sm">+ New Lead</button>
            </div>
            <table className="ds-table">
              <thead><tr><th>Client</th><th>Destination</th><th>Pax</th><th>Stage</th><th>Follow-up</th><th>Actions</th></tr></thead>
              <tbody>
                {MY_LEADS.map((lead, i) => {
                  const ps = PRIORITY_STYLE[lead.priority];
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{lead.name}</div>
                        <span style={{
                          fontSize: '10px', padding: '1px 6px', borderRadius: '99px',
                          background: ps.bg, color: ps.color, border: `1px solid ${ps.border}`, fontWeight: 600
                        }}>{lead.priority}</span>
                      </td>
                      <td>📍 {lead.dest}</td>
                      <td style={{ textAlign: 'center' }}><strong>{lead.pax}</strong></td>
                      <td>
                        <span style={{
                          fontSize: '11px', padding: '3px 8px', borderRadius: '99px', fontWeight: 600,
                          background: `${STAGE_COLOR[lead.stage]}18`, color: STAGE_COLOR[lead.stage],
                          border: `1px solid ${STAGE_COLOR[lead.stage]}30`
                        }}>{lead.stage.replace(/_/g, ' ')}</span>
                      </td>
                      <td style={{ fontSize: '12px' }}>⏰ {lead.followUp}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-ghost btn-xs" style={{ color: '#25D366' }}>💬</button>
                          <button className="btn btn-ghost btn-xs">📞</button>
                          <button className="btn btn-ghost btn-xs">✏️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right: Tasks + Attendance ── */}
        <div>
          {/* Today's Attendance */}
          <div className="card" style={{ marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Today's Attendance</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Check In</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-success)' }}>09:02 AM</div>
              </div>
              <div style={{ width: '1px', background: 'var(--color-border)' }} />
              <div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Mode</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>🏢 Office</div>
              </div>
              <div style={{ width: '1px', background: 'var(--color-border)' }} />
              <div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Hours</div>
                <div style={{ fontSize: '16px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {Math.max(0, ((now - new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 2)) / 3600000)).toFixed(1)}h
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              {['Face ID ✓', 'Geo ✓', 'Office ✓'].map(chip => (
                <span key={chip} style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid var(--color-success-border)' }}>{chip}</span>
              ))}
            </div>
          </div>

          {/* Task List */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div className="card-title" style={{ marginBottom: 0 }}>📝 Today's Tasks</div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {TASKS.filter(t => t.done).length}/{TASKS.length} done
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {TASKS.map((task, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px',
                  borderRadius: '8px', background: task.done ? 'var(--color-bg-secondary)' : 'var(--color-bg-surface)',
                  border: `1px solid ${task.urgent && !task.done ? 'var(--color-danger-border)' : 'var(--color-border)'}`,
                  opacity: task.done ? 0.6 : 1,
                }}>
                  <input type="checkbox" checked={task.done} readOnly style={{ marginTop: '2px', accentColor: 'var(--color-success)' }} />
                  <span style={{ fontSize: '12px', lineHeight: 1.5, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
                    {task.text}
                  </span>
                  {task.urgent && !task.done && (
                    <span style={{ fontSize: '9px', fontWeight: 700, background: '#FEF2F2', color: '#DC2626', padding: '1px 5px', borderRadius: '99px', marginLeft: 'auto', flexShrink: 0 }}>URGENT</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card card-sm">
            <div className="card-title">This Month</div>
            {[
              { label: 'Leads Handled',     value: '45',   pct: 80 },
              { label: 'Quotes Sent',       value: '32',   pct: 71 },
              { label: 'Bookings Confirmed', value: '12',   pct: 38 },
              { label: 'Target Progress',    value: '₹12L / ₹15L', pct: 80 },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
                  <span style={{ fontWeight: 600 }}>{s.value}</span>
                </div>
                <div className="progress-wrap">
                  <div className="progress-bar progress-blue" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
