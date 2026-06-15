import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN');
const fmtK = n => n>=100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;

const REVENUE_TREND = [
  {month:'Dec',revenue:2100000,bookings:62,leads:190},
  {month:'Jan',revenue:2800000,bookings:78,leads:220},
  {month:'Feb',revenue:3100000,bookings:84,leads:245},
  {month:'Mar',revenue:2750000,bookings:71,leads:208},
  {month:'Apr',revenue:3600000,bookings:94,leads:287},
  {month:'May',revenue:4260000,bookings:103,leads:324},
];
const DEST_DATA = [
  {name:'Himachal',revenue:1280000,bookings:312,color:'#3B82F6'},
  {name:'Kerala',   revenue:980000, bookings:245,color:'#10B981'},
  {name:'Rajasthan',revenue:870000, bookings:198,color:'#8B5CF6'},
  {name:'Goa',      revenue:620000, bookings:187,color:'#F59E0B'},
  {name:'Intl',     revenue:510000, bookings:89, color:'#EF4444'},
];
const HEATMAP_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HEATMAP_WEEKS = 8;
const HEATMAP = Array.from({length:HEATMAP_WEEKS}, () =>
  Array.from({length:7}, () => Math.floor(Math.random()*10))
);
const SOURCE_PIE = [
  {name:'WhatsApp',value:32,color:'#25D366'},
  {name:'Phone',   value:24,color:'#3B82F6'},
  {name:'IndiaMart',value:18,color:'#F97316'},
  {name:'Website', value:14,color:'#8B5CF6'},
  {name:'Referral',value:12,color:'#10B981'},
];
const CONVERSION = [
  {name:'New Inquiry',value:324},
  {name:'In Progress', value:218},
  {name:'Quote Sent',  value:156},
  {name:'Advance Paid',value:98},
  {name:'Confirmed',   value:89},
];

export default function AnalyticsDashboard() {
  return (
    <div className="page-content">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-sub">Business intelligence · Real-time insights</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button className="btn btn-ghost btn-sm">📅 May 2025</button>
          <button className="btn btn-ghost btn-sm">📥 Export Report</button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(5,1fr)', marginBottom:'20px' }}>
        {[
          { label:'Gross Revenue',     value:'₹42.6L', change:'↑18.4%',up:true,  icon:'💰'},
          { label:'Total Bookings',    value:'1,247',   change:'↑89 this month',up:true, icon:'📋'},
          { label:'Active Leads',      value:'324',     change:'↑37 this week',up:true,  icon:'🎯'},
          { label:'Conversion Rate',   value:'27.5%',   change:'↑3.2%',up:true,  icon:'📈'},
          { label:'Avg Booking Value', value:'₹38.4K',  change:'↑₹2.1K',up:true, icon:'💎'},
        ].map(k=>(
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div style={{fontSize:'20px',marginBottom:'4px'}}>{k.icon}</div>
            <div className="kpi-value" style={{fontSize:'22px'}}>{k.value}</div>
            <span className={`kpi-change ${k.up?'up':'down'}`}>{k.change}</span>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px', marginBottom:'16px' }}>
        {/* Revenue + Bookings Combo */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
            <div className="card-title" style={{marginBottom:0}}>Revenue & Booking Trend</div>
            <div style={{ display:'flex', gap:'12px', fontSize:'11px' }}>
              <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                <div style={{ width:10, height:10, background:'#3B82F6', borderRadius:'50%' }}/> Revenue
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                <div style={{ width:10, height:10, background:'#10B981', borderRadius:'50%' }}/> Bookings
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={REVENUE_TREND}>
              <XAxis dataKey="month" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="rev" tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`} tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="bk" orientation="right" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v,name) => name==='revenue'?[fmt(v),'Revenue']:[v,'Bookings']} contentStyle={{borderRadius:10,fontSize:12,border:'1px solid var(--color-border)'}}/>
              <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} dot={{fill:'#3B82F6',r:3}}/>
              <Line yAxisId="bk"  type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={2.5} dot={{fill:'#10B981',r:3}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Source Pie */}
        <div className="card">
          <div className="card-title">Lead Sources</div>
          <PieChart width={200} height={160} style={{margin:'0 auto'}}>
            <Pie data={SOURCE_PIE} cx={95} cy={75} innerRadius={40} outerRadius={72} dataKey="value" stroke="none">
              {SOURCE_PIE.map((e,i) => <Cell key={i} fill={e.color}/>)}
            </Pie>
            <Tooltip formatter={v=>[`${v}%`]} contentStyle={{borderRadius:10,fontSize:12}}/>
          </PieChart>
          <div style={{ display:'flex', flexDirection:'column', gap:'5px', marginTop:'8px' }}>
            {SOURCE_PIE.map(s => (
              <div key={s.name} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:s.color, flexShrink:0 }}/>
                <span style={{ flex:1, color:'var(--color-text-secondary)' }}>{s.name}</span>
                <strong>{s.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'16px' }}>
        {/* Destination Revenue */}
        <div className="card">
          <div className="card-title">Top Destinations</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DEST_DATA} layout="vertical">
              <XAxis type="number" tickFormatter={v=>fmtK(v)} tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:'#64748B'}} axisLine={false} tickLine={false} width={65}/>
              <Tooltip formatter={v=>[fmt(v),'Revenue']} contentStyle={{borderRadius:10,fontSize:12}}/>
              <Bar dataKey="revenue" radius={[0,6,6,0]}>
                {DEST_DATA.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="card">
          <div className="card-title">Lead Conversion Funnel</div>
          {CONVERSION.map((s,i) => (
            <div key={s.name} style={{ marginBottom:'8px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'3px' }}>
                <span style={{ color:'var(--color-text-secondary)' }}>{s.name}</span>
                <span style={{ fontWeight:600 }}>{s.value} <span style={{ color:'var(--color-text-muted)', fontWeight:400 }}>({Math.round((s.value/324)*100)}%)</span></span>
              </div>
              <div className="progress-wrap">
                <div className="progress-bar" style={{ width:`${(s.value/324)*100}%`, background:['#60A5FA','#A78BFA','#FBBF24','#FB923C','#34D399'][i] }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Heatmap */}
        <div className="card">
          <div className="card-title">Booking Activity Heatmap</div>
          <div style={{ display:'flex', gap:'4px', justifyContent:'space-between', marginBottom:'4px' }}>
            {HEATMAP_DAYS.map(d => <div key={d} style={{ flex:1, textAlign:'center', fontSize:'9px', color:'var(--color-text-muted)', fontWeight:600 }}>{d[0]}</div>)}
          </div>
          {Array.from({length:HEATMAP_WEEKS}, (_,wi) => (
            <div key={wi} style={{ display:'flex', gap:'3px', marginBottom:'3px' }}>
              {Array.from({length:7}, (_,di) => {
                const v = HEATMAP[wi][di];
                const opacity = v === 0 ? 0.06 : 0.1 + (v/10)*0.9;
                return <div key={di} title={`${v} bookings`} style={{ flex:1, height:'14px', borderRadius:'2px', background:`rgba(59,130,246,${opacity})` }}/>;
              })}
            </div>
          ))}
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'8px', fontSize:'10px', color:'var(--color-text-muted)' }}>
            <span>Less</span>
            {[0.06,0.25,0.45,0.65,0.85].map((o,i) => <div key={i} style={{ width:10, height:10, borderRadius:'2px', background:`rgba(59,130,246,${o})` }}/>)}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Employee Performance Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="card-title" style={{margin:0}}>👑 Employee Performance Leaderboard</div>
        </div>
        <table className="ds-table">
          <thead><tr><th>Rank</th><th>Agent</th><th>Leads</th><th>Converted</th><th>Rate</th><th>Revenue</th><th>Avg Deal</th></tr></thead>
          <tbody>
            {[
              {rank:1,name:'Priya Sharma',   leads:89, converted:28, revenue:1200000},
              {rank:2,name:'Rahul Mehta',    leads:76, converted:24, revenue:980000},
              {rank:3,name:'Anjali Kapoor',  leads:68, converted:19, revenue:760000},
              {rank:4,name:'Sanjay Rao',     leads:56, converted:15, revenue:610000},
              {rank:5,name:'Nisha Patel',    leads:45, converted:11, revenue:480000},
            ].map(e => (
              <tr key={e.rank}>
                <td>
                  <span style={{ width:24, height:24, borderRadius:'50%', display:'inline-grid', placeItems:'center', fontWeight:800, fontSize:'12px',
                    background: e.rank===1?'#FEF3C7':e.rank===2?'#F1F5F9':e.rank===3?'#FFF7ED':'var(--color-bg-secondary)',
                    color: e.rank===1?'#D97706':e.rank===2?'#64748B':e.rank===3?'#B45309':'var(--color-text-muted)' }}>
                    {e.rank}
                  </span>
                </td>
                <td><strong>{e.name}</strong></td>
                <td>{e.leads}</td>
                <td style={{ color:'var(--color-success)', fontWeight:600 }}>{e.converted}</td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <div className="progress-wrap" style={{ width:'50px' }}>
                      <div className="progress-bar progress-green" style={{ width:`${Math.round((e.converted/e.leads)*100)}%` }}/>
                    </div>
                    <span style={{ fontWeight:600 }}>{Math.round((e.converted/e.leads)*100)}%</span>
                  </div>
                </td>
                <td className="mono" style={{ fontWeight:700, color:'var(--color-accent)' }}>{fmt(e.revenue)}</td>
                <td className="mono">{fmt(Math.round(e.revenue/e.converted))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
