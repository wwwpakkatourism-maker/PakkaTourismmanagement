import React, { useState } from 'react';

const ACTIVITY_ICONS = ['🚗','🏨','🥾','🌊','🏔️','🎭','🍜','🛺','⛵','🚠','🎪','🌅'];

const DEFAULT_ITINERARY = {
  title: 'Manali Adventure Package',
  destination: 'Manali, Himachal Pradesh',
  days: 3,
  dayPlans: [
    {
      dayNumber: 1, title: 'Arrival & Solang Valley', date:'2025-06-15',
      accommodation: 'Sunrise Hotel, Mall Road',
      meals: { breakfast:false, lunch:true, dinner:true },
      activities: [
        { time:'14:00', activity:'Arrival at Manali', location:'Volvo Bus Stand', duration:'—', notes:'Pick up and transfer to hotel' },
        { time:'16:00', activity:'Solang Valley Visit', location:'Solang Valley', duration:'3h', notes:'Snow activities if available' },
        { time:'20:00', activity:'Welcome Dinner', location:'Khyber Restaurant', duration:'1.5h', notes:'Authentic Himachali cuisine' },
      ],
      transport:'Tempo Traveller',
    },
    {
      dayNumber: 2, title: 'Rohtang Pass Excursion', date:'2025-06-16',
      accommodation: 'Sunrise Hotel, Mall Road',
      meals: { breakfast:true, lunch:true, dinner:true },
      activities: [
        { time:'06:00', activity:'Early Departure for Rohtang', location:'Hotel Pickup', duration:'—', notes:'Early start to beat traffic (Permit required)' },
        { time:'10:00', activity:'Rohtang Pass Snow Play', location:'Rohtang Pass (3978m)', duration:'4h', notes:'Snow activities, photography' },
        { time:'15:00', activity:'Return to Manali', location:'Mall Road', duration:'—', notes:'Shopping at local market' },
      ],
      transport:'Jeep (Permit Included)',
    },
    {
      dayNumber: 3, title: 'Old Manali & Departure', date:'2025-06-17',
      accommodation: '—',
      meals: { breakfast:true, lunch:false, dinner:false },
      activities: [
        { time:'09:00', activity:'Old Manali Temples', location:'Hadimba Temple, Manu Temple', duration:'2h', notes:'Ancient temples and cedar forest' },
        { time:'12:00', activity:'Volvo Bus Departure', location:'HRTC Bus Stand', duration:'—', notes:'Drop off at bus stand' },
      ],
      transport:'Hotel Vehicle',
    },
  ],
  inclusions: ['Hotel accommodation (2 nights)', '2 Jeeps for sightseeing', 'All meals as per plan', 'Rohtang Pass permit', 'Driver & guide charges'],
  exclusions:  ['Personal expenses', 'Adventure activities charges', 'Tips', 'Any medical emergencies'],
};

export default function ItineraryBuilder() {
  const [itin, setItin] = useState(DEFAULT_ITINERARY);
  const [activeDay, setActiveDay] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  const day = itin.dayPlans.find(d => d.dayNumber === activeDay);

  const updateDay = (field, value) => {
    setItin(p => ({
      ...p,
      dayPlans: p.dayPlans.map(d => d.dayNumber === activeDay ? { ...d, [field]: value } : d)
    }));
  };

  const addActivity = () => {
    updateDay('activities', [...(day?.activities || []), { time:'', activity:'', location:'', duration:'', notes:'' }]);
  };

  return (
    <div className="page-content">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 className="page-title">Itinerary Builder</h1>
          <p className="page-sub">Drag-and-drop day-wise trip planner with PDF export</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? '✏️ Edit' : '👁 Preview'}
          </button>
          <button className="btn btn-primary btn-sm">🖨️ Export PDF</button>
          <button className="btn btn-success btn-sm">💾 Save Template</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'20px' }}>

        {/* ── Left: Day Selector + Trip Info ── */}
        <div>
          <div className="card" style={{ marginBottom:'16px' }}>
            <div className="card-title">Trip Details</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={itin.title} onChange={e=>setItin(p=>({...p,title:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Destination</label><input className="form-input" value={itin.destination} onChange={e=>setItin(p=>({...p,destination:e.target.value}))}/></div>
              <div className="form-group">
                <label className="form-label">Duration (Days)</label>
                <select className="form-select" value={itin.days} onChange={e=>setItin(p=>({...p,days:parseInt(e.target.value)}))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(d=><option key={d} value={d}>{d} Day{d>1?'s':''}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Day Selector */}
          <div className="card">
            <div className="card-title">Day Selector</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {itin.dayPlans.slice(0, itin.days).map(d => (
                <button key={d.dayNumber} onClick={() => setActiveDay(d.dayNumber)}
                  style={{
                    display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
                    borderRadius:'10px', border:`1.5px solid ${activeDay===d.dayNumber?'var(--color-accent)':'var(--color-border)'}`,
                    background: activeDay===d.dayNumber?'var(--color-accent-subtle)':'var(--color-bg-surface)',
                    cursor:'pointer', textAlign:'left', transition:'all 0.15s'
                  }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background: activeDay===d.dayNumber?'var(--color-accent)':'var(--color-bg-secondary)', display:'grid', placeItems:'center', fontWeight:700, fontSize:'12px', color: activeDay===d.dayNumber?'#fff':'var(--color-text-primary)', flexShrink:0 }}>
                    {d.dayNumber}
                  </div>
                  <div>
                    <div style={{ fontSize:'12px', fontWeight:600, color: activeDay===d.dayNumber?'var(--color-accent)':'var(--color-text-primary)' }}>{d.title || `Day ${d.dayNumber}`}</div>
                    <div style={{ fontSize:'10px', color:'var(--color-text-muted)' }}>{d.activities?.length||0} activities</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Day Editor / Preview ── */}
        <div>
          {!showPreview ? (
            /* Editor */
            <div>
              <div className="card" style={{ marginBottom:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                  <div className="card-title" style={{ marginBottom:0 }}>
                    📅 Day {activeDay} — {day?.title || 'Title'}
                  </div>
                  <input className="form-input" style={{ width:'200px' }} placeholder="Day title…" value={day?.title||''} onChange={e=>updateDay('title',e.target.value)}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={day?.date||''} onChange={e=>updateDay('date',e.target.value)}/></div>
                  <div className="form-group"><label className="form-label">Accommodation</label><input className="form-input" value={day?.accommodation||''} onChange={e=>updateDay('accommodation',e.target.value)}/></div>
                  <div className="form-group"><label className="form-label">Transport</label><input className="form-input" value={day?.transport||''} onChange={e=>updateDay('transport',e.target.value)}/></div>
                  <div className="form-group">
                    <label className="form-label">Meals Included</label>
                    <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                      {['breakfast','lunch','dinner'].map(m => (
                        <label key={m} style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', cursor:'pointer' }}>
                          <input type="checkbox" checked={day?.meals?.[m]||false} onChange={e=>updateDay('meals',{...day?.meals,[m]:e.target.checked})}/>
                          {m}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                  <div className="card-title" style={{ marginBottom:0 }}>Activities</div>
                  <button className="btn btn-primary btn-sm" onClick={addActivity}>+ Add Activity</button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {(day?.activities||[]).map((act, i) => (
                    <div key={i} style={{ display:'flex', gap:'10px', padding:'12px', background:'var(--color-bg-secondary)', borderRadius:'12px', border:'1px solid var(--color-border)', alignItems:'flex-start' }}>
                      <div style={{ fontSize:'24px', marginTop:'4px', flexShrink:0 }}>{ACTIVITY_ICONS[i % ACTIVITY_ICONS.length]}</div>
                      <div style={{ flex:1, display:'grid', gridTemplateColumns:'80px 1fr 120px', gap:'8px' }}>
                        <div className="form-group"><label className="form-label">Time</label><input className="form-input" placeholder="09:00" value={act.time} onChange={e=>{const a=[...day.activities];a[i]={...a[i],time:e.target.value};updateDay('activities',a);}}/></div>
                        <div className="form-group"><label className="form-label">Activity *</label><input className="form-input" placeholder="Activity name" value={act.activity} onChange={e=>{const a=[...day.activities];a[i]={...a[i],activity:e.target.value};updateDay('activities',a);}}/></div>
                        <div className="form-group"><label className="form-label">Duration</label><input className="form-input" placeholder="2h" value={act.duration} onChange={e=>{const a=[...day.activities];a[i]={...a[i],duration:e.target.value};updateDay('activities',a);}}/></div>
                        <div className="form-group" style={{ gridColumn:'2/-1' }}><label className="form-label">Location & Notes</label><input className="form-input" placeholder="Location / notes" value={act.notes} onChange={e=>{const a=[...day.activities];a[i]={...a[i],notes:e.target.value};updateDay('activities',a);}}/></div>
                      </div>
                      <button className="btn btn-ghost btn-xs" style={{ flexShrink:0, color:'var(--color-danger)' }} onClick={()=>{const a=day.activities.filter((_,j)=>j!==i);updateDay('activities',a);}}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Preview */
            <div className="card">
              <div style={{ textAlign:'center', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid var(--color-border)' }}>
                <div style={{ fontSize:'22px', fontWeight:800, letterSpacing:'-0.02em' }}>{itin.title}</div>
                <div style={{ fontSize:'13px', color:'var(--color-text-muted)', marginTop:'4px' }}>📍 {itin.destination} · {itin.days} Days</div>
              </div>
              {itin.dayPlans.slice(0,itin.days).map(d => (
                <div key={d.dayNumber} style={{ marginBottom:'24px', paddingLeft:'16px', borderLeft:'3px solid var(--color-accent)' }}>
                  <div style={{ fontWeight:700, fontSize:'15px', marginBottom:'4px' }}>Day {d.dayNumber}: {d.title}</div>
                  <div style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'10px' }}>
                    🏨 {d.accommodation} · 🚗 {d.transport}
                    {d.meals && ` · Meals: ${Object.entries(d.meals).filter(([,v])=>v).map(([k])=>k).join(', ') || 'None'}`}
                  </div>
                  {d.activities?.map((act,i) => (
                    <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'8px', fontSize:'13px' }}>
                      <span style={{ color:'var(--color-text-muted)', minWidth:'44px', flexShrink:0 }}>{act.time}</span>
                      <span>{ACTIVITY_ICONS[i%ACTIVITY_ICONS.length]} <strong>{act.activity}</strong> {act.notes && `— ${act.notes}`}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ borderTop:'1px solid var(--color-border)', paddingTop:'16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', fontSize:'12px' }}>
                <div>
                  <div style={{ fontWeight:700, marginBottom:'8px', color:'var(--color-success)' }}>✅ Inclusions</div>
                  {itin.inclusions.map((i,idx) => <div key={idx} style={{ marginBottom:'4px' }}>· {i}</div>)}
                </div>
                <div>
                  <div style={{ fontWeight:700, marginBottom:'8px', color:'var(--color-danger)' }}>❌ Exclusions</div>
                  {itin.exclusions.map((e,idx) => <div key={idx} style={{ marginBottom:'4px' }}>· {e}</div>)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
