import{getServerSupabase}from'@/app/lib/supabaseServer'
import{Suspense}from'react'
import FilterBar from'@/app/components/FilterBar'
import EventPill from'@/app/components/EventPill'

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
// event_time + timezone omitted until ALTER TABLE migration has been run
const CALENDAR_FIELDS='id,title,date,location,category,entity,office,description'
const RECENT_FIELDS='id,title,date,description,category,entity,office'

const nextMonthFirstStr=month===12?`${year+1}-01-01`:`${year}-${pad(month+1)}-01`

let calQuery=supabase.from('events').select(CALENDAR_FIELDS)
.gte('date',firstDateStr)
.lt('date',nextMonthFirstStr)
if(search)calQuery=calQuery.ilike('title','%'+search+'%')
if(category)calQuery=calQuery.eq('category',category)
if(entity)calQuery=calQuery.eq('entity',entity)
if(office)calQuery=calQuery.eq('office',office)

// Run calendar events + recent events in parallel
const[{data:events},{data:recentEvents}]=await Promise.all([
calQuery,
supabase.from('events').select(RECENT_FIELDS).order('date',{ascending:false}).limit(6)
])

// Preview images depend on event IDs — run immediately after events resolve
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


<div className='page-padding' style={{padding:'20px 24px'}}>
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
<span style={{fontSize:'12px',color:'#6B7280'}}>{events?.length||0} events</span>
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
<div key={i} style={{borderRight:'1px solid #F3F4F6',borderBottom:'1px solid #F3F4F6',padding:'6px',minHeight:'90px',background:cell.date===todayStr?'#FFF7F0':cell.day?'#ffffff':'#FAFAFA',opacity:cell.day?1:.4}}>
{cell.day&&(
<>
<div style={{fontSize:'11.5px',fontWeight:cell.date===todayStr?700:500,color:cell.date===todayStr?'#FF6B00':'#6B7280',marginBottom:'3px'}}>{cell.day}</div>
{(eventsByDate[cell.date!]||[]).map((ev:any,ei:number)=>(
<EventPill key={ev.id} ev={{...ev,firstImage:firstImageByEvent[ev.id]}} color={evColors[ei%evColors.length]}/>
))}
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
<a key={ev.id} href={'/events/'+ev.id} style={{textDecoration:'none',display:'block',background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'10px',padding:'12px 14px'}}>
<div style={{fontSize:'11px',color:'#FF6B00',fontWeight:500,marginBottom:'3px'}}>{dateLabel}</div>
<div style={{fontSize:'14px',fontWeight:600,color:'#1A1A1A',marginBottom:'4px',lineHeight:1.3}}>{ev.title}</div>
{ev.location&&<div style={{fontSize:'12px',color:'#6B7280',marginBottom:'4px'}}>📍 {ev.location}</div>}
<div style={{display:'flex',gap:'5px',flexWrap:'wrap' as const}}>
{ev.category&&<span style={{fontSize:'10px',background:'#FFE4D1',color:'#E65C00',padding:'1px 8px',borderRadius:'999px',fontWeight:500}}>{ev.category}</span>}
{ev.entity&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6B7280',padding:'1px 8px',borderRadius:'999px'}}>{ev.entity}</span>}
</div>
</a>
)
})}
</div>
):(
<div style={{padding:'32px',textAlign:'center' as const,color:'#9CA3AF',fontSize:'13px'}}>No events this month</div>
)}
</div>
</div>

</div>

<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'.07em',color:'#6B7280',marginBottom:'12px'}}>Recent events</div>
<div className='events-grid' style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
{recentEvents?.map((ev:any)=>(
<a key={ev.id} href={'/events/'+ev.id} style={{textDecoration:'none'}}>
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'10px',padding:'14px'}}>
<div style={{fontSize:'11px',color:'#E65C00',fontWeight:500,marginBottom:'4px'}}>{new Date(ev.date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</div>
<div style={{fontSize:'13.5px',fontWeight:600,color:'#1A1A1A',marginBottom:'4px',lineHeight:1.3}}>{ev.title}</div>
{ev.description&&<div style={{fontSize:'12px',color:'#6B7280',lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const}}>{ev.description}</div>}
<div style={{display:'flex',gap:'5px',marginTop:'8px',flexWrap:'wrap' as const}}>
{ev.category&&<span style={{fontSize:'10px',background:'#FFE4D1',color:'#E65C00',padding:'1px 8px',borderRadius:'999px',fontWeight:500}}>{ev.category}</span>}
{ev.entity&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6B7280',padding:'1px 8px',borderRadius:'999px'}}>{ev.entity}</span>}
{ev.office&&<span style={{fontSize:'10px',background:'#F3F4F6',color:'#6B7280',padding:'1px 8px',borderRadius:'999px'}}>{ev.office}</span>}
</div>
</div>
</a>
))}
</div>
</div>
</div>
)
}
