import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef(null);

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

  // ── PDF Export ──
  const exportPDF = async () => {
    setShowPreview(true);
    setExporting(true);

    // Wait for the preview to render
    await new Promise(r => setTimeout(r, 300));

    try {
      const element = previewRef.current;
      if (!element) { setExporting(false); return; }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      // First page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      // Additional pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      pdf.save(`${itin.title.replace(/\s+/g, '_')}_Itinerary.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('❌ PDF export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 className="page-title">Itinerary Builder</h1>
          <p className="page-sub">Day-wise trip planner with PDF export</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? '✏️ Edit' : '👁 Preview'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportPDF} disabled={exporting}>
            {exporting ? '⟳ Exporting…' : '🖨️ Export PDF'}
          </button>
          <button className="btn btn-success btn-sm">💾 Save Template</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'20px' }}>

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
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
                  <div className="card-title" style={{ marginBottom:0 }}>
                    📅 Day {activeDay} — {day?.title || 'Title'}
                  </div>
                  <input className="form-input" style={{ width:'200px', maxWidth:'100%' }} placeholder="Day title…" value={day?.title||''} onChange={e=>updateDay('title',e.target.value)}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'12px' }}>
                  <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={day?.date||''} onChange={e=>updateDay('date',e.target.value)}/></div>
                  <div className="form-group"><label className="form-label">Accommodation</label><input className="form-input" value={day?.accommodation||''} onChange={e=>updateDay('accommodation',e.target.value)}/></div>
                  <div className="form-group"><label className="form-label">Transport</label><input className="form-input" value={day?.transport||''} onChange={e=>updateDay('transport',e.target.value)}/></div>
                  <div className="form-group">
                    <label className="form-label">Meals Included</label>
                    <div style={{ display:'flex', gap:'12px', marginTop:'8px', flexWrap:'wrap' }}>
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
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
                  <div className="card-title" style={{ marginBottom:0 }}>Activities</div>
                  <button className="btn btn-primary btn-sm" onClick={addActivity}>+ Add Activity</button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {(day?.activities||[]).map((act, i) => (
                    <div key={i} style={{ display:'flex', gap:'10px', padding:'12px', background:'var(--color-bg-secondary)', borderRadius:'12px', border:'1px solid var(--color-border)', alignItems:'flex-start', flexWrap:'wrap' }}>
                      <div style={{ fontSize:'24px', marginTop:'4px', flexShrink:0 }}>{ACTIVITY_ICONS[i % ACTIVITY_ICONS.length]}</div>
                      <div style={{ flex:1, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:'8px', minWidth:0 }}>
                        <div className="form-group"><label className="form-label">Time</label><input className="form-input" placeholder="09:00" value={act.time} onChange={e=>{const a=[...day.activities];a[i]={...a[i],time:e.target.value};updateDay('activities',a);}}/></div>
                        <div className="form-group"><label className="form-label">Activity *</label><input className="form-input" placeholder="Activity name" value={act.activity} onChange={e=>{const a=[...day.activities];a[i]={...a[i],activity:e.target.value};updateDay('activities',a);}}/></div>
                        <div className="form-group"><label className="form-label">Duration</label><input className="form-input" placeholder="2h" value={act.duration} onChange={e=>{const a=[...day.activities];a[i]={...a[i],duration:e.target.value};updateDay('activities',a);}}/></div>
                        <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Location & Notes</label><input className="form-input" placeholder="Location / notes" value={act.notes} onChange={e=>{const a=[...day.activities];a[i]={...a[i],notes:e.target.value};updateDay('activities',a);}}/></div>
                      </div>
                      <button className="btn btn-ghost btn-xs" style={{ flexShrink:0, color:'var(--color-danger)' }} onClick={()=>{const a=day.activities.filter((_,j)=>j!==i);updateDay('activities',a);}}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Preview — Professional PDF-ready layout */
            <div ref={previewRef} className="card" style={{ background:'#fff', color:'#1F2937' }}>
              {/* Company Header */}
              <div style={{ textAlign:'center', paddingBottom:'20px', borderBottom:'3px solid #2563EB', marginBottom:'24px' }}>
                <div style={{ fontSize:'28px', fontWeight:800, color:'#1E3A5F', letterSpacing:'-0.02em' }}>🏔️ Pakka Tourism</div>
                <div style={{ fontSize:'11px', color:'#64748B', marginTop:'4px', letterSpacing:'0.06em', textTransform:'uppercase' }}>Your Trusted Travel Partner</div>
              </div>

              {/* Trip Header */}
              <div style={{ textAlign:'center', marginBottom:'24px' }}>
                <div style={{ fontSize:'22px', fontWeight:800, letterSpacing:'-0.02em', color:'#111827' }}>{itin.title}</div>
                <div style={{ fontSize:'14px', color:'#6B7280', marginTop:'6px' }}>📍 {itin.destination} · {itin.days} Days / {itin.days > 1 ? itin.days - 1 : 0} Nights</div>
              </div>

              {/* Day Plans */}
              {itin.dayPlans.slice(0,itin.days).map(d => (
                <div key={d.dayNumber} style={{ marginBottom:'24px', border:'1px solid #E5E7EB', borderRadius:'12px', overflow:'hidden' }}>
                  {/* Day Header */}
                  <div style={{ background:'linear-gradient(135deg, #2563EB, #1D4ED8)', color:'#fff', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px' }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'15px' }}>Day {d.dayNumber}: {d.title}</div>
                      <div style={{ fontSize:'11px', opacity:0.85 }}>{d.date || ''}</div>
                    </div>
                    <div style={{ display:'flex', gap:'12px', fontSize:'11px', opacity:0.9 }}>
                      <span>🏨 {d.accommodation}</span>
                      <span>🚗 {d.transport}</span>
                    </div>
                  </div>

                  {/* Meals Badge */}
                  {d.meals && (
                    <div style={{ padding:'8px 16px', background:'#F0FDF4', borderBottom:'1px solid #E5E7EB', fontSize:'12px', color:'#16A34A', display:'flex', gap:'12px', flexWrap:'wrap' }}>
                      <span style={{ fontWeight:600 }}>🍽️ Meals:</span>
                      {d.meals.breakfast && <span>☕ Breakfast</span>}
                      {d.meals.lunch && <span>🥗 Lunch</span>}
                      {d.meals.dinner && <span>🍜 Dinner</span>}
                      {!d.meals.breakfast && !d.meals.lunch && !d.meals.dinner && <span style={{ color:'#9CA3AF' }}>None included</span>}
                    </div>
                  )}

                  {/* Activities Table */}
                  <div style={{ padding:'12px 16px' }}>
                    {d.activities?.map((act,i) => (
                      <div key={i} style={{ display:'flex', gap:'12px', padding:'10px 0', borderBottom: i < d.activities.length - 1 ? '1px solid #F3F4F6' : 'none', alignItems:'flex-start', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'22px', flexShrink:0 }}>{ACTIVITY_ICONS[i%ACTIVITY_ICONS.length]}</span>
                        <div style={{ minWidth:'50px', flexShrink:0 }}>
                          <div style={{ fontSize:'13px', fontWeight:700, color:'#2563EB' }}>{act.time}</div>
                          {act.duration && act.duration !== '—' && <div style={{ fontSize:'10px', color:'#9CA3AF' }}>{act.duration}</div>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:'13px', fontWeight:600, color:'#111827' }}>{act.activity}</div>
                          {act.location && <div style={{ fontSize:'11px', color:'#6B7280' }}>📍 {act.location}</div>}
                          {act.notes && <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'2px' }}>{act.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Inclusions / Exclusions */}
              <div style={{ borderTop:'2px solid #E5E7EB', paddingTop:'20px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', fontSize:'12px' }}>
                <div>
                  <div style={{ fontWeight:700, marginBottom:'10px', color:'#16A34A', fontSize:'14px' }}>✅ Inclusions</div>
                  {itin.inclusions.map((item,idx) => <div key={idx} style={{ marginBottom:'6px', paddingLeft:'12px', borderLeft:'2px solid #86EFAC', color:'#374151' }}>• {item}</div>)}
                </div>
                <div>
                  <div style={{ fontWeight:700, marginBottom:'10px', color:'#DC2626', fontSize:'14px' }}>❌ Exclusions</div>
                  {itin.exclusions.map((item,idx) => <div key={idx} style={{ marginBottom:'6px', paddingLeft:'12px', borderLeft:'2px solid #FCA5A5', color:'#374151' }}>• {item}</div>)}
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop:'24px', paddingTop:'16px', borderTop:'2px solid #2563EB', textAlign:'center', fontSize:'11px', color:'#6B7280' }}>
                <div style={{ fontWeight:700, color:'#1E3A5F', fontSize:'13px', marginBottom:'4px' }}>Pakka Tourism Pvt. Ltd.</div>
                <div>📍 Mall Road, Manali, HP 175131 · 📞 +91 98765 43210 · ✉️ info@pakkatourism.com</div>
                <div style={{ marginTop:'6px', fontSize:'10px', color:'#9CA3AF' }}>This itinerary is subject to change based on weather and availability. Terms & conditions apply.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
