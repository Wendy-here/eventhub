export const revalidate=60
import{supabase}from'@/app/lib/supabase'
import{Suspense}from'react'
import FilterBar from'@/app/components/FilterBar'

const CATEGORIES=['Team Building','Workshop','CSR','Culture','Internal','Other']
const ENTITIES=['Vietnam','Thailand','Egypt','Germany']
const OFFICES:Record<string,string[]>={
Vietnam:['Saigon','Hanoi','Can Tho'],
Thailand:['Bangkok'],
Egypt:['Cairo'],
Germany:['Berlin'],
}

export default async function CalendarPage({searchParams}:any){
const sp=await searchParams
const today=new Date()
const year=sp?.year?parseInt(sp.year):today.getFullYear()
const month=sp?.month?parseInt(sp.month):today.getMonth()+1
const search=sp?.search||''
const category=sp?.category||''
const entity=sp?.entity||''
const office=sp?.office||''

const firstDay=new Date(year,month-1,1)
const lastDay=new Date(year,month,0)
const monthName=firstDay.toLocaleString('default',{month:'long'})

let query=supabase.from('events').select('*')
.gte('date',firstDay.toISOString().split('T')[0])
.lte('date',lastDay.toISOString().split('T')[0])
if(search)query=query.ilike('title','%'+search+'%')
if(category)query=query.eq('category',category)
if(entity)query=query.eq('entity',entity)
if(office)query=query.eq('office',office)

const{data:events}=await query
const{data:recentEvents}=await supabase.from('events').select('*').order('date',{ascending:false}).limit(6)

const eventsByDate:Record<string,any[]>={}
events?.forEach((e:any)=>{
if(!eventsByDate[e.date])eventsByDate[e.date]=[]
eventsByDate[e.date].push(e)
})

const startWday=firstDay.getDay()
const adjustedStart=startWday===0?6:startWday-1
const totalDays=lastDay.getDate()
const todayStr=today.toISOString().split('T')[0]

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

return(
<div>
<Suspense fallback={<div style={{height:'42px',background:'#F3F4F6',borderBottom:'1px solid #E5E7EB'}}/>}>
<FilterBar/>
</Suspense>

<div style={{padding:'20px 24px'}}>
<div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'16px',flexWrap:'wrap',gap:'12px'}}>
<div>
<h1 style={{fontSize:'21px',fontWeight:700,color:'#1A1A1A',letterSpacing:'-.3px',margin:0}}>Company calendar</h1>
<p style={{fontSize:'12.5px',color:'#6B7280',marginTop:'3px',marginBottom:0}}>Every Gradion moment, in one place.</p>
</div>
</div>

<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden',marginBottom:'24px'}}>
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'1px solid #F3F4F6',flexWrap:'wrap',gap:'8px'}}>
<div style={{display:'flex',gap:'4px',alignItems:'center'}}>
<a href={buildUrl({year:String(prevYear),month:String(prevMonth)})} style={{width:'28px',height:'28px',border:'1px solid #E5E7EB',borderRadius:'6px',background:'#fff',fontSize:'14px',color:'#374151',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</a>
<a href={buildUrl({year:String(today.getFullYear()),month:String(today.getMonth()+1)})} style={{height:'28px',padding:'0 10px',border:'1px solid #E5E7EB',borderRadius:'6px',background:'#fff',fontSize:'12px',color:'#374151',textDecoration:'none',display:'flex',alignItems:'center'}}>Today</a>
<a href={buildUrl({year:String(nextYear),month:String(nextMonth)})} style={{width:'28px',height:'28px',border:'1px solid #E5E7EB',borderRadius:'6px',background:'#fff',fontSize:'14px',color:'#374151',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>›</a>
</div>
<span style={{fontSize:'15px',fontWeight:600,color:'#1A1A1A'}}>{monthName} {year}</span>
<span style={{fontSize:'12px',color:'#6B7280'}}>{events?.length||0} events</span>
</div>

<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'#F9FAFB',borderBottom:'1px solid #F3F4F6'}}>
{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d:string,i:number)=>(
<div key={d} style={{textAlign:'center',padding:'8px 0',fontSize:'10.5px',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',color:i>=5?'#FF6B00':'#9CA3AF'}}>{d}</div>
))}
</div>

<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
{days.map((cell:any,i:number)=>(
<div key={i} style={{borderRight:'1px solid #F3F4F6',borderBottom:'1px solid #F3F4F6',padding:'6px',minHeight:'90px',background:cell.date===todayStr?'#FFF7F0':cell.day?'#ffffff':'#FAFAFA',opacity:cell.day?1:.4}}>
{cell.day&&(
<>
<div style={{fontSize:'11.5px',fontWeight:cell.date===todayStr?700:500,color:cell.date===todayStr?'#FF6B00':'#6B7280',marginBottom:'3px'}}>{cell.day}</div>
{(eventsByDate[cell.date!]||[]).map((ev:any,ei:number)=>(
<a key={ev.id} href={'/events/'+ev.id} style={{display:'block',padding:'2px 6px',borderRadius:'4px',fontSize:'10.5px',fontWeight:500,marginBottom:'2px',textDecoration:'none',background:evColors[ei%evColors.length],color:'#ffffff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ev.title}</a>
))}
</>
)}
</div>
))}
</div>
</div>

<div style={{fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'.07em',color:'#6B7280',marginBottom:'12px'}}>Recent events</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
{recentEvents?.map((ev:any)=>(
<a key={ev.id} href={'/events/'+ev.id} style={{textDecoration:'none'}}>
<div style={{background:'#ffffff',border:'1px solid #E5E7EB',borderRadius:'10px',padding:'14px'}}>
<div style={{fontSize:'11px',color:'#E65C00',fontWeight:500,marginBottom:'4px'}}>{new Date(ev.date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</div>
<div style={{fontSize:'13.5px',fontWeight:600,color:'#1A1A1A',marginBottom:'4px',lineHeight:1.3}}>{ev.title}</div>
{ev.description&&<div style={{fontSize:'12px',color:'#6B7280',lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{ev.description}</div>}
<div style={{display:'flex',gap:'5px',marginTop:'8px',flexWrap:'wrap'}}>
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