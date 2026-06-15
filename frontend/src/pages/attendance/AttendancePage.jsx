import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

const fmt = (h) => {
  const hrs = Math.floor(h);
  const min = Math.round((h - hrs) * 60);
  return `${hrs}h ${min}m`;
};

const MOCK_ATTENDANCE = [
  { date: '2025-05-26', checkIn: '09:02', checkOut: '18:35', hours: 9.5, mode: 'office', status: 'present', faceVerified: true, geoFence: true },
  { date: '2025-05-25', checkIn: '09:15', checkOut: '18:20', hours: 9.1, mode: 'wfh',    status: 'present', faceVerified: true, geoFence: false },
  { date: '2025-05-24', checkIn: '09:30', checkOut: '14:00', hours: 4.5, mode: 'office', status: 'half_day', faceVerified: true, geoFence: true },
  { date: '2025-05-23', checkIn: '10:05', checkOut: '19:10', hours: 9.1, mode: 'office', status: 'late',    faceVerified: true, geoFence: true },
  { date: '2025-05-22', checkIn: '—',    checkOut: '—',     hours: 0,   mode: '—',     status: 'absent',  faceVerified: false, geoFence: false },
  { date: '2025-05-21', checkIn: '09:00', checkOut: '18:00', hours: 9.0, mode: 'office', status: 'present', faceVerified: true, geoFence: true },
];

const STAGE_COLORS = {
  idle:       { color:'#64748B', bg:'#F1F5F9' },
  scanning:   { color:'#2563EB', bg:'#EFF6FF' },
  faceOk:     { color:'#059669', bg:'#ECFDF5' },
  geoCheck:   { color:'#D97706', bg:'#FFFBEB' },
  geoOk:      { color:'#059669', bg:'#ECFDF5' },
  checkedIn:  { color:'#059669', bg:'#ECFDF5' },
  checkedOut: { color:'#475569', bg:'#F1F5F9' },
};

const STATUS_BADGE = {
  present:  'badge-confirmed',
  absent:   'badge-danger',
  half_day: 'badge-warning',
  late:     'badge-info',
  on_leave: 'badge-neutral',
};

export default function AttendancePage() {
  const { user } = useAuthStore();
  const [stage, setStage]       = useState('idle');
  const [scanPct, setScanPct]   = useState(0);
  const [workMode, setWorkMode] = useState('office');
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const runScan = (action) => {
    setStage('scanning');
    setScanPct(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      setScanPct(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(iv);
        setStage('faceOk');
        setTimeout(() => {
          setStage('geoCheck');
          setTimeout(() => {
            setStage('geoOk');
            setTimeout(() => {
              if (action === 'in') {
                setCheckedIn(true);
                setCheckInTime(new Date());
                setStage('checkedIn');
              } else {
                setCheckedIn(false);
                setCheckOutTime(new Date());
                setStage('checkedOut');
              }
            }, 600);
          }, 1000);
        }, 600);
      }
    }, 100);
  };

  const stageInfo = {
    idle:       { label: 'Ready', icon: '👤', desc: 'Press Check-In to begin biometric verification' },
    scanning:   { label: 'Scanning Face…', icon: '🔍', desc: 'Hold still for face recognition' },
    faceOk:     { label: 'Face Verified ✓', icon: '✅', desc: 'Identity confirmed' },
    geoCheck:   { label: 'Verifying Location…', icon: '📡', desc: 'Checking geo-fence boundary' },
    geoOk:      { label: 'Location Verified ✓', icon: '📍', desc: 'You are within the allowed zone' },
    checkedIn:  { label: 'Checked In ✓', icon: '🟢', desc: `Work mode: ${workMode === 'office' ? '🏢 In Office' : '🏠 WFH'}` },
    checkedOut: { label: 'Checked Out ✓', icon: '🔴', desc: 'Have a great evening!' },
  }[stage];

  const sc = STAGE_COLORS[stage] || STAGE_COLORS.idle;
  const totalHours = MOCK_ATTENDANCE.filter(a => a.status === 'present').reduce((s, r) => s + r.hours, 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Smart Attendance</h1>
        <p className="page-sub">AI-powered biometric & geo-fence attendance tracking</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:'20px' }}>

        {/* ── Left: Check-In Panel ── */}
        <div>
          {/* Clock */}
          <div className="card" style={{ textAlign:'center', marginBottom:'16px' }}>
            <div style={{ fontSize:'44px', fontWeight:800, letterSpacing:'-0.04em', color:'var(--color-text-primary)', fontVariantNumeric:'tabular-nums' }}>
              {now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })}
            </div>
            <div style={{ fontSize:'13px', color:'var(--color-text-muted)', marginTop:'4px' }}>
              {now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </div>
          </div>

          {/* Face ID Scanner */}
          <div className="card" style={{ marginBottom:'16px' }}>
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              {/* Face scan circle */}
              <div style={{ position:'relative', width:'140px', height:'140px', margin:'0 auto 16px' }}>
                <svg width="140" height="140" style={{ position:'absolute', inset:0 }}>
                  <circle cx="70" cy="70" r="64" fill="none" stroke="var(--color-border)" strokeWidth="2"/>
                  <circle cx="70" cy="70" r="64" fill="none"
                    stroke={sc.color} strokeWidth="2.5"
                    strokeDasharray={`${2*Math.PI*64*scanPct/100} ${2*Math.PI*64}`}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ transition:'stroke-dasharray 0.1s linear' }}
                  />
                </svg>
                <div style={{
                  position:'absolute', inset:8, borderRadius:'50%',
                  background: sc.bg, display:'grid', placeItems:'center',
                  flexDirection:'column', border:`1px solid ${sc.color}20`
                }}>
                  <div style={{ fontSize:'42px' }}>{stageInfo.icon}</div>
                </div>
              </div>
              <div style={{ fontWeight:700, fontSize:'15px', color: sc.color, marginBottom:'4px' }}>{stageInfo.label}</div>
              <div style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>{stageInfo.desc}</div>
            </div>

            {/* Verification chips */}
            <div style={{ display:'flex', gap:'6px', justifyContent:'center', marginBottom:'16px', flexWrap:'wrap' }}>
              {[
                { label:'Face ID', ok: ['faceOk','geoCheck','geoOk','checkedIn','checkedOut'].includes(stage) },
                { label:'Geo Fence', ok: ['geoOk','checkedIn','checkedOut'].includes(stage) },
                { label: workMode === 'office' ? 'In-Office' : 'WFH', ok: true },
              ].map(chip => (
                <span key={chip.label} style={{
                  padding:'4px 10px', borderRadius:'99px', fontSize:'11px', fontWeight:600,
                  background: chip.ok ? 'var(--color-success-bg)' : 'var(--color-bg-secondary)',
                  color: chip.ok ? 'var(--color-success)' : 'var(--color-text-muted)',
                  border:`1px solid ${chip.ok ? 'var(--color-success-border)' : 'var(--color-border)'}`,
                  transition:'all 0.3s'
                }}>{chip.ok ? '✓ ' : '○ '}{chip.label}</span>
              ))}
            </div>

            {/* Work Mode */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
              {[{v:'office',l:'🏢 In Office'},{v:'wfh',l:'🏠 WFH'}].map(m => (
                <button key={m.v} type="button" onClick={() => setWorkMode(m.v)}
                  className={`btn ${workMode===m.v ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ justifyContent:'center' }}>
                  {m.l}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            {!checkedIn && stage !== 'checkedOut' ? (
              <button
                className="btn btn-success"
                style={{ width:'100%', justifyContent:'center', padding:'12px' }}
                onClick={() => runScan('in')}
                disabled={['scanning','faceOk','geoCheck','geoOk'].includes(stage)}
              >
                {stage === 'idle' ? '🔍 Verify & Check In' : stage === 'scanning' ? '⟳ Scanning…' : '✅ Verified'}
              </button>
            ) : stage === 'checkedIn' ? (
              <button
                className="btn btn-danger"
                style={{ width:'100%', justifyContent:'center', padding:'12px' }}
                onClick={() => runScan('out')}
              >
                🔴 Check Out
              </button>
            ) : (
              <div style={{ textAlign:'center', padding:'12px', background:'var(--color-bg-secondary)', borderRadius:'10px', fontSize:'13px', color:'var(--color-text-muted)' }}>
                ✅ Attendance recorded for today
              </div>
            )}
          </div>

          {/* Today Stats */}
          {checkedIn && (
            <div className="card card-sm">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'11px', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Check In</div>
                  <div style={{ fontSize:'18px', fontWeight:700, color:'var(--color-success)', fontVariantNumeric:'tabular-nums' }}>
                    {checkInTime?.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })}
                  </div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'11px', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Duration</div>
                  <div style={{ fontSize:'18px', fontWeight:700, fontVariantNumeric:'tabular-nums' }}>
                    {fmt((now - checkInTime) / 3600000)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Attendance History ── */}
        <div>
          {/* Stats Row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
            {[
              { label:'Days Present', value:'22', icon:'✅', color:'#059669' },
              { label:'Days Absent',  value:'2',  icon:'❌', color:'#DC2626' },
              { label:'Total Hours',  value:`${totalHours.toFixed(0)}h`, icon:'⏱️', color:'#2563EB' },
              { label:'Avg Hours/Day',value:`${(totalHours/22).toFixed(1)}h`, icon:'📊', color:'#D97706' },
            ].map(s => (
              <div key={s.label} className="card card-sm" style={{ textAlign:'center' }}>
                <div style={{ fontSize:'22px', marginBottom:'4px' }}>{s.icon}</div>
                <div style={{ fontSize:'22px', fontWeight:800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize:'11px', color:'var(--color-text-muted)', marginTop:'2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* History Table */}
          <div className="table-card">
            <div className="table-toolbar">
              <div className="card-title" style={{ margin:0 }}>Attendance History</div>
              <button className="btn btn-ghost btn-sm">📥 Export</button>
            </div>
            <div className="table-wrap">
              <table className="ds-table">
                <thead><tr>
                  <th>Date</th><th>Check In</th><th>Check Out</th>
                  <th>Hours</th><th>Mode</th><th>Face</th><th>Geo</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {MOCK_ATTENDANCE.map((a) => (
                    <tr key={a.date}>
                      <td><span className="mono" style={{ fontSize:'12px' }}>{a.date}</span></td>
                      <td style={{ color:'var(--color-success)', fontWeight:500 }}>{a.checkIn}</td>
                      <td style={{ color:'var(--color-danger)', fontWeight:500 }}>{a.checkOut}</td>
                      <td><strong>{a.hours ? fmt(a.hours) : '—'}</strong></td>
                      <td><span style={{ fontSize:'13px' }}>{a.mode === 'office' ? '🏢' : a.mode === 'wfh' ? '🏠' : '—'}</span> {a.mode}</td>
                      <td><span style={{ color: a.faceVerified ? 'var(--color-success)' : 'var(--color-danger)' }}>{a.faceVerified ? '✓' : '✗'}</span></td>
                      <td><span style={{ color: a.geoFence ? 'var(--color-success)' : 'var(--color-danger)' }}>{a.geoFence ? '✓' : '✗'}</span></td>
                      <td><span className={`badge ${STATUS_BADGE[a.status]}`}>{a.status.replace('_',' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
