import{getServerSupabase}from'@/app/lib/supabaseServer'
import{isAdmin}from'@/app/lib/roles'
import{Suspense}from'react'
import FilterBar from'@/app/components/FilterBar'
import EventPill from'@/app/components/EventPill'
import{allZoneTimes}from'@/app/lib/timezones'

export default async function CalendarPage({searchParams}:any){
const supabase=await getServerSupabase()
const sp=await searchParams
const today=new Date()
const year=sp?.year?parseInt(sp.year):today.getFullYear()
const month=sp?.month?parseInt(sp.month):today.getMonth()+1
const search=sp?.search||''
const category=sp?.category||''
const entity=sp?.entity||''
const office=sp?.office||''

const pad=(n:number)=>String(n).padStart(2,'0')
const lastDayNum=new Date(year,month,0).getDate()
const firstDateStr=`${year}-${pad(month)}-01`
const monthName=new Date(year,month-1,1).toLocaleString('default',{month:'long'})

// Only fetch fields needed by the calendar pill and mobile list
const CALENDAR_FIELDS='id,title,date,event_time,event_end_time,timezone,location,category,entity,office,description'
const RECENT_FIELDS='id,title,date,event_time,timezone,description,category,entity,office'

const nextMonthFirstStr=month===12?`${year+1}-01-01`:`${year}-${pad(month+1)}-01`

let calQuery=supabase.from('events').select(CALENDAR_FIELDS)
.gte('date',firstDateStr)
.lt('date',nextMonthFirstStr)
if(search)calQuery=calQuery.ilike('title','%'+search+'%')
if(category)calQuery=calQuery.eq('category',category)
if(entity)calQuery=calQuery.eq('entity',entity)
if(office)calQuery=calQuery.eq('office',office)

// Run calendar events + recent events + admin check in parallel
const[{data:events,error:calErr},{data:recentEvents,error:recentErr},admin]=await Promise.all([
calQuery,
supabase.from('events').select(RECENT_FIELDS).order('date',{ascending:false}).limit(6),
isAdmin(),
])

// Fetch preview images for calendar EventPill thumbnails
const eventIds=events?.map((e:any)=>e.id)||[]
const{data:previewImages}=eventIds.length>0
?await supabase.from('event_images').select('event_id,image_url').in('event_id',eventIds).order('sort_order').limit(eventIds.length)
:{data:[]}
const firstImageByEvent:Record<string,string>={}
previewImages?.forEach((img:any)=>{if(!firstImageByEvent[img.event_id])firstImageByEvent[img.event_id]=img.image_url})

const eventsByDate:Record<string,any[]>={}
events?.forEach((e:any)=>{
const dateKey=(e.date||'').slice(0,10)
if(!eventsByDate[dateKey])eventsByDate[dateKey]=[]
eventsByDate[dateKey].push(e)
})

const startWday=new Date(year,month-1,1).getDay()
const adjustedStart=startWday===0?6:startWday-1
const totalDays=lastDayNum
const todayStr=`${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`

const days:any[]=[]
for(let i=0;i<adjustedStart;i++)days.push({day:null,date:null})
for(let d=1;d<=totalDays;d++){
const dateStr=year+'-'+String(month).padStart(2,'0')+'-'+String(d).padStart(2,'0')
days.push({day:d,date:dateStr})
}
while(days.length%7!==0)days.push({day:null,date:null})

const prevMonth=month===1?12:month-1
const prevYear=month===1?year-1:year
const nextMonth=month===12?1:month+1
const nextYear=month===12?year+1:year

const buildUrl=(params:Record<string,string>)=>{
const base:Record<string,string>={}
if(year!==today.getFullYear()||month!==today.getMonth()+1){base.year=String(year);base.month=String(month)}
if(search)base.search=search
if(category)base.category=category
if(entity)base.entity=entity
if(office)base.office=office
Object.assign(base,params)
Object.keys(base).forEach(k=>{if(!base[k])delete base[k]})
const qs=Object.entries(base).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&')
return qs?'/?'+qs:'/'
}

const evColors=['#FF6B00','#0F6E56','#534AB7','#C2410C','#15803D']
const sortedEvents=[...(events||[])].sort((a:any,b:any)=>a.date.localeCompare(b.date))

return(
<div>
<Suspense fallback={<div style={{height:'42px',background:'#F3F4F6',borderBottom:'1px solid #E5E7EB'}}/>}>
<FilterBar/>
</Suspense>


<div className="page-padding" style={{padding:"20px 24px"}}>
<div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'16px',flexWrap:'wrap' as const,gap:'12px'}}>
<div>
<h1 style={{fontSize:'21px',fontWeight:700,color:'#1A1A1A',letterSpacing:'-.3px',margin:0}}>Company calendar</h1>
<p style={{fontSize:'12.5px',color:'#6B7280',marginTop:'3px',marginBottom:0}}>Every Gradion moment, in one place.</p>
</div>
</div>

{/* Calendar card — shared nav header + two layouts */}
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'24px'}}>

{/* Month navigation — always visible */}
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'1px solid #F3F4F6',flexWrap:'wrap' as const,gap:'8px'}}>
<div style={{display:'flex',gap:'4px',alignItems:'center'}}>
<a href={buildUrl({year:String(prevYear),month:String(prevMonth)})} style={{width:'28px',height:'28px',border:'1px solid #E5E7EB',borderRadius:'6px',background:'#fff',fontSize:'14px',color:'#374151',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</a>
<a href={buildUrl({year:String(today.getFullYear()),month:String(today.getMonth()+1)})} style={{height:'28px',padding:'0 10px',border:'1px solid #E5E7EB',borderRadius:'6px',background:'#fff',fontSize:'12px',color:'#374151',textDecoration:'none',display:'flex',alignItems:'center'}}>Today</a>
<a href={buildUrl({year:String(nextYear),month:String(nextMonth)})} style={{width:'28px',height:'28px',border:'1px solid #E5E7EB',borderRadius:'6px',background:'#fff',fontSize:'14px',color:'#374151',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>›</a>
</div>
<span style={{fontSize:'15px',fontWeight:600,color:'#1A1A1A'}}>{monthName} {year}</span>
<div style={{display:'flex',alignItems:'center',gap:'10px'}}>
<span style={{fontSize:'12px',color:'#6B7280'}}>{events?.length||0} events</span>
{admin&&<a href='/admin/events/new' style={{background:'#FF6B00',color:'#fff',padding:'4px 12px',borderRadius:'6px',fontSize:'12px',fontWeight:500,textDecoration:'none',whiteSpace:'nowrap' as const}}>+ New</a>}
</div>
</div>

{/* ── Desktop full grid ── */}
<div className='cal-desktop'>
<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'#F9FAFB',borderBottom:'1px solid #F3F4F6'}}>
{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d:string,i:number)=>(
<div key={d} style={{textAlign:'center',padding:'8px 0',fontSize:'10.5px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.05em',color:i>=5?'#FF6B00':'#9CA3AF'}}>{d}</div>
))}
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
{days.map((cell:any,i:number)=>(
<div key={i} style={{borderRight:"1px solid #F3F4F6",borderBottom:"1px solid #F3F4F6",padding:"6px",minHeight:"90px",overflow:"visible",position:"relative",background:cell.date===todayStr?'#FFF7F0':cell.day?'#ffffff':'#FAFAFA',opacity:cell.day?1:.4}}>
{cell.day&&(
<>
<div style={{fontSize:'11.5px',fontWeight:cell.date===todayStr?700:500,color:cell.date===todayStr?'#FF6B00':'#6B7280',marginBottom:'3px'}}>{cell.day}</div>
{(()=>{const ce=eventsByDate[cell.date!]||[];const overflow=ce.length-2;return(<>{ce.slice(0,2).map((ev:any,ei:number)=>(<EventPill key={ev.id} ev={{...ev,firstImage:firstImageByEvent[ev.id]}} color={evColors[ei%evColors.length]}/>))}{overflow>0&&<span className='cal-overflow-pill'>+{overflow} more</span>}</>)})()}
</>
)}
</div>
))}
</div>
</div>

{/* ── Mobile compact view ── */}
<div className='cal-mobile' style={{display:'none'}}>
{/* Mini day grid — dots only */}
<div style={{borderBottom:'1px solid #F3F4F6'}}>
<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'#F9FAFB',borderBottom:'1px solid #F3F4F6'}}>
{['M','T','W','T','F','S','S'].map((d:string,i:number)=>(
<div key={i} style={{textAlign:'center',padding:'6px 0',fontSize:'10px',fontWeight:600,textTransform:'uppercase' as const,color:i>=5?'#FF6B00':'#9CA3AF'}}>{d}</div>
))}
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
{days.map((cell:any,i:number)=>{
const hasEvents=cell.date&&(eventsByDate[cell.date]||[]).length>0
const isToday=cell.date===todayStr
return(
<div key={i} style={{textAlign:'center',padding:'6px 2px',borderRight:'1px solid #F3F4F6',borderBottom:'1px solid #F3F4F6',minHeight:'44px',background:isToday?'#FFF7F0':cell.day?'#ffffff':'#FAFAFA',opacity:cell.day?1:.3,display:'flex',flexDirection:'column' as const,alignItems:'center',gap:'2px'}}>
{cell.day&&(
<>
<span style={{fontSize:'12px',fontWeight:isToday?700:400,color:isToday?'#FF6B00':'#374151'}}>{cell.day}</span>
{hasEvents&&<span style={{width:'5px',height:'5px',borderRadius:'50%',background:'#FF6B00',display:'block'}}/>}
</>
)}
</div>
)
})}
</div>
</div>

{/* Mobile event list */}
<div style={{padding:'14px 16px'}}>
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.06em',color:'#6B7280',marginBottom:'10px'}}>
Events this month ({events?.length||0})
</div>
{sortedEvents.length>0?(
<div style={{display:'flex',flexDirection:'column' as const,gap:'8px'}}>
{sortedEvents.map((ev:any)=>{
const d=new Date(ev.date.slice(0,10)+'T00:00:00')
const dateLabel=d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})
return(
<a key={ev.id} href={'/events/'+ev.id} className='event-card' style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'10px',padding:'12px 14px'}}>
<div style={{fontSize:'11px',color:'#FF6B00',fontWeight:500,marginBottom:'3px'}}>{dateLabel}</div>
<div style={{fontSize:'14px',fontWeight:600,color:'#1A1A1A',marginBottom:'4px',lineHeight:1.3}}>{ev.title}</div>
{ev.location&&<div style={{fontSize:'12px',color:'#6B7280',marginBottom:'4px',display:'flex',alignItems:'center',gap:'4px'}}><svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>{ev.location}</div>}
<div style={{display:'flex',gap:'5px',flexWrap:'wrap' as const}}>
{ev.category&&<span style={{fontSize:'10px',background:'#FFE4D1',color:'#E65C00',padding:'1px 8px',borderRadius:'999px',fontWeight:500}}>{ev.category}</span>}
{ev.entity&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6B7280',padding:'1px 8px',borderRadius:'999px'}}>{ev.entity}</span>}
</div>
</a>
)
})}
</div>
):(
<div className='empty-state'>
<svg width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>
<span>No events this month</span>
</div>
)}
</div>
</div>

</div>

{/* RECENT EVENTS SECTION */}
<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.07em',color:'#6B7280',marginBottom:'12px'}}>Recent events</div>
<div className='recent-events-grid' style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
{recentEvents?.map((ev:any)=>(
<a key={ev.id} href={'/events/'+ev.id} className='event-card'>
<div className='event-card-inner' style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'16px',overflow:'hidden'}}>
<div style={{height:'4px',background:ev.category?['#FF6B00','#0F6E56','#534AB7','#C2410C','#15803D'][Math.abs([...ev.category].reduce((h:number,c:string)=>h*31+c.charCodeAt(0),0))%5]:'#E5E7EB'}}/>
<div style={{padding:'14px'}}>
<div style={{fontSize:'11px',color:'#FF6B00',fontWeight:600,marginBottom:'4px'}}>
{new Date(ev.date.slice(0,10)+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
</div>
<div style={{fontSize:'13.5px',fontWeight:700,color:'#1A1A1A',marginBottom:'4px',lineHeight:1.3}}>{ev.title}</div>
{ev.description&&(
<div style={{fontSize:'12px',color:'#6B7280',lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const,marginBottom:'8px'}}>
{ev.description}
</div>
)}
<div style={{display:'flex',gap:'5px',flexWrap:'wrap' as const}}>
{ev.category&&<span style={{fontSize:'10px',background:'#FFF3EB',color:'#993C1D',padding:'2px 9px',borderRadius:'999px',fontWeight:600}}>{ev.category}</span>}
{ev.entity&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6B7280',padding:'2px 9px',borderRadius:'999px'}}>{ev.entity}</span>}
{ev.office&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6B7280',padding:'2px 9px',borderRadius:'999px'}}>{ev.office}</span>}
</div>
</div>
</div>
</a>
))}
</div>
</div>
</div>
)
}
