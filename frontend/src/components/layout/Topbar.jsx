import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard', '/admin': 'Admin Dashboard',
  '/attendance': 'Smart Attendance', '/leads': 'Lead Pipeline',
  '/quotes': 'Quote Builder', '/matrix': 'Tariff Matrix',
  '/pricing': 'Pricing Engine', '/bookings': 'Booking Management',
  '/vendors': 'Vendor Management', '/finance': 'Financial Ledger',
  '/itinerary': 'Itinerary Builder', '/analytics': 'Analytics',
  '/whatsapp': 'WhatsApp Automation', '/exports': 'Excel Export',
  '/settings': 'Settings',
};

export default function Topbar({ onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  const pageTitle = PAGE_TITLES[location.pathname] || 'Pakka Tourism';

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
  };

  const ROLE_COLORS = {
    super_admin: '#7C3AED', admin: '#2563EB', manager: '#059669',
    sales: '#D97706', accounts: '#DC2626'
  };

  return (
    <header className="app-topbar">
      {/* Left */}
      <div className="topbar-left">
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onMenuToggle} aria-label="Toggle menu">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/>
          </svg>
        </button>
        <div>
          <div className="topbar-breadcrumb">Pakka Tourism</div>
          <div className="topbar-page">{pageTitle}</div>
        </div>
      </div>

      {/* Right */}
      <div className="topbar-right">
        {/* Role Badge */}
        <span className="badge" style={{
          background: `${ROLE_COLORS[user?.role]}18`,
          color: ROLE_COLORS[user?.role],
          borderColor: `${ROLE_COLORS[user?.role]}30`,
          fontSize: '11px', fontWeight: 700
        }}>
          {user?.role?.replace('_', ' ').toUpperCase()}
        </span>

        {/* Theme Toggle */}
        <button className="btn btn-ghost btn-icon btn-sm" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
            style={{ position: 'relative' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span style={{
              position:'absolute',top:'-4px',right:'-4px',width:'16px',height:'16px',
              background:'#EF4444',borderRadius:'50%',fontSize:'9px',fontWeight:700,
              color:'#fff',display:'grid',placeItems:'center',border:'2px solid var(--color-bg-surface)'
            }}>3</span>
          </button>

          {notifOpen && (
            <div style={{
              position:'absolute',top:'44px',right:0,width:'300px',
              background:'var(--color-bg-elevated)',border:'1px solid var(--color-border)',
              borderRadius:'16px',boxShadow:'var(--shadow-xl)',zIndex:200,overflow:'hidden'
            }}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--color-border)',
                display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontWeight:600,fontSize:'14px'}}>Notifications</span>
                <button style={{border:'none',background:'none',color:'var(--color-accent)',fontSize:'12px',cursor:'pointer'}}>
                  Mark all read
                </button>
              </div>
              {[
                { avatar:'R', color:'#2563EB', text:'Booking BK-2025-0001 confirmed', time:'2m ago', unread:true },
                { avatar:'P', color:'#059669', text:'Payment ₹84,000 received', time:'15m ago', unread:true },
                { avatar:'A', color:'#D97706', text:'New lead from Indiamart — 50 pax', time:'1h ago', unread:false },
              ].map((n,i) => (
                <div key={i} style={{
                  display:'flex',gap:'10px',padding:'12px 16px',cursor:'pointer',
                  background: n.unread ? 'var(--color-accent-subtle)' : 'transparent',
                  transition:'background 0.1s'
                }}>
                  <div className="avatar avatar-sm" style={{ background: n.color, width:30, height:30 }}>{n.avatar}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{fontSize:'12px',color:'var(--color-text-primary)',lineHeight:1.4}}>{n.text}</div>
                    <div style={{fontSize:'11px',color:'var(--color-text-muted)',marginTop:'2px'}}>{n.time}</div>
                  </div>
                  {n.unread && <div style={{width:7,height:7,borderRadius:'50%',background:'#3B82F6',flexShrink:0,marginTop:4}}/>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div
          className="avatar avatar-blue"
          style={{ background: ROLE_COLORS[user?.role] || '#3B82F6', cursor:'pointer' }}
          onClick={() => navigate('/settings')}
          title={user?.name}
        >
          {(user?.name || 'U')[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
